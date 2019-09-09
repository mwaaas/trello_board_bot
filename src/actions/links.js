/**
 * @name LinkActions
 * All actions related to links are stored here.
 */
import appHistory from '../app-history';
import {
    fromJS
} from 'immutable';
import {
    addNotification as notify
} from 'reapop';
import {
    getFormValues
} from 'redux-form';

import {
    routes,
    linkTypes,
    multisyncTypes,
    organizationTypes,
} from '../consts';

import {
    containerActions,
    trackingActions,
} from '../actions';

import {
    getCurrentManualOptions,
    getDefaultLinkName,
    getDefaultParamContainerId,
    getFeatureFlagValue,
    getFieldAssociations,
    getSyncHistoryUpdatedAt,
    getSyncSettings,
    getSyncingLinkIds,
    isCurrentMultiSync,
    isFetchingSyncStates,
    linkSyncHistoryHasLoaded,
    getFieldAssociationsByContainerId,
    getMultisyncDefaultFieldAssociations,
    getContainerById,
    getSelectedOrganizationId,
} from '../reducers';
import {
    formUtils,
    otherSide as getOtherSide
} from '../utils';

import {
    buildMultisyncSyncsPayload
} from '../containers/Multisync';

export const notifyAboutFeatureEnforcement = rejectionReasons => (dispatch) => {
    const formatedRejectionReasons = rejectionReasons.map(reason => `<li>${reason}</li>`).join('');

    dispatch(trackingActions.trackEvent(organizationTypes.EVENTS.USER_SAW_BLOCKED_AUTOSYNC, {
        rejectionReasons
    }));
    dispatch(notify({
        title: 'This sync is limited to manual mode',
        message: "... because it goes beyond the limits of your plan. Here's how:<br/>" +
            '<ul>' +
            `${formatedRejectionReasons}` +
            '</ul>' +
            'You can still run the sync manually.' +
            ' To remove this limit, upgrade your subscription.',
        status: 'warning',
        dismissible: true,
        allowHTML: true,
        dismissAfter: 0,
        position: 't',
        buttons: [{
                name: 'Go to billing',
                primary: true,
                onClick: () => {
                    dispatch(trackingActions.trackEvent(organizationTypes.EVENTS.USER_CLICKED_BLOCKED_AUTO_SYNC_BANNER));
                    appHistory.push({
                        pathname: routes.ABSOLUTE_PATHS.ORGANIZATIONS
                    });
                },
            },
            {
                name: 'Dismiss',
            },
        ],
    }));
};

// TODO: Remove me when syncHistory is stored in MongoDB
export const getLinkDashboard = linkId => (dispatch, getState) => {
    dispatch({
        types: [
            linkTypes.GET_LINK_DASHBOARD_REQUEST,
            linkTypes.GET_LINK_DASHBOARD_SUCCESS,
            linkTypes.GET_LINK_DASHBOARD_FAILURE,
        ],
        shouldCallAPI: () => {
            const state = getState();
            const syncHistoryHasLoaded = linkSyncHistoryHasLoaded(state, linkId);
            const lastSyncHistoryUpdatedAt = getSyncHistoryUpdatedAt(state, linkId);

            if (!syncHistoryHasLoaded) {
                return true;
            }

            // Last update is more than 5 minutes old
            return Date.now() - lastSyncHistoryUpdatedAt > 1000 * 60 * 5;
        },
        meta: {
            linkId
        },
        url: routes.API_PATHS.GET_LINK(linkId),
    });
};

export const searchLinks = searchString => (dispatch, getState) => {
    dispatch({
        types: [
            linkTypes.GET_LINKS_REQUEST,
            linkTypes.GET_LINKS_SUCCESS,
            linkTypes.GET_LINKS_FAILURE,
        ],
        url: routes.API_PATHS.SEARCH_LINKS(searchString), // eslint-disable-line
        onSuccess: ({
            links
        }) => {
            const state = getState();
            const displaySyncIndicator = getFeatureFlagValue(state, 'sync-indicator');

            if (displaySyncIndicator) {
                links.forEach(link => dispatch(getLinkDashboard(link._id)));
            }
        },
    });
};

export const getContainerLinks = () => (dispatch, getState) => {
    const state = getState();
    const containerId = getDefaultParamContainerId(state, 'A');

    dispatch({
        types: [
            linkTypes.GET_LINKS_REQUEST,
            linkTypes.GET_LINKS_SUCCESS,
            linkTypes.GET_LINKS_FAILURE,
        ],
        url: routes.API_PATHS.CONTAINER_LINKS(containerId),
    });
};

