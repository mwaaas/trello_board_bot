import {
    Map,
    fromJS
} from 'immutable';
import {
    actionTypes
} from 'redux-form';
import uuid from 'uuid';

import {
    appTypes
} from '../consts';

const initialState = Map({
    clientVersion: null,
    defaultSyncParams: Map(),
    embedName: '',
    isLoading: false,
    isMaintenance: false,
    profitwellAuthToken: null,
    segmentWriteKey: null,
    sessionId: uuid.v4(),
    stripePublishableKey: null,
    selectedOrganizationId: null,
});

export default (state = initialState, action) => {
    switch (action.type) {
        case appTypes.ENABLE_MAINTENANCE_SUCCESS:
            return state.set('isMaintenance', true);

        case appTypes.DISABLE_MAINTENANCE:
        case appTypes.DISABLE_MAINTENANCE_SUCCESS:
            return state.set('isMaintenance', false);

        case appTypes.GET_QUERY_PARAMETERS:
            {
                return state.set('defaultSyncParams', fromJS(action.payload));
            }

        case appTypes.GET_IS_EMBED:
            {
                return state.set('embedName', action.payload);
            }

        case actionTypes.DESTROY:
            {
                // When canceling or submitting the sync form, remove the default sync parameters
                // Keep them for embedMode as the where tab is always hidden
                const isEmbed = !!state.get('embedName');
                const forms = action.meta.form || [];
                if (forms.includes('syncForm') && !isEmbed) {
                    return state.set('defaultSyncParams', Map());
                }
                return state;
            }

        case appTypes.GET_APP_CONFIG_REQUEST:
            return state.merge({
                isLoading: true,
            });

        case appTypes.GET_APP_CONFIG_SUCCESS:
            {
                const {
                    appVersion,
                    profitwellAuthToken,
                    segmentWriteKey,
                    stripePublishableKey,
                } = action.payload;

                return state.merge({
                    clientVersion: appVersion,
                    isLoading: false,
                    profitwellAuthToken,
                    segmentWriteKey,
                    stripePublishableKey,
                });
            }

        case appTypes.GET_APP_CONFIG_FAILURE:
            {
                return state.merge({
                    isMaintenance: true,
                    isLoading: false,
                });
            }

        case appTypes.SET_SELECTED_ORGANIZATION:
            {
                return state.set('selectedOrganizationId', action.payload);
            }

        default:
            {
                return state;
            }
    }
};

export const getEmbedName = state => state.get('embedName');
export const getIsInMaintenance = state => state.get('isMaintenance');
export const getClientVersion = state => state.get('clientVersion');
export const getSessionId = state => state.get('sessionId');

export const hasDefaultSyncParameters = (state, side) => {
    const config = state.get('defaultSyncParams', Map());

    return !!config.get(`syncDefaultProvider${side}`) &&
        !!config.get(`syncDefaultProviderIdentity${side}`) &&
        (!!config.get(`syncDefaultContainer${side}`) || !!config.get(`syncDefaultWorkspace${side}`)) &&
        !!config.get(`syncDefaultExistingContainer${side}`);
};

export const getDefaultParamProviderId = (state, side) => {
    const config = state.get('defaultSyncParams');
    return config.get(`syncDefaultProvider${side}`);
};

export const getDefaultParamProviderIdentityId = (state, side) => {
    const config = state.get('defaultSyncParams');
    return config.get(`syncDefaultProviderIdentity${side}`);
};

export const getDefaultParamWorkspaceId = (state, side) => {
    const config = state.get('defaultSyncParams');
    return config.get(`syncDefaultWorkspace${side}`);
};

export const getDefaultParamContainerId = (state, side) => {
    const config = state.get('defaultSyncParams');
    return config.get(`syncDefaultContainer${side}`);
};

export const getDefaultParamExistingContainer = (state, side) => {
    const config = state.get('defaultSyncParams');
    return config.get(`syncDefaultExistingContainer${side}`);
};

export const getIsSideLocked = (state, containerSide) => {
    const config = state.get('defaultSyncParams');
    return config.get(`lockSide${containerSide}`) === 'true';
};

export const getIsLoading = state => state.get('isLoading');

export const getSelectedOrganizationId = state => state.get('selectedOrganizationId');



// WEBPACK FOOTER //
// ./src/reducers/app.js