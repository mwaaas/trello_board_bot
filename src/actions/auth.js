import jwtDecode from 'jwt-decode';
import {
    EventTypes
} from 'redux-segment';
import cookie from 'react-cookie';
import {
    addNotification as notify
} from 'reapop';

import {
    appTypes,
    authTypes,
    routes
} from '../consts';
import {
    getToken
} from '../reducers';
import {
    fromLocalStorage
} from '../utils';

// LOGIN
export function rehydrateAuthStateSuccess(data) {
    const {
        token
    } = data;
    const decodedDataToken = jwtDecode(token);

    const {
        _id: userId,
        email,
        fullName,
    } = decodedDataToken;

    return {
        type: authTypes.REHYDRATE_AUTH_TOKEN_SUCCESS,
        payload: {
            token,
            ...decodedDataToken,
        },
        meta: {
            analytics: {
                eventType: EventTypes.identify,
                eventPayload: {
                    userId,
                    traits: {
                        email,
                        name: fullName,
                        id: userId,
                    },
                },
            },
        },
    };
}

/**
 *  Rehydrates the auth state by using token from cookie (when the user is already logged in)
 *  @param {string} token - The user token, gathered from the cookie
 */
export const rehydrateAuthState = () => (dispatch, getState) => {
    try {
        // On first load, if cookie with token, perform rehydrate to validate that
        // token is still valid.
        const cookieToken = cookie.load('token');

        const token = cookieToken || getToken(getState());
        if (!token) {
            return;
        }
        return dispatch({
            types: [
                authTypes.REHYDRATE_AUTH_STATE_REQUEST,
                authTypes.REHYDRATE_AUTH_STATE_SUCCESS,
                authTypes.REHYDRATE_AUTH_STATE_FAILURE,
            ],
            url: routes.API_PATHS.REHYDRATE,
            token,
            onSuccess: (response) => {
                dispatch(rehydrateAuthStateSuccess(response));
            },
            onFailure: () => {
                cookie.remove('token');
                window.location.reload();
            },
        });
    } catch (err) {
        dispatch({
            error: err,
            type: authTypes.LOGIN_USER_FAILURE,
        });

        // If cookie token value is malformed, it might crash
        cookie.remove('token');
        window.location.reload();
    }
};

/** LOGOUT */
export const logoutUser = () => (dispatch) => {
    try {
        fromLocalStorage.clearState(appTypes.LOCAL_STORAGE_ORGANIZATION_KEY);
    } catch (err) {
        dispatch(notify(appTypes.LOCAL_STORAGE_NOTIFICATION));
    }

    dispatch({
        types: [
            authTypes.LOGOUT_USER_REQUEST,
            authTypes.LOGOUT_USER_SUCCESS,
            authTypes.LOGOUT_USER_FAILURE,
        ],
        url: routes.API_PATHS.LOGOUT,
    });
};

export const authenticate = payload => ({
    payload,
    method: 'POST',
    types: [
        authTypes.AUTHENTICATE_USER_REQUEST,
        authTypes.AUTHENTICATE_USER_SUCCESS,
        authTypes.AUTHENTICATE_USER_FAILURE,
    ],
    url: routes.API_PATHS.AUTHENTICATE,
    displayError: true,
});

export const testConnection = (providerName, {
    selfSignedCertificate,
    domain
}) => ({
    payload: {
        selfSignedCertificate,
        domain
    },
    method: 'POST',
    types: [
        authTypes.TEST_CONNECTION_REQUEST,
        authTypes.TEST_CONNECTION_SUCCESS,
        authTypes.TEST_CONNECTION_FAILURE,
    ],
    url: routes.API_PATHS.TEST_CONNECTION(providerName),
    displayError: false,
});

export const validateDomain = (providerName, domain) => ({
    payload: {
        domain
    },
    method: 'POST',
    types: [
        authTypes.VALIDATE_DOMAIN_REQUEST,
        authTypes.VALIDATE_DOMAIN_SUCCESS,
        authTypes.VALIDATE_DOMAIN_FAILURE,
    ],
    url: routes.API_PATHS.VALIDATE_DOMAIN(providerName),
    displayError: false,
});



// WEBPACK FOOTER //
// ./src/actions/auth.js