export const getLinks = () => (dispatch, getState) => {
    const state = getState();
    const selectedOrganizationId = getSelectedOrganizationId(state);

    dispatch({
        types: [
            linkTypes.GET_LINKS_REQUEST,
            linkTypes.GET_LINKS_SUCCESS,
            linkTypes.GET_LINKS_FAILURE,
        ],
        url: routes.API_PATHS.GET_LINKS(selectedOrganizationId),
        onSuccess: ({
            links
        }) => {
            const displaySyncIndicator = getFeatureFlagValue(state, 'sync-indicator');

            if (displaySyncIndicator) {
                links.forEach(link => dispatch(getLinkDashboard(link._id)));
            }
        },
    });
};

export function getSyncingStates() {
    return (dispatch, getState) => {
        const state = getState();
        const linkIds = getSyncingLinkIds(state);

        return dispatch({
            types: [
                linkTypes.GET_LINKS_SYNC_STATES_REQUEST,
                linkTypes.GET_LINKS_SYNC_STATES_SUCCESS,
                linkTypes.GET_LINKS_SYNC_STATES_FAILURE,
            ],
            url: routes.API_PATHS.GET_LINKS_STATES(linkIds), // eslint-disable-line
            meta: {
                linkIds: linkIds.toArray()
            },
            shouldCallAPI: () => !linkIds.isEmpty() && !isFetchingSyncStates(state),
            isPolling: true,
        });
    };
}

export const addMultisyncLinks = ({ ...formData
}, multisyncId) => async (dispatch, getState) => {
    const state = getState();
    const rootSide = formData.topology === multisyncTypes.TOPOLOGIES.SPLIT ? 'A' : 'B';
    const rootContainerName = getContainerById(state, rootSide, formData.root.containerId, 'displayName');
    const leavesSide = getOtherSide(rootSide);
    const organizationId = getSelectedOrganizationId(state);

    for (const sync of formData.filters) {
        const {
            containerId
        } = sync;
        const leafContainerName = getContainerById(state, leavesSide, containerId, 'displayName');
        const syncName = formData.topology === multisyncTypes.TOPOLOGIES.SPLIT ?
            `${rootContainerName} - ${leafContainerName}` :
            `${leafContainerName} - ${rootContainerName}`;
        let associations = getFieldAssociationsByContainerId(state, containerId);

        // if there are no custom Field Associations for this sync then set them to the default ones
        if (associations.isEmpty()) {
            associations = getMultisyncDefaultFieldAssociations(state);
        }

        const payload = buildMultisyncSyncsPayload({ ...formData,
            organizationId
        }, sync, syncName, associations, multisyncId);

        try {
            await dispatch({ // eslint-disable-line
                types: [
                    linkTypes.ADD_LINK_REQUEST,
                    linkTypes.ADD_LINK_SUCCESS,
                    linkTypes.ADD_LINK_FAILURE,
                ],
                method: routes.METHODS.POST,
                url: routes.API_PATHS.LINKS,
                payload,
                displayError: false,
            });
        } catch (err) {
            dispatch(notify({
                ...err,
                allowHTML: true,
                closeButton: true,
                dismissAfter: 10000,
                message: `Your sync <strong>${syncName}</strong> could not be created`,
                position: 'tc',
                status: 'error',
                title: 'Something went wrong :(',
                buttons: [{
                    name: 'Get help',
                    primary: true,
                    onClick: () => {
                        const message = `Hello Unito! \n\nI had the following error when using your app: \n\n${err.message}. ${err.uuid || ''}`;
                        if (!window.Intercom) {
                            window.open(`mailto:help@unito.io?subject=Error while using Unito - ${err.message} ${err.uuid || ''}&body=${message}`, '_blank');
                            return;
                        }

                        window.Intercom('showNewMessage', message);
                    },
                }],
            }));
        }
    }
};

