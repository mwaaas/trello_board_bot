import {
    Map,
    List,
    fromJS
} from 'immutable';

import {
    billingTypes,
    organizationTypes
} from '../consts';
import {
    normalizeEntitiesById
} from '../utils';

const initialState = Map({
    isLoading: false,
    isLoaded: false,
    hasFatalError: false,
    entitiesById: Map(),
    collaboratorsStatsByOrgId: Map(),
});

export default (state = initialState, action) => {
    switch (action.type) {
        case organizationTypes.GET_ORGANIZATIONS_REQUEST:
            {
                return state.merge({
                    isLoading: true,
                    hasFatalError: false,
                });
            }

        case organizationTypes.GET_ORGANIZATIONS_SUCCESS:
            {
                const organizations = fromJS(action.payload.organizations);
                return state
                    .merge({
                        isLoading: false,
                        isLoaded: true,
                        hasFatalError: false,
                    }).set('entitiesById', normalizeEntitiesById(organizations));
            }

        case organizationTypes.GET_ORGANIZATIONS_FAILURE:
            return state.merge({
                isLoading: false,
                hasFatalError: true,
            });


        case organizationTypes.PATCH_COLLABORATOR_SUCCESS:
        case organizationTypes.GET_COLLABORATORS_SUCCESS:
            {
                const collaboratorStats = fromJS(action.payload.collaboratorStats);
                return state.merge(Map({
                    collaboratorsStatsByOrgId: Map({
                        [collaboratorStats.get('organization')]: collaboratorStats,
                    }),
                }));
            }

        case organizationTypes.UPDATE_ORGANIZATION_REQUEST:
            {
                const {
                    organizationId
                } = action.meta;
                return state.mergeIn(['entitiesById', organizationId], Map({
                    isLoading: true
                }));
            }

        case organizationTypes.UPDATE_ORGANIZATION_FAILURE:
            {
                const {
                    organizationId
                } = action.meta;
                return state.mergeIn(['entitiesById', organizationId], Map({
                    isLoading: false
                }));
            }

        case organizationTypes.UPDATE_ORGANIZATION_SUCCESS:
            {
                const {
                    organization
                } = action.payload;
                return state.mergeIn(['entitiesById', organization.id], fromJS({
                    isLoading: false,
                    ...organization,
                }));
            }

        case billingTypes.CANCEL_SUBSCRIPTION_SUCCESS:
        case billingTypes.UPDATE_SUBSCRIPTION_SUCCESS:
            {
                const organization = fromJS(action.payload.organization);
                return state.mergeIn(['entitiesById', organization.get('id')], organization);
            }

        case organizationTypes.GET_MEMBERS_SUCCESS:
            {
                const {
                    meta: {
                        organizationId
                    },
                    payload: {
                        members
                    }
                } = action;
                return state.setIn(['entitiesById', organizationId, 'members'], fromJS(members));
            }

        case organizationTypes.GET_COWORKERS_SUCCESS:
            {
                const {
                    meta: {
                        organizationId
                    },
                    payload: {
                        coworkers
                    }
                } = action;
                return state.setIn(['entitiesById', organizationId, 'coworkers'], fromJS(coworkers));
            }

        default:
            return state;
    }
};

export const getOrganizations = state => state.get('entitiesById', Map());

export const getById = (state, id) => state.getIn(['entitiesById', id], Map());

export const getMembersByOrgId = (state, organizationId) => state.getIn(['entitiesById', organizationId, 'members'], List());

export const getCoworkersByOrgId = (state, organizationId) => state.getIn(['entitiesById', organizationId, 'coworkers'], List());

export const getSelectedPlanId = (state, organizationId) => state.getIn(['entitiesById', organizationId, 'planId']);

export const getName = (state, organizationId) => state.getIn(['entitiesById', organizationId, 'name']);

export const getBillingEmail = (state, organizationId) => state.getIn(['entitiesById', organizationId, 'billingEmail']);

export const getStripeSubscriptionId = (state, organizationId) => state.getIn(['entitiesById', organizationId, 'stripeSubscriptionId']);

export const getCustomerId = (state, organizationId) => state.getIn(['entitiesById', organizationId, 'stripeCustomerId']);

export const getFirstOrganization = state =>
    state.get('entitiesById').first() || Map();

export const getFirstOrganizationId = state => getFirstOrganization(state).get('id');

export const getFirstOrganizationStatus = state =>
    getFirstOrganization(state).get('status');

export const getFirstOrganizationFlags = state =>
    getFirstOrganization(state).get('flags', Map());

export const getFirstOrganizationMembers = state =>
    getFirstOrganization(state).get('members');

export const getCollaboratorsStatsByOrgId = (state, organizationId) => state.getIn(['collaboratorsStatsByOrgId', organizationId], Map());

export const isOnFreeTrial = (state, organizationId) => {
    const organization = organizationId ? getById(state, organizationId) : getFirstOrganization(state);
    const planId = organization.get('planId');
    return [organizationTypes.PLANS.MIRROR_TRIAL, organizationTypes.PLANS.TRIAL].includes(planId);
};

export const isOnCustomPlan = state =>
    getFirstOrganization(state).get('planId') === organizationTypes.PLANS.CUSTOM_INVOICED;

export const isOnFreeWithWrikePlan = state =>
    getFirstOrganization(state).get('planId') === organizationTypes.PLANS.FREE_WITH_WRIKE;

export const isOrganizationUpdating = (state, organizationId) => getById(state, organizationId).get('isLoading', false);

export const getFirstOrganizationTraits = (state) => {
    const data = getFirstOrganization(state).toJS();
    const {
        members,
        partnerInfos,
        ...rest
    } = data;
    return rest;
};

export const getIsLoading = state => state.get('isLoading');

export const getIsLoaded = state =>
    state.get('isLoaded');

export const getCurrentSendEmailReceiptChoice = (state, organizationId) =>
    getById(state, organizationId).get('sendEmailReceipt', false);



// WEBPACK FOOTER //
// ./src/reducers/organizations.js