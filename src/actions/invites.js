import {
    linkActions,
    organizationActions
} from '../actions';
import {
    inviteTypes,
    routes
} from '../consts';
import {
    getUserId
} from '../reducers';
import appHistory from '../app-history';
import {
    reset
} from 'redux-form';


export const getInvites = organizationId => ({
    types: [
        inviteTypes.GET_ORGANIZATION_INVITES_REQUEST,
        inviteTypes.GET_ORGANIZATION_INVITES_SUCCESS,
        inviteTypes.GET_ORGANIZATION_INVITES_FAILURE,
    ],
    url: routes.API_PATHS.GET_ORGANIZATION_INVITES(organizationId), // eslint-disable-line
});

export const getUserPendingInvites = () => (dispatch, getState) => {
    const state = getState();
    const userId = getUserId(state);
    dispatch({
        types: [
            inviteTypes.GET_USER_PENDING_INVITES_REQUEST,
            inviteTypes.GET_USER_PENDING_INVITES_SUCCESS,
            inviteTypes.GET_USER_PENDING_INVITES_FAILURE,
        ],
        url: routes.API_PATHS.GET_USER_PENDING_INVITES(userId), // eslint-disable-line
    });
};

export const inviteCoworker = (organizationId, userId, email) => (dispatch) => {
    dispatch({
        types: [
            inviteTypes.CREATE_INVITE_REQUEST,
            inviteTypes.CREATE_INVITE_SUCCESS,
            inviteTypes.CREATE_INVITE_FAILURE,
        ],
        url: routes.API_PATHS.CREATE_INVITE,
        method: routes.METHODS.POST,
        payload: {
            organizationId,
            userId,
            email
        },
        onSuccess: () => {
            dispatch(reset(inviteTypes.INVITE_BY_EMAIL_FORM));
        },
    });
};

export const updateInvite = (inviteId, inviteState, onSuccess) => (dispatch) => {
    dispatch({
        types: [
            inviteTypes.UPDATE_INVITE_REQUEST,
            inviteTypes.UPDATE_INVITE_SUCCESS,
            inviteTypes.UPDATE_INVITE_FAILURE,
        ],
        method: routes.METHODS.PATCH,
        url: routes.API_PATHS.UPDATE_INVITE(inviteId), // eslint-disable-line
        payload: {
            state: inviteState
        },
        onSuccess: (response) => {
            onSuccess && onSuccess(response); // eslint-disable-line
            dispatch(reset(inviteTypes.INVITE_BY_EMAIL_FORM));
        },
    });
};

export const acceptInvite = inviteId => (dispatch) => {
    dispatch(updateInvite(
        inviteId,
        inviteTypes.STATES.ACCEPTED,
        (data) => {
            dispatch(linkActions.getLinks());
            dispatch(organizationActions.getOrganizations());
            const pathname = `${routes.ABSOLUTE_PATHS.ORGANIZATIONS}/${data.invite.organization.id}/`;
            appHistory.push({
                pathname
            });
        },
    ));
};

export const declineInvite = inviteId => (dispatch) => {
    dispatch(updateInvite(inviteId, inviteTypes.STATES.DECLINED));
};

export const cancelInvite = inviteId => (dispatch) => {
    dispatch(updateInvite(inviteId, inviteTypes.STATES.CANCELED));
};

export const resendInvite = inviteId => (dispatch) => {
    dispatch(updateInvite(inviteId, inviteTypes.STATES.PENDING));
};



// WEBPACK FOOTER //
// ./src/actions/invites.js