export const addLink = ({
    customizing = false,
    ...formData
}) => (dispatch, getState) => {
    const state = getState();
    const organizationId = getSelectedOrganizationId(state);

    let payload = fromJS({
        A: {
            containerId: formData.A.containerId,
            existingContainer: !!formData.A.existingContainer,
            providerIdentityId: formData.A.providerIdentityId,
            settings: {
                filters: {},
                includeClosedTasks: formData.A.closedTasks,
                readOnly: formData.A.readOnly,
            },
        },
        B: {
            containerId: formData.B.containerId,
            existingContainer: !!formData.B.existingContainer,
            providerIdentityId: formData.B.providerIdentityId,
            settings: {
                filters: {},
                includeClosedTasks: formData.B.closedTasks,
                readOnly: formData.B.readOnly,
            },
        },
        organizationId,
        associations: getFieldAssociations(state),
        // In the case of trelloTrelloAddSync, the name is provided.
        name: formData.name || getDefaultLinkName(state),
        isMultiSync: !!isCurrentMultiSync(state),
        kind: linkTypes.KIND.MIRROR_SYNC,
        source: linkTypes.SOURCE.CONSOLE,
        // We don't want to set isAutoSync to true, if user is going to customize as the next step
        isAutoSync: !!formData.isAutoSync && !customizing,
    });

    for (const side of ['A', 'B']) {
        const filters = formData[side].filters || [];

        for (const filter of filters) {
            const {
                fieldValueType,
                fieldId,
                kind,
                type,
                values,
            } = filter;

            // Do not add empty filters to the payload
            if (!formUtils.isEmpty(values)) {
                const formatedValues = typeof values === 'boolean' ? [values] : values.map(opt => opt.id);

                payload = payload
                    .setIn([side, 'settings', 'filters', fieldId, 'fieldValueType'], fieldValueType)
                    .setIn([side, 'settings', 'filters', fieldId, 'kind'], kind)
                    .setIn([side, 'settings', 'filters', fieldId, type], formatedValues);
            }
        }
    }

    return dispatch({
        types: [
            linkTypes.ADD_LINK_REQUEST,
            linkTypes.ADD_LINK_SUCCESS,
            linkTypes.ADD_LINK_FAILURE,
        ],
        method: routes.METHODS.POST,
        url: routes.API_PATHS.LINKS,
        payload: payload.toJS(),
        onSuccess: ({
            link,
            rejectionReasons
        }) => {
            if (customizing) {
                appHistory.push({
                    pathname: `${routes.ABSOLUTE_PATHS.EDIT_LINK}/${link._id}`,
                    search: `?customizing=true&isAutoSync=${formData.isAutoSync}`,
                });
                return;
            }

            appHistory.replace({
                pathname: routes.ABSOLUTE_PATHS.DASHBOARD
            });
            if (rejectionReasons.length > 0) {
                dispatch(notifyAboutFeatureEnforcement(rejectionReasons));
            }
        },
    });
};

export const getLink = (linkId, originalIsAutoSync) => dispatch =>
    dispatch({
        types: [
            linkTypes.GET_LINK_REQUEST,
            linkTypes.GET_LINK_SUCCESS,
            linkTypes.GET_LINK_FAILURE,
        ],
        url: routes.API_PATHS.GET_LINK(linkId), // eslint-disable-line
        meta: {
            originalIsAutoSync
        },
        onSuccess: ({
            link
        }) => {
            // Each side loaded concurrently for speed
            dispatch(containerActions.getLinkContainerBySide(link, 'A'));
            dispatch(containerActions.getLinkContainerBySide(link, 'B'));
        },
        onFailure: (err) => {
            dispatch(notify({
                title: 'Something went wrong :(',
                ...err,
                position: 'tc',
                closeButton: true,
            }));
            appHistory.push({
                pathname: routes.ABSOLUTE_PATHS.DASHBOARD
            });
        },
    });

export const updateLinkProviderIdentity = (linkId, formData) => (dispatch) => {
    dispatch({
        types: [
            linkTypes.SAVE_LINK_REQUEST,
            linkTypes.SAVE_LINK_SUCCESS,
            linkTypes.SAVE_LINK_FAILURE,
        ],
        url: routes.API_PATHS.SAVE_LINK(linkId), // eslint-disable-line
        payload: formData,
        method: routes.METHODS.PATCH,
        onSuccess: () => {
            dispatch(getLink(linkId));
        },
    });
};

/**
 * This action edits a link
 * @param {string} linkId - The id of the link
 * @params {object} formData - The data coming from the sync form
 * @returns {object} the action with the payload
 */
