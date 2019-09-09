import {
    Map,
    fromJS
} from 'immutable';

import {
    inviteTypes
} from '../consts';

const initialState = Map({
    isLoading: false,
    isLoaded: false,
    invitesByUserId: Map(),
    invitesByEmail: Map(),

});

export default (state = initialState, action) => {
    switch (action.type) {
        case inviteTypes.GET_USER_PENDING_INVITES_REQUEST:
            {
                return state.merge({
                    isLoading: true,
                });
            }
        case inviteTypes.GET_USER_PENDING_INVITES_FAILURE:
            {
                return state.merge({
                    isLoading: false,
                });
            }
        case inviteTypes.GET_USER_PENDING_INVITES_SUCCESS:
            {
                const {
                    invites
                } = action.payload;
                // For now, only get first organization if more than one
                const invite = invites[0];
                if (invite) {
                    return state.merge({
                        isLoading: false
                    }).setIn(
                        ['invitesByUserId', invite.user],
                        fromJS({ ...invite
                        }),
                    );
                }

                return state.merge({
                    isLoading: false,
                });
            }

        case inviteTypes.GET_ORGANIZATION_INVITES_SUCCESS:
            {
                const {
                    invites
                } = action.payload;
                let invitesByUserId = Map();
                let invitesByEmail = Map();
                fromJS(invites).forEach((invite) => {
                    if (invite.get('user')) {
                        invitesByUserId = invitesByUserId.set(invite.get('user'), invite);
                    } else if (invite.get('email')) {
                        invitesByEmail = invitesByEmail.set(invite.get('email'), invite);
                    }
                });
                return state.setIn(['invitesByUserId'], invitesByUserId).setIn(['invitesByEmail'], invitesByEmail);
            }

        case inviteTypes.CREATE_INVITE_SUCCESS:
        case inviteTypes.UPDATE_INVITE_SUCCESS:
            {
                const {
                    invite
                } = action.payload;
                if (invite.user) {
                    return state.setIn(['invitesByUserId', invite.user], fromJS(invite));
                }
                return state.setIn(['invitesByEmail', invite.email], fromJS(invite));
            }

        default:
            return state;
    }
};

export const getInvitesGroupedByUser = state => state.get('invitesByUserId');

export const getInvitesGroupedByEmail = state => state.get('invitesByEmail');

export const getInviteByUserId = (state, userId) => state.getIn(['invitesByUserId', userId], Map());

export const isInvitePending = invite => invite.get('state') === inviteTypes.STATES.PENDING;

export const getIsLoading = state => state.get('isLoading');

export const getIsLoaded = state => state.get('isLoaded');



// WEBPACK FOOTER //
// ./src/reducers/invites.js