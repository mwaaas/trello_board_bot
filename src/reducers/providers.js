import {
    Map,
    fromJS
} from 'immutable';

import {
    providerTypes
} from '../consts';

export const initialState = Map({
    isLoading: false,
    isLoaded: false,
    entities: Map(),
});

export default (state = initialState, action) => {
    switch (action.type) {
        case providerTypes.GET_PROVIDERS_REQUEST:
            {
                return state.merge({
                    isLoading: true,
                });
            }

        case providerTypes.GET_PROVIDERS_SUCCESS:
            {
                const providersById = {};
                action.payload.providers.forEach((provider) => {
                    providersById[provider._id] = provider;
                });
                return state.merge({
                    isLoading: false,
                    isLoaded: true,
                    entities: state.get('entities').merge(fromJS(providersById)),
                });
            }

        case providerTypes.GET_PROVIDERS_FAILURE:
            {
                return state.merge({
                    isLoading: false,
                });
            }

        default:
            {
                return state;
            }
    }
};

/**
 * SELECTORS
 */

/**
 * Returns the provider object of a given providerId
 * @param {object} state - The providers slice of the redux state
 * @param {string} providerId - The provider id
 * @returns {Immutable.Map} - The provider, empty Immutable.Map if not found
 */
export const getProviderById = (state, providerId) => state.getIn(['entities', providerId], Map());

/**
 * Returns the capabilities of a given provider id
 * Returns a subset of the capabilities if a key is given.
 * If key is undefined, returns the whole capabilities object
 * @param {object} state - The providers slice of the redux state
 * @param {string} providerId - The provider id
 * @param {string} [key] - The subset of the capabilities
 * Valid values are 'terms', 'fields', 'options' or undefined
 * @returns {Immutable.Map} - The providers capabilities defined by the PCD spec
 *                             Empty Immutable.Map if none
 */
export const getCapabilitiesByProviderId = (state, providerId, key) => {
    const fullCapabilities = state.getIn(['entities', providerId, 'capabilities'], Map());

    if (key) {
        // subset of capabilities can sometimes be null, return Immutable.Map() if it's the case
        return fullCapabilities.get(key, Map()) || Map();
    }

    return fullCapabilities;
};

export const getProviderByName = (state, name) => state.get('entities').find(provider => provider.get('name') === name) || Map();

export const getProviderByConnectorName = (state, connectorName) =>
    state.get('entities').find(provider => provider.get('connectorName') === connectorName) || Map();

export const getAll = state => state.get('entities', Map());

export const getProviderDisplayNameById = (state, providerId) => state.getIn(['entities', providerId, 'displayName'], '');

export const getIsLoading = state => state.get('isLoading');

export const getIsLoaded = state => state.get('isLoaded');

export const getTermForProviders = (state, providerIdA, providerIdB, term = 'task', plurality = 'singular') => {
    if (!(providerIdA && providerIdB)) {
        return `${term === 'task' ? 'task' : 'project'}${plurality === 'plural' ? 's' : ''}`;
    }

    const termA = getCapabilitiesByProviderId(state, providerIdA, 'terms', Map()).getIn([term, plurality], Map());
    const termB = getCapabilitiesByProviderId(state, providerIdB, 'terms', Map()).getIn([term, plurality], Map());

    if (termA === termB) {
        return termA;
    }
    // Get the generic term based on the plurality
    if (term === 'task') {
        return plurality === 'singular' ? 'task' : 'tasks';
    }
    return plurality === 'singular' ? 'project' : 'projects';
};

export const getByNamePreferredAuthMethod = (state, providerName) => {
    const provider = getProviderByName(state, providerName);
    return provider
        .getIn(['capabilities', 'authentication', 'authorizationMethods'], Map())
        .findKey(method => method.get('preferred'));
};



// WEBPACK FOOTER //
// ./src/reducers/providers.js