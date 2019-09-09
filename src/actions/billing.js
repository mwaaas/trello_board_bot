import {
    reset
} from 'redux-form';
import {
    addNotification as notify
} from 'reapop';

import {
    flagActions,
    linkActions
} from '../actions';
import {
    billingTypes,
    routes
} from '../consts';
import {
    getOrganizationSubscriptionId,
    getOrganizationCustomerId,
    getSelectedOrganizationId,
} from '../reducers';

export const getCustomer = orgCustomerId => (dispatch, getState) => {
    const state = getState();
    const organizationId = getSelectedOrganizationId(state);
    const customerId = orgCustomerId || getOrganizationCustomerId(state, organizationId);

    return dispatch({
        types: [
            billingTypes.GET_CUSTOMER_REQUEST,
            billingTypes.GET_CUSTOMER_SUCCESS,
            billingTypes.GET_CUSTOMER_FAILURE,
        ],
        url: routes.API_PATHS.GET_CUSTOMER(customerId),
    });
};

export const getProducts = () => ({
    types: [
        billingTypes.GET_PRODUCTS_REQUEST,
        billingTypes.GET_PRODUCTS_SUCCESS,
        billingTypes.GET_PRODUCTS_FAILURE,
    ],
    url: routes.API_PATHS.GET_PRODUCTS,
});

export const getPlans = organizationId => (dispatch, getState) => {
    const orgId = organizationId || getSelectedOrganizationId(getState());
    return dispatch({
        types: [
            billingTypes.GET_PLANS_REQUEST,
            billingTypes.GET_PLANS_SUCCESS,
            billingTypes.GET_PLANS_FAILURE,
        ],
        url: routes.API_PATHS.GET_PLANS(orgId),
    });
};

export const getCustomerInvoices = customerId => ({
    types: [
        billingTypes.GET_CUSTOMER_INVOICES_REQUEST,
        billingTypes.GET_CUSTOMER_INVOICES_SUCCESS,
        billingTypes.GET_CUSTOMER_INVOICES_FAILURE,
    ],
    url: routes.API_PATHS.GET_CUSTOMER_INVOICES(customerId), // eslint-disable-line
});

export const updateSubscription = (organizationId, planId, stripeToken) => (dispatch, getState) => {
    const state = getState();
    const customerId = getOrganizationCustomerId(state, organizationId);
    const subscriptionId = getOrganizationSubscriptionId(state, organizationId);

    const dispatchObj = {
        payload: !subscriptionId ? {
            planId,
            source: stripeToken,
            customerId
        } : {
            planId,
            source: stripeToken
        },
        method: !subscriptionId ? routes.METHODS.POST : routes.METHODS.PUT,
        url: !subscriptionId ?
            routes.API_PATHS.CREATE_SUBSCRIPTION :
            routes.API_PATHS.UPDATE_SUBSCRIPTION(subscriptionId), // eslint-disable-line
    };

    return dispatch({
        types: [
            billingTypes.UPDATE_SUBSCRIPTION_REQUEST,
            billingTypes.UPDATE_SUBSCRIPTION_SUCCESS,
            billingTypes.UPDATE_SUBSCRIPTION_FAILURE,
        ],
        onSuccess: (response) => {
            dispatch(getCustomerInvoices(customerId));
            dispatch(linkActions.getLinks());
            dispatch(flagActions.getUserFlags());
            dispatch(notify({
                closeButton: true,
                dismissible: true,
                position: 'tr',
                title: 'Subscription updated',
                message: `You have successfully subscribed to the plan: ${response.subscription.plan.nickname}`,
                status: 'success',
            }));
        },
        ...dispatchObj,
    });
};

export const cancelSubscription = (organizationId, cancelationFeedback, willBeBack) => (dispatch, getState) => {
    const state = getState();
    const subscriptionId = getOrganizationSubscriptionId(state, organizationId);
    dispatch({
        types: [
            billingTypes.CANCEL_SUBSCRIPTION_REQUEST,
            billingTypes.CANCEL_SUBSCRIPTION_SUCCESS,
            billingTypes.CANCEL_SUBSCRIPTION_FAILURE,
        ],
        method: routes.METHODS.DELETE,
        url: routes.API_PATHS.CANCEL_SUBSCRIPTION(subscriptionId), // eslint-disable-line
        payload: {
            cancelationFeedback,
            willBeBack,
        },
        onSuccess: () => {
            dispatch(linkActions.getLinks());
            dispatch(flagActions.getUserFlags());
            dispatch(notify({
                closeButton: true,
                dismissible: true,
                position: 'tr',
                title: 'Subscription canceled',
                status: 'info',
            }));
        },
    });
};

export const addCoupon = (customerId, couponId) => (dispatch) => {
    dispatch({
        types: [
            billingTypes.ADD_COUPON_REQUEST,
            billingTypes.ADD_COUPON_SUCCESS,
            billingTypes.ADD_COUPON_FAILURE,
        ],
        method: routes.METHODS.PUT,
        url: routes.API_PATHS.ADD_COUPON(customerId), // eslint-disable-line
        payload: {
            couponId
        },
        onSuccess: () => {
            dispatch(reset(billingTypes.COUPON_FORM_NAME));
        },
    });
};

export const editBillingEmail = (customerId, billingEmail) => ({
    types: [
        billingTypes.EDIT_BILLING_EMAIL_REQUEST,
        billingTypes.EDIT_BILLING_EMAIL_SUCCESS,
        billingTypes.EDIT_BILLING_EMAIL_FAILURE,
    ],
    method: routes.METHODS.PUT,
    url: routes.API_PATHS.GET_CUSTOMER(customerId), // eslint-disable-line
    payload: {
        billingEmail
    },
});



// WEBPACK FOOTER //
// ./src/actions/billing.js