export const saveLink = (linkId, formData) => (dispatch, getState) => {
    const state = getState();
    const organizationId = getSelectedOrganizationId(state);
    const syncSettings = getSyncSettings(state);
    const {
        manualOptions = '{}'
    } = formData;
    const linkPayload = { ...formData
    };

    try {
        linkPayload.manualOptions = JSON.parse(manualOptions);
    } catch (err) {
        // If manual options are invalid, keep same value as before
        linkPayload.manualOptions = getCurrentManualOptions(state, 'manualOptions').toJS();
    }

    const payload = formUtils.getEditSyncPayload({ ...linkPayload,
        organizationId
    }, syncSettings);

    return dispatch({
        types: [
            linkTypes.SAVE_LINK_REQUEST,
            linkTypes.SAVE_LINK_SUCCESS,
            linkTypes.SAVE_LINK_FAILURE,
        ],
        url: routes.API_PATHS.SAVE_LINK(linkId), // eslint-disable-line
        method: routes.METHODS.PUT,
        payload,
        onSuccess: ({
            rejectionReasons
        }) => {
            appHistory.push({
                pathname: routes.ABSOLUTE_PATHS.DASHBOARD
            });
            if (rejectionReasons.length > 0) {
                dispatch(notifyAboutFeatureEnforcement(rejectionReasons));
            }
        },
    });
};

/**
 * This action sets the state of a link to auto
 * @param {string} linkId - The id of the link
 */
export const setAutoSyncLink = linkId => ({
    types: [
        linkTypes.SET_AUTO_SYNC_LINK_REQUEST,
        linkTypes.SET_AUTO_SYNC_LINK_SUCCESS,
        linkTypes.SET_AUTO_SYNC_LINK_FAILURE,
    ],
    url: routes.API_PATHS.SAVE_LINK(linkId), // eslint-disable-line
    payload: {
        isAutoSync: true
    },
    method: routes.METHODS.PATCH,
});


/**
 * This action sets the state of a link to manual
 * @param {string} id - The id of the link
 */
export const setManualSyncLink = linkId => ({
    types: [
        linkTypes.SET_MANUAL_SYNC_LINK_REQUEST,
        linkTypes.SET_MANUAL_SYNC_LINK_SUCCESS,
        linkTypes.SET_MANUAL_SYNC_LINK_FAILURE,
    ],
    url: routes.API_PATHS.SAVE_LINK(linkId), // eslint-disable-line
    payload: {
        isAutoSync: false
    },
    method: routes.METHODS.PATCH,
});

/**
 * This action starts the sync of a given link
 * @param {string} id - The id of the link
 * @param {bool} resync - Wether to force a resync or not
 * @param {string[]} forcedFields - The fields to limit
 * @param {string} forcedSide - Wether to force a resync or not
 */
export const syncLink = (id, resync = false, forcedFields, forcedSide) => ({
    types: [
        linkTypes.SYNC_LINK_REQUEST,
        linkTypes.SYNC_LINK_SUCCESS,
        linkTypes.SYNC_LINK_FAILURE,
    ],
    method: routes.METHODS.PUT,
    url: routes.API_PATHS.SYNC_LINK(id), // eslint-disable-line
    payload: {
        resync,
        forcedFields,
        forcedSide
    },
});

/**
 * This action deletes a link between two containers
 * @param {string} linkId - The id of the link to delete
 */
export const deleteLink = linkId => ({
    types: [
        linkTypes.DELETE_LINK_REQUEST,
        linkTypes.DELETE_LINK_SUCCESS,
        linkTypes.DELETE_LINK_FAILURE,
    ],
    method: routes.METHODS.DELETE,
    url: routes.API_PATHS.DELETE_LINK(linkId), // eslint-disable-line
});

export const changeAllFieldAssociationTarget = target => ({
    type: linkTypes.CHANGE_ALL_FIELD_ASSOCIATION_TARGET,
    payload: {
        target,
    },
});

export const automapUsers = linkId => ({
    types: [
        linkTypes.AUTOMAP_USERS_REQUEST,
        linkTypes.AUTOMAP_USERS_SUCCESS,
        linkTypes.AUTOMAP_USERS_FAILURE,
    ],
    url: routes.API_PATHS.AUTOMAP_USERS(linkId), // eslint-disable-line
    method: routes.METHODS.POST,
});

