import {
    Map,
    List,
    fromJS
} from 'immutable';

import {
    billingTypes
} from '../consts';
import {
    normalizeEntitiesById
} from '../utils';

const initialState = Map({
    customersById: Map(),
    featuresById: Map(),
    plansAreLoading: false,
    plansById: Map(),
    productsById: Map(),
    invoicesById: Map(),
    subscriptionsById: Map(),
    sourcesById: Map(), // Stripe sources (payment methods)
});

export default (state = initialState, action) => {
    switch (action.type) {
        case billingTypes.GET_PLANS_REQUEST:
            {
                return state.merge({
                    plansAreLoading: true,
                });
            }

        case billingTypes.GET_PLANS_FAILURE:
            {
                return state.merge({
                    plansAreLoading: false,
                });
            }

        case billingTypes.GET_PRODUCTS_SUCCESS:
            {
                const products = fromJS(action.payload.products);
                return state.set('productsById', normalizeEntitiesById(products));
            }

        case billingTypes.GET_PLANS_SUCCESS:
            {
                let plans = fromJS(action.payload.plans);
                const features = plans.reduce((acc, plan) => (acc.push(...plan.get('features'))), List());
                // Store an indexed by featureId version of the planProdile features inside each plan.
                plans = plans.map(plan => plan.set('featuresById', normalizeEntitiesById(plan.get('features'))));

                return state.merge({
                    featuresById: normalizeEntitiesById(features),
                    plansAreLoading: false,
                    plansById: normalizeEntitiesById(plans),
                });
            }

        case billingTypes.GET_CUSTOMER_SUCCESS:
        case billingTypes.ADD_COUPON_SUCCESS:
        case billingTypes.UPDATE_SUBSCRIPTION_SUCCESS:
            {
                const {
                    sources, // eslint-disable-line
                    subscriptions,
                    ...customer
                } = action.payload.customer;

                return state
                    .mergeIn(['customersById', customer.id], fromJS({
                        ...customer,
                        subscriptions: subscriptions.map(sub => sub.id), // Only keep subscription ids
                        sources: sources.map(source => source.id), // Only keep source ids
                    }))
                    .merge({
                        sourcesById: normalizeEntitiesById(fromJS(sources)),
                        subscriptionsById: normalizeEntitiesById(fromJS(subscriptions)),
                    });
            }

        case billingTypes.CANCEL_SUBSCRIPTION_SUCCESS:
            {
                const {
                    customer,
                    subscription
                } = action.payload;
                return state
                    .mergeIn(['customersById', customer.id], fromJS(customer))
                    .mergeIn(['subscriptionsById', subscription.id], fromJS(subscription));
            }

        case billingTypes.GET_CUSTOMER_INVOICES_SUCCESS:
            {
                const invoices = fromJS(action.payload.invoices);
                const updatedInvoices = invoices.map((invoice) => {
                    const lines = invoice.get('lines').map(line => line.set('plan', line.getIn(['plan', 'id'])));
                    return invoice.set('lines', lines);
                });

                return state.merge({
                    invoicesById: normalizeEntitiesById(updatedInvoices),
                });
            }

        default:
            return state;
    }
};

export const getProducts = state => state.get('productsById');

export const getProjectSyncProduct = (state) => {
    const products = getProducts(state);
    return products.find(product => product.get('name') === 'Project Sync') || Map();
};

export const getTaskSyncProduct = (state) => {
    const products = getProducts(state);
    return products.find(product => product.get('name') === 'Task Sync') || Map();
};

export const getPlans = state => state.get('plansById').sortBy(plan => -plan.get('amount'));

export const getProjectSyncVisiblePlans = (state) => {
    const plans = getPlans(state);
    const projectSyncProduct = getProjectSyncProduct(state);
    return plans
        .filter(plan => plan.get('isVisible', false))
        .filter(plan => plan.get('product') === projectSyncProduct.get('id'));
};

export const getTaskSyncPlans = (state) => {
    const plans = getPlans(state);
    const taskSyncProduct = getTaskSyncProduct(state);
    return plans.filter(plan => plan.get('product') === taskSyncProduct.get('id'));
};

export const getTaskSyncVisiblePlans = (state) => {
    const plans = getTaskSyncPlans(state);
    return plans.filter(plan => plan.get('isVisible', false));
};

export const getPlanById = (state, planId) => state.getIn(['plansById', planId], Map());

export const getFeatureById = (state, featureId) => state.getIn(['featuresById', featureId], Map());

export const getSubscriptionById = (state, subscriptionId) => state.getIn(['subscriptionsById', subscriptionId], Map());

export const getCustomerById = (state, customerId) =>
    state.getIn(['customersById', customerId], Map());

export const getCustomerDefaultPaymentSource = (state, customerId) => {
    const customer = getCustomerById(state, customerId);
    const defaultSourceId = customer.get('defaultSource');
    return state.getIn(['sourcesById', defaultSourceId], Map());
};

export const getCustomerInvoices = (state, customerId) =>
    state.get('invoicesById')
    .filter(invoice => invoice.get('customer') === customerId)
    .sortBy(invoice => invoice.get('created'));

export const getPlansAreLoading = state => state.get('plansAreLoading');

const getEntityCoupon = (entity) => {
    const coupon = entity.getIn(['discount', 'coupon']);
    if (!coupon || !coupon.get('valid')) {
        return undefined;
    }
    return coupon;
};

export const getCustomerCoupon = (state, customerId) => {
    const customer = getCustomerById(state, customerId);
    return getEntityCoupon(customer);
};

export const getSubscriptionCoupon = (state, subscriptionId) => {
    const subscription = getSubscriptionById(state, subscriptionId);
    return getEntityCoupon(subscription);
};



// WEBPACK FOOTER //
// ./src/reducers/billing.js