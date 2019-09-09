import {
    Map,
    List,
    fromJS
} from 'immutable';

import {
    containerTypes,
    linkTypes,
    providerIdentityTypes
} from '../consts';
import {
    normalizeEntitiesById
} from '../utils';

export const initialState = Map({
    entities: Map(),
    hasFatalError: false,
    isLoaded: false,
    isLoading: false,
});

export default (state = initialState, action) => {
    switch (action.type) {
        case linkTypes.GET_LINK_SUCCESS:
            {
                const {
                    link
                } = action.payload;
                const providerIdentities = [link.A.providerIdentity, link.B.providerIdentity];
                const entities = state.get('entities').size ? state.get('entities') : normalizeEntitiesById(fromJS(providerIdentities));
                return state.merge({
                    entities,
                    hasFatalError: false,
                });
            }

        case providerIdentityTypes.DISCONNECT_PROVIDER_IDENTITY_REQUEST:
        case providerIdentityTypes.GET_PROVIDER_IDENTITIES_REQUEST:
            return state.merge({
                hasFatalError: false
            });

        case providerIdentityTypes.GET_PROVIDER_IDENTITIES_SUCCESS:
            {
                const providerIdentities = fromJS(
                    action.payload.providerIdentities.map(pId => ({
                        ...pId,
                        isValidated: false,
                    })),
                );
                const entities = normalizeEntitiesById(providerIdentities);

                return state.merge({
                    entities,
                    hasFatalError: false,
                    isLoaded: true,
                });
            }

        case providerIdentityTypes.VALIDATE_PROVIDER_IDENTITY_SUCCESS:
            {
                const {
                    _id: id,
                    state: providerIdentityState
                } = action.payload;
                return state
                    .setIn(['entities', id, 'state'], providerIdentityState)
                    .setIn(['entities', id, 'isValidated'], true);
            }

        case providerIdentityTypes.GET_PROVIDER_IDENTITY_SUCCESS:
            {
                const {
                    providerIdentity
                } = action.payload;
                return state.setIn(['entities', providerIdentity._id], fromJS(providerIdentity));
            }

        case providerIdentityTypes.DISCONNECT_PROVIDER_IDENTITY_SUCCESS:
            {
                const {
                    _id: id
                } = action.payload.providerIdentity;
                return state.merge({
                    entities: state.get('entities').delete(id),
                });
            }

        case containerTypes.GET_LINK_CONTAINER_BY_SIDE_FAILURE:
            {
                const {
                    error,
                    meta: {
                        providerIdentityId
                    },
                } = action;

                if (error.code === 401) {
                    return state.setIn(['entities', providerIdentityId, 'state'], providerIdentityTypes.STATE.DISABLED);
                }

                return state;
            }

        case providerIdentityTypes.REACTIVATE_SINGLE_PROVIDER_IDENTITY:
            {
                const {
                    providerIdentityId
                } = action.payload;
                return state.setIn(['entities', providerIdentityId, 'state'], providerIdentityTypes.STATE.ACTIVE);
            }

        case providerIdentityTypes.GET_ALLOWED_PROVIDER_IDENTITIES_FAILURE:
        case providerIdentityTypes.GET_ALLOWED_PROVIDER_IDENTITIES_SUCCESS:
            {
                return state.merge({
                    isLoading: false
                });
            }

        case providerIdentityTypes.GET_ALLOWED_PROVIDER_IDENTITIES_REQUEST:
            return state.merge({
                isLoading: true
            });

        case providerIdentityTypes.GET_PROVIDER_IDENTITIES_FAILURE:
            return state.merge({
                hasFatalError: true
            });

        default:
            return state;
    }
};

export const getProviderName = (state, providerIdentityId) => state.getIn(['entities', providerIdentityId, 'providerName']);

export const getById = (state, providerIdentityId) => state.getIn(['entities', providerIdentityId], Map());

export const getByIds = (state, ids) => state.get('entities').filter(pi => ids.contains(pi.get('_id')));

export const getUserProviderIdentities = (state, userId) => state.get('entities').filter(pi => pi.get('users', List()).contains(userId));

export const getUserProviderIdentitiesByProviderName = (state, userId, providerName) =>
    state.get('entities').filter(pi => pi.get('users', List()).contains(userId) && pi.get('providerName') === providerName);

export const getUserProviderNames = (state, userId) => {
    const pis = getUserProviderIdentities(state, userId);
    return pis.map(pi => pi.get('providerName')).toSet();
};

export const isLoaded = state => state.get('isLoaded');

export const isLoading = state => state.get('isLoading');



// WEBPACK FOOTER //
// ./src/reducers/providerIdentities.js