export const callConnectorFn = (linkId, side, functionName, filter, arg) => ({
    types: [
        linkTypes.DIAGNOSE_LINK_REQUEST,
        linkTypes.DIAGNOSE_LINK_SUCCESS,
        linkTypes.DIAGNOSE_LINK_FAILURE,
    ],
    url: routes.API_PATHS.DIAGNOSE_LINK(linkId), // eslint-disable-line
    payload: {
        side,
        functionName,
        filter,
        arg,
    },
    method: routes.METHODS.POST,
});

export const resetDiagnostic = () => ({
    type: linkTypes.RESET_DIAGNOSTIC,
});

export const reviewSyncRequest = () => ({
    type: linkTypes.LINK_REVIEW_REQUEST,
});

export const reviewSyncSuccess = response => ({
    type: linkTypes.LINK_REVIEW_SUCCESS,
    payload: response,
});

export const reviewSyncFailure = error => ({
    type: linkTypes.LINK_REVIEW_FAILURE,
    error,
});


export const trackAddSyncSteps = (action, tabIndex, createLinkSessionId) => (dispatch, getState) => {
    const state = getState();
    let eventName = '';
    if (tabIndex) {
        eventName = `USER_ADD_LINK_TAB_${tabIndex}_${action}`;
    } else {
        eventName = `USER_ADD_LINK_${action}`;
    }

    const payload = {
        createLinkSessionId,
        formData: getFormValues('syncForm')(state),
    };

    dispatch(trackingActions.trackEvent(eventName, payload));
};

export const reviewSetupSync = ({
    A,
    B
}) => (dispatch) => {
    // We use ${side}.containerId instead of ${side}.existingContainer
    // To handle the case where :
    // - A user has selected a new container
    // - Click next and then come back to the app selection screen
    // By doing so it will avoid recreating the same new container over and over again
    // The input clears the container id, if the radio button value is changed.

    const payload = {
        A: {
            ...A,
            containerId: A.containerId || A.workspaceId,
            existingContainer: !!A.containerId,
        },
        B: {
            ...B,
            containerId: B.containerId || B.workspaceId,
            existingContainer: !!B.containerId,
        },
    };

    return dispatch({
        types: [
            linkTypes.LINK_REVIEW_REQUEST,
            linkTypes.LINK_REVIEW_SUCCESS,
            linkTypes.LINK_REVIEW_FAILURE,
        ],
        method: routes.METHODS.POST,
        payload,
        url: routes.API_PATHS.REVIEW_LINK,
    });
};

export const reviewSetupSyncForMultisync = ({
    root,
    leaves,
    filters
}) => (dispatch) => {
    const payloads = filters.filter(sync => !sync.existingSync).map(sync => ({
        A: {
            providerIdentityId: root.providerIdentityId,
            containerId: root.containerId,
            existingContainer: true,
        },
        B: {
            providerIdentityId: leaves.providerIdentityId,
            containerId: sync.containerId,
            existingContainer: true,
        },
    }));

    return Promise.all(payloads.map(payload => dispatch({
        types: [
            linkTypes.LINK_REVIEW_REQUEST,
            linkTypes.LINK_REVIEW_SUCCESS,
            linkTypes.LINK_REVIEW_FAILURE,
        ],
        method: routes.METHODS.POST,
        payload,
        url: routes.API_PATHS.REVIEW_LINK,
    })));
};

export const setAutoSyncMultisyncLinks = linkIds => dispatch => (
    Promise.all(linkIds.map(linkId => dispatch({
        types: [
            linkTypes.SET_AUTO_SYNC_LINK_REQUEST,
            linkTypes.SET_AUTO_SYNC_LINK_SUCCESS,
            linkTypes.SET_AUTO_SYNC_LINK_FAILURE,
        ],
        url: routes.API_PATHS.SAVE_LINK(linkId), // eslint-disable-line
        payload: {
            isAutoSync: true
        },
        method: routes.METHODS.PATCH,
    })))
);

export const getOrganizationTaskSyncsTaskCount = organizationId => ({
    types: [
        linkTypes.GET_TASK_SYNC_TASK_COUNT_REQUEST,
        linkTypes.GET_TASK_SYNC_TASK_COUNT_SUCCESS,
        linkTypes.GET_TASK_SYNC_TASK_COUNT_FAILURE,
    ],
    method: routes.METHODS.POST,
    payload: {
        organizationId,
        kind: linkTypes.KIND.TASK_SYNC,
    },
    url: routes.API_PATHS.GET_TASK_SYNC_TASK_COUNT,
});



// WEBPACK FOOTER //
// ./src/actions/links.js