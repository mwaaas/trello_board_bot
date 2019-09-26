import fetch from 'isomorphic-fetch';
import {
    EventTypes
} from 'redux-segment';
import {
    addNotification as notify
} from 'reapop';
import cookie from 'react-cookie';
import moment from 'moment';

import {
    appActions
} from '../actions';
import {
    routes
} from '../consts';
import {
    getEmbedName,
    getClientVersion,
    getToken,
    getSessionId,
} from '../reducers';
import {
    logException
} from '../utils';


export function callApi(endpoint, method, token, payload, clientVersion) {

    const options = {
        method,
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: method !== routes.METHODS.GET ? JSON.stringify(payload) : undefined,
    };

    if (token) {
        options.headers.Authorization = `Bearer ${token}`;
    }

    if (clientVersion) {
        options.headers['unito-client-app-version'] = clientVersion;
    }

   return fetch(`https://1af2f682.ngrok.io/${routes.BASE_API}/${endpoint}`, options)
        .then((response) => {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.startsWith('application/json')) {
                return response.json().then((json) => {
                    if (!response.ok) {
                        return Promise.reject({
                            ...json,
                            status: response.status,
                        });
                    }
                    return json;
                });
            }

            // Reject all responses of content type that are not json
            return response.text().then(text => (
                Promise.reject({
                    logMessage: text,
                    status: response.status,
                    name: response.name,
                })
            ));
        })
}

export function callAPIMiddleware({
    dispatch,
    getState
}) {
    return next => (action) => {
        const {
            types,
            url,
            method = routes.METHODS.GET,
            isProtectedUrl = true,
            shouldCallAPI = () => true,
            payload = {},
            meta = {},
            onSuccess,
            onFailure,
            isPolling = false,
            displayError = true,
            token = undefined,
        } = action;

        const state = getState();

        if (!types) {
            // Normal action: pass it on
            return next(action);
        }

        if (!Array.isArray(types) || types.length !== 3 || !types.every(type => typeof type === 'string')) {
            throw new Error('callAPIMiddleware Error: Expected an array of three string types. Types:', types);
        }

        if (!Object.keys(routes.METHODS).includes(method)) {
            throw new Error(
                'callAPIMiddleware Error: Expected method to be one of the following: "GET", "POST", "PUT", "PATCH", "DELETE". Method:',
                method,
            );
        }

        if (!shouldCallAPI(state)) {
            return Promise.resolve({});
        }

        if (onSuccess && typeof onSuccess !== 'function') {
            throw new Error('callAPIMiddleware Error: Expected onSuccess to be a function.');
        }

        if (onFailure && typeof onFailure !== 'function') {
            throw new Error('callAPIMiddleware Error: Expected onFailure to be a function.');
        }

        const [requestType, successType, failureType] = types;

        dispatch({
            type: requestType,
            meta: {
                ...meta,
                url,
                initialPayload: payload,
            },
        });

        const authToken = isProtectedUrl ? getToken(state) || token : undefined;
        const clientVersion = getClientVersion(state);
        return callApi(url, method, authToken, payload, clientVersion)
            .then(
                (response) => {
                    // If new version of app, client needs to refresh
                    if (response.reload) {
                        window.location.reload(true);
                        return;
                    }

                    if (onSuccess) {
                        const result = onSuccess(response);
                        // The result has to be explicitly set to false in order to skip success dispatch
                        if (result === false) {
                            return;
                        }
                    }

                    dispatch({
                        payload: response,
                        type: successType,
                        meta: {
                            ...meta,
                            initialPayload: payload,
                        },
                    });

                    return response;
                },
                (error) => {
                    const err = {
                        ...error,
                        message: error.message || error.errorMessage || 'Please try again.',
                    };

                    // An invalid cookie should disconnect the user from unito
                    if (err.name === 'InvalidCookieTokenError') {
                        cookie.remove('token');
                        window.location.reload();
                    }

                    // If the service is unavailable, show maintenance page
                    if (err.status === 503) {
                        dispatch(appActions.enableMaintenanceSuccess());
                    }

                    const analyticsEvent = isPolling ? {} : {
                        eventType: EventTypes.track,
                        eventPayload: {
                            event: 'Had error in console',
                            properties: {
                                error_name: err.name,
                                error_message: err.message,
                                error_identifier: err.identifier,
                                error_code: err.code,
                                error_status: err.status,
                                error_uuid: err.uuid,
                                error_severity: err.severity,
                                unito_client_app_version: clientVersion,
                                sessionId: getSessionId(state),
                            },
                        },
                    };

                    dispatch({
                        error: err,
                        type: failureType,
                        meta: {
                            ...meta,
                            initialPayload: payload,
                            analytics: analyticsEvent,
                        },
                    });

                    if (onFailure) {
                        onFailure(err);
                        return;
                    }

                    // ONLY display error on non polling calls. Otherwise we will spam sentry and the user
                    if (isPolling) {
                        return;
                    }

                    if (displayError) {
                        // Unhandled errors.
                        // Display generic message and send exception to sentry.
                        const uuid = err.uuid ? `(${err.uuid})` : '';
                        const message = `Hello Unito! \n\nI had the following error when using your app: \n\n${err.message} ${uuid}.`;
                        dispatch(
                            notify({
                                title: 'Something went wrong :(',
                                ...err,
                                position: 'tc',
                                dismissible: true,
                                buttons: [{
                                    name: 'Get help',
                                    primary: true,
                                    onClick: () => {
                                        if (getEmbedName(state) === 'trello' || !window.Intercom) {
                                            window.open(`mailto:help@unito.io?subject=Error while using Unito - ${err.message} ${uuid}&body=${message}`, '_blank');
                                        } else {
                                            window.Intercom('showNewMessage', message);
                                        }
                                    },
                                }, {
                                    name: 'Guide',
                                    onClick: () => {
                                        window.open(`https://guide.unito.io/hc/en-us/search?query=${err.message}`, '_blank');
                                    },
                                }],
                            }),
                        );
                    }

                    // Send error to Sentry with some extra context data
                    logException(error, {
                        context: {
                            reduxAction: failureType,
                            actionMeta: meta,
                            actionPayload: payload,
                            url,
                            method,
                        },
                        release: clientVersion,
                    });

                    throw error;
                },
            );
    };
}

export function timestamper() {
    return next => action =>
        next({
            ...action,
            meta: {
                ...action.meta,
                timestamp: moment().toISOString(),
            },
        });
}



// WEBPACK FOOTER //
// ./src/store/middlewares.js