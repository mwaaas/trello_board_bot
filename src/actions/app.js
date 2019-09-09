import {
    addNotification as notify,
    removeNotification
} from 'reapop';
import {
    appTypes,
    routes
} from '../consts';
import {
    getOrganizationById,
    getFirstOrganizationId,
    isUserSiteAdmin
} from '../reducers';
import {
    fromLocalStorage
} from '../utils';

export const disableMaintenance = () => (dispatch) => {
    dispatch({
        types: [
            appTypes.DISABLE_MAINTENANCE_REQUEST,
            appTypes.DISABLE_MAINTENANCE_SUCCESS,
            appTypes.DISABLE_MAINTENANCE_FAILURE,
        ],
        method: routes.METHODS.PUT,
        url: routes.API_PATHS.DISABLE_MAINTENANCE,
        payload: {},
        onSuccess: () => {
            dispatch(notify({
                title: 'Maintenance disabled',
                message: 'Unito is back online!',
                status: 'success',
                position: 'tr',
                closeButton: true,
            }));
            dispatch(removeNotification('maintenance'));
        },
    });
};

export const enableMaintenanceSuccess = () => (dispatch, getState) => {
    dispatch({
        type: appTypes.ENABLE_MAINTENANCE_SUCCESS,
    });

    if (isUserSiteAdmin(getState())) {
        dispatch(notify({
            id: 'maintenance',
            title: 'In maintenance',
            message: 'Unito is now under maintenance',
            dismissible: true,
            dismissAfter: 0,
            status: 'warning',
            position: 'tl',
            buttons: [{
                primary: true,
                name: 'End now',
                onClick: () => {
                    dispatch(disableMaintenance());
                },
            }],
        }));
    }
};

export const enableMaintenance = () => (dispatch) => {
    dispatch({
        types: [
            appTypes.ENABLE_MAINTENANCE_REQUEST,
            appTypes.ENABLE_MAINTENANCE_SUCCESS,
            appTypes.ENABLE_MAINTENANCE_FAILURE,
        ],
        method: routes.METHODS.PUT,
        url: routes.API_PATHS.ENABLE_MAINTENANCE,
        payload: {},
        onSuccess: () => {
            dispatch(enableMaintenanceSuccess());
        },
    });
};

export const isMaintenanceEnabled = () => (dispatch) => {
    dispatch({
        types: [
            appTypes.IS_MAINTENANCE_ENABLED_REQUEST,
            appTypes.IS_MAINTENANCE_ENABLED_SUCCESS,
            appTypes.DISABLE_MAINTENANCE_SUCCESS,
        ],
        url: routes.API_PATHS.IS_MAINTENANCE_ENABLED,
        onSuccess: (response) => {
            if (!response.maintenance) {
                dispatch({
                    type: appTypes.DISABLE_MAINTENANCE_SUCCESS
                });
                return;
            }

            dispatch({
                type: appTypes.ENABLE_MAINTENANCE_SUCCESS
            });
        },
    });
};

export const getAppConfig = () => ({
    types: [
        appTypes.GET_APP_CONFIG_REQUEST,
        appTypes.GET_APP_CONFIG_SUCCESS,
        appTypes.GET_APP_CONFIG_FAILURE,
    ],
    isProtectedUrl: false,
    url: routes.API_PATHS.GET_APP_CONFIG,
    onSuccess: (response) => {
        /* eslint-disable no-console */
        console.group('%c.:: VERSIONS ::.', 'color: blue; font-size: 13px');
        console.log(`%c - Console v${response.appVersion}`, 'color: blue; font-size: 13px');
        console.log(`%c - Connectors v${response.connectorsVersion}`, 'color: blue; font-size: 13px');
        console.log(`%c - Ucommon v${response.ucommonVersion}`, 'color: blue; font-size: 13px');
        console.groupEnd();
        /* eslint-enable no-console */
    },
});

export const getQueryParameters = data => ({
    type: appTypes.GET_QUERY_PARAMETERS,
    payload: data,
});

export const getIsEmbed = (pathname) => {
    const [, embed, providerName] = pathname.split('/');
    const embedName = embed === 'embed' ? providerName : '';

    return {
        type: appTypes.GET_IS_EMBED,
        payload: embedName,
    };
};

export const setSelectedOrganizationId = selectedOrganizationId => (dispatch, getState) => {
    const orgIdFromLocalStorage = fromLocalStorage.loadStateByKey(appTypes.LOCAL_STORAGE_ORGANIZATION_KEY);

    // clear the orgId in localStorage if it doesn't match any of the user organizations
    let isOrgInLocalStorageValid = true;
    if (orgIdFromLocalStorage) {
        isOrgInLocalStorageValid = !(getOrganizationById(getState(), orgIdFromLocalStorage).isEmpty());
        if (!isOrgInLocalStorageValid) {
            try {
                fromLocalStorage.clearState(appTypes.LOCAL_STORAGE_ORGANIZATION_KEY);
            } catch (err) {
                dispatch(notify(appTypes.LOCAL_STORAGE_NOTIFICATION));
            }
        }
    }

    // set the global organization context either to the one found in localStorage or to the first fetched organization
    const organizationId = isOrgInLocalStorageValid ?
        selectedOrganizationId || orgIdFromLocalStorage || getFirstOrganizationId(getState()) :
        selectedOrganizationId || getFirstOrganizationId(getState());

    try {
        fromLocalStorage.saveState(appTypes.LOCAL_STORAGE_ORGANIZATION_KEY, organizationId);
    } catch (err) {
        dispatch(notify(appTypes.LOCAL_STORAGE_NOTIFICATION));
    }

    return dispatch({
        type: appTypes.SET_SELECTED_ORGANIZATION,
        payload: organizationId,
    });
};



// WEBPACK FOOTER //
// ./src/actions/app.js