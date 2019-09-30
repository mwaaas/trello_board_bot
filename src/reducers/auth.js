import { Map, fromJS, List } from 'immutable';
import { authTypes } from '../consts';

export const initialState = Map({
  _id: null,
  plan: null,
  token: null,
  email: null,
  fullName: null,
  roles: List(),
  hasVerifiedEmail: null,
  isAuthenticated: false,
  isAuthenticating: false,
  keepInformed: null,
  // Timestamps of JWT token
  iat: null, // create at
  exp: null, // expiration

});

export default (state = initialState, action) => {
  switch (action.type) {
    case authTypes.REHYDRATE_AUTH_STATE_REQUEST:
    case authTypes.LOGIN_USER_REQUEST: {
      return state.merge({
        isAuthenticating: true,
      });
    }

    case authTypes.REHYDRATE_AUTH_TOKEN_SUCCESS: {
      return state.merge({
        isAuthenticating: false,
        isAuthenticated: true,
      }).merge(fromJS(action.payload));
    }

    case authTypes.REHYDRATE_AUTH_STATE_FAILURE:
    case authTypes.LOGIN_USER_FAILURE: {
      return state.merge(initialState, {
        isAuthenticated: false,
      });
    }

    case authTypes.UPDATE_USER_SUCCESS: {
      const { payload } = action;
      return state.merge(fromJS(payload.user));
    }

    default:
      return state;
  }
};

export const isSiteAdmin = state => state.get('roles', List()).includes('siteadmin');

export const getUserId = state => state.get('_id');

export const getUserAvatarUrl = state => state.get('avatarUrl');

export const getUserFullName = state => state.get('fullName');

export const getUserEmail = state => state.get('email');

export const getKeepInformed = state => state.get('keepInformed');

export const getToken = state => state.get('token');

export const getIsAuthenticating = state => state.get('isAuthenticating');

export const getIsAuthenticated = state => state.get('isAuthenticated');

export const getSignupIntentA = state => state.get('signupIntentA');

export const getSignupIntentB = state => state.get('signupIntentB');



// WEBPACK FOOTER //
// ./src/reducers/auth.js