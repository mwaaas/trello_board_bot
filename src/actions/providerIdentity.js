import {
    change
} from 'redux-form';
import {
    addNotification as notify
} from 'reapop';

import {
    providerIdentityTypes,
    routes
} from '../consts';
import {
    linkActions
} from '../actions';
import {
    getFieldValue,
    getInitialContainerId,
    getInitialProviderIdentityId
} from '../reducers';


export const getProviderIdentities = () => ({
    types: [
        providerIdentityTypes.GET_PROVIDER_IDENTITIES_REQUEST,
        providerIdentityTypes.GET_PROVIDER_IDENTITIES_SUCCESS,
        providerIdentityTypes.GET_PROVIDER_IDENTITIES_FAILURE,
    ],
    url: routes.API_PATHS.PROVIDER_IDENTITIES,
});

export const validateProviderIdentity = providerIdentityId => ({
    types: [
        providerIdentityTypes.VALIDATE_PROVIDER_IDENTITY_REQUEST,
        providerIdentityTypes.VALIDATE_PROVIDER_IDENTITY_SUCCESS,
        providerIdentityTypes.VALIDATE_PROVIDER_IDENTITY_FAILURE,
    ],
    method: routes.METHODS.POST,
    url: routes.API_PATHS.PROVIDER_IDENTITY_VALIDATED(providerIdentityId),
});

export const disconnectProviderIdentity = providerIdentityId => (dispatch) => {
    dispatch({
        types: [
            providerIdentityTypes.DISCONNECT_PROVIDER_IDENTITY_REQUEST,
            providerIdentityTypes.DISCONNECT_PROVIDER_IDENTITY_SUCCESS,
            providerIdentityTypes.DISCONNECT_PROVIDER_IDENTITY_FAILURE,
        ],
        method: routes.METHODS.DELETE,
        url: routes.API_PATHS.DISCONNECT_PROVIDER_IDENTITY(providerIdentityId), // eslint-disable-line
        onSuccess: () => {
            dispatch(linkActions.getLinks());
        },
    });
};

/**
 *
 */
export const fetchAllowedProviderIdentities = ({
    inputName,
    formName,
    containerSide
}) => (dispatch, getState) => {
    const state = getState();
    const initialProviderIdentityId = getFieldValue(state, inputName, formName) || getInitialProviderIdentityId(state, {
        containerSide
    });
    const containerIdInputName = inputName.replace('providerIdentityId', 'containerId');
    const containerId = getFieldValue(state, containerIdInputName, formName) || getInitialContainerId(state, {
        containerSide
    });

    return dispatch({
        types: [
            providerIdentityTypes.GET_ALLOWED_PROVIDER_IDENTITIES_REQUEST,
            providerIdentityTypes.GET_ALLOWED_PROVIDER_IDENTITIES_SUCCESS,
            providerIdentityTypes.GET_ALLOWED_PROVIDER_IDENTITIES_FAILURE,
        ],
        meta: {
            formName,
            providerIdentityId: initialProviderIdentityId,
            containerId,
        },
        url: routes.API_PATHS.GET_ALLOWED_PROVIDER_IDENTITIES(initialProviderIdentityId, containerId), // eslint-disable-line
        onSuccess: ({
            providerIdentityIds
        }) => {
            if (formName === 'syncForm') {
                const currentState = getState();
                const formPiId = getFieldValue(currentState, inputName, formName);
                // If the selected provider identity is not allowed, switch to default from sync settings
                if (providerIdentityIds.length && !providerIdentityIds.includes(formPiId)) {
                    dispatch(notify({
                        status: 'warning',
                        title: 'Heads up! This might not be right',
                        message: "The account you just connected doesn't have access to this project",
                        position: 'tr',
                        closeButton: true,
                    }));
                    dispatch(change(formName, inputName, initialProviderIdentityId));
                }
            }
        },
    });
};

export const getProviderIdentitySuccess = providerIdentity => ({
    type: providerIdentityTypes.GET_PROVIDER_IDENTITY_SUCCESS,
    payload: {
        providerIdentity
    },
});

export const reactivateSingleProviderIdentity = providerIdentityId => ({
    type: providerIdentityTypes.REACTIVATE_SINGLE_PROVIDER_IDENTITY,
    payload: {
        providerIdentityId
    },
});



// WEBPACK FOOTER //
// ./src/actions/providerIdentity.js