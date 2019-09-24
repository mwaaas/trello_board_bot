import React, { Component } from 'react';

import "./Dashboard.scss"
import PropTypes from 'prop-types';
import { authTypes, organizationTypes } from '../../consts';
import { connect } from 'react-redux';


import {
    Switch,
    Route,
    Redirect,
    withRouter
} from 'react-router-dom';

import {
    SyncList
} from "../../containers"

import {
  appActions,
  billingActions,
  flagActions,
  inviteActions,
  linkActions,
  organizationActions,
  providerIdentityActions,
  trackingActions,
} from '../../actions';

import {
  appIsInMaintenance,
  getEmbedName,
  getFeatureFlagValue,
  getIsAuthenticated,
  getIsAuthenticating,
  getIsLoadingFlags,
  getIsLoadingInvites,
  getIsLoadingOrganizations,
  getUserId,
  getUserKeepInformed,
  getUserPendingInvite,
  getSelectedOrganizationId,
  isAppConfigLoading,
  isOrganizationOverUserLimit,
  isUserSiteAdmin,
} from '../../reducers';


class Dashboard extends Component {
      static propTypes = {
          embedName: PropTypes.string,
          fetchUserResources: PropTypes.func.isRequired,
          isAuthenticated: PropTypes.bool.isRequired,
          isSiteAdmin: PropTypes.bool.isRequired,
          organizationId: PropTypes.string,
          trackEvent: PropTypes.func.isRequired,
      };

      componentDidMount() {
          const {
              embedName,
              fetchUserResources,
              isAuthenticated,
          } = this.props;
          if (isAuthenticated) {
              fetchUserResources(embedName);
          }
      }

      componentDidUpdate(prevProps) {
          const {
              embedName,
              fetchUserResources,
              fetchOrgResources,
              isAuthenticated,
              organizationId,
          } = this.props;
          if (!prevProps.isAuthenticated && isAuthenticated) {
              fetchUserResources(embedName);
          }
          // here we need to check if the user is authenticated otherwise fetchOrgResources will be called during logout
          if (isAuthenticated && prevProps.organizationId !== organizationId) {
              fetchOrgResources(embedName);
          }
      }

  render() {
      const {
          match,
          isAuthenticated,
          isAuthenticating,
          history
      } = this.props;

      if (!isAuthenticated && !isAuthenticating) {
          return <Redirect to={`/login${history.location.search || ''}`} />;
      }

      return (
          <div className="dashboard-container">
              <Switch>
                  <Route exact path={ `${match.path}/syncs` } component={ SyncList } />
                  <Redirect exact from="/dashboard" to="/dashboard/syncs" />
                  <Redirect exact from="/" to="/dashboard/syncs" />
              </Switch>
          </div>
    );
  }
}


const mapStateToProps = state => ({
  embedName: getEmbedName(state),
  keepInformed: getUserKeepInformed(state),
  isSiteAdmin: isUserSiteAdmin(state),
  isAuthenticated: getIsAuthenticated(state),
  isAuthenticating: getIsAuthenticating(state),
  isLoading: isAppConfigLoading(state) || getIsLoadingInvites(state) || getIsLoadingFlags(state) || getIsLoadingOrganizations(state),
  isOrgOverUserLimit: isOrganizationOverUserLimit(state),
  overLimitFlagValue: getFeatureFlagValue(state, 'billing-experiment-1-over-user-limit'),
  organizationId: getSelectedOrganizationId(state),
  showMaintenance: appIsInMaintenance(state) && !isUserSiteAdmin(state),
  userPendingInvite: getUserPendingInvite(state),
});

const updateUser = ({ keepInformed }) => (dispatch, getState) =>
  dispatch({
    url: `v1/users/${getUserId(getState())}`,
    method: 'PATCH',
    types: [
      authTypes.UPDATE_USER_REQUEST,
      authTypes.UPDATE_USER_SUCCESS,
      authTypes.UPDATE_USER_FAILURE,
    ],
    payload: { keepInformed },
  });

const mapDispatchToProps = dispatch => ({
  fetchUserResources: async () => {
    dispatch(flagActions.getUserFlags());
    dispatch(billingActions.getProducts());

    await dispatch(organizationActions.getOrganizations());
    dispatch(appActions.setSelectedOrganizationId());
  },
  fetchOrgResources: async (embedName) => {
    dispatch(billingActions.getPlans());
    dispatch(billingActions.getCustomer());
    dispatch(inviteActions.getUserPendingInvites());
    embedName !== 'trello' && dispatch(linkActions.getLinks());
    dispatch(providerIdentityActions.getProviderIdentities());
    dispatch(organizationActions.getCollaborators());
  },
  acceptMarketingEmails: () => dispatch(updateUser({ keepInformed: true })),
  refuseMarketingEmails: () => dispatch(updateUser({ keepInformed: false })),
  trackEvent: (...params) => {
    dispatch(trackingActions.trackEvent(...params));
  },
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Dashboard));
