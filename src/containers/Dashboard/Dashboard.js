import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Route,
  Redirect,
  Switch,
  withRouter,
} from 'react-router-dom';

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
  BillingContainer,
  ConnectorList,
  CreateMultisync,
  EditMultisync,
  HeaderContainer,
  PeopleContainer,
  PricingContainer,
  SyncContainer,
  SyncList,
  UserOrgInviteModal,
  WelcomeContainer,
} from '../../containers';
import { authTypes, trackingTypes, routes } from '../../consts';
import {
  BlockSyncActiveUsersOverLimit,
  Loading,
  Maintenance,
  Modal,
  NotFound,
} from '../../components';
import {
  appIsInMaintenance,
  getEmbedName,
  getFeatureFlagValue,
  getIsAuthenticated,
  getIsAuthenticating,
  getUserId,
  getUserKeepInformed,
  getUserPendingInvite,
  getSelectedOrganizationId,
  isOrganizationOverUserLimit,
  isUserSiteAdmin,
} from '../../reducers';
import './Dashboard.scss';


class Dashboard extends Component {
  static propTypes = {
    embedName: PropTypes.string,
    fetchUserResources: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
    isSiteAdmin: PropTypes.bool.isRequired,
    organizationId: PropTypes.string,
    trackEvent: PropTypes.func.isRequired,
  }

  state = {
    isLoading: true,
  };

  async componentDidMount() {
    const {
      embedName,
      fetchUserResources,
      isAuthenticated,
    } = this.props;

    if (isAuthenticated) {
      fetchUserResources(embedName);
    }
  }

  async componentDidUpdate(prevProps) {
    const {
      embedName,
      fetchOrgResources,
      getPlans,
      organizationId,
    } = this.props;

    // here we need to check if the user is authenticated otherwise fetchOrgResources will be called during logout
    if (organizationId && prevProps.organizationId !== organizationId) {
      this.setState({ isLoading: true });
      await fetchOrgResources(embedName);
      this.setState({ isLoading: false });
      getPlans();
    }
  }

  getMarketingEmailModal() {
    const {
      acceptMarketingEmails,
      keepInformed,
      refuseMarketingEmails,
    } = this.props;
    const suggestMarketingEmails = keepInformed === null;

    return (
      <Modal
        isOpen={ suggestMarketingEmails }
        title="Subscribe to our updates!"
        cancelLabel="Not now"
        confirmLabel="Subscribe"
        onCancel={ refuseMarketingEmails }
        onConfirm={ acceptMarketingEmails }
      >
        Get more out of Unito with workflow best practices, sync tips and product updates!
        You can unsubscribe at any time.
      </Modal>
    );
  }

  trackDashboardAction = (actionName, data) => {
    const eventName = trackingTypes.USER_DASHBOARD_EVENTS.ACTION_NAME;
    this.props.trackEvent(eventName, { action_name: actionName, ...data });
  }

  render() {
    const {
      embedName,
      history,
      isAuthenticated,
      isAuthenticating,
      isOrgOverUserLimit,
      match,
      organizationId,
      overLimitFlagValue,
      userPendingInvite,
      showMaintenance,
      trackEvent,
    } = this.props;

    if (!isAuthenticated && !isAuthenticating) {
      // Our assumption is that we will see more signup errors coming from new users, so we want to redirect to the signup page
      return <Redirect to={`/login${history.location.search || ''}`} />; // Fix for users who haven't accepted our terms of service
    }

    if (this.state.isLoading || isAuthenticating) {
      return <Loading />;
    }

    return (
      <div className="dashboard-container">
        { this.getMarketingEmailModal() }
        { showMaintenance && <Maintenance /> }
        { !userPendingInvite.isEmpty() && <UserOrgInviteModal invite={ userPendingInvite } /> }

        <HeaderContainer />
        <Switch>
          <Route exact path={ `${match.path}/syncs` } render={ props => (
            <SyncList trackDashboardAction={this.trackDashboardAction} {...props} />
          )} />
          <Route exact path={ `${match.path}/connectors` } component={ ConnectorList } />
          <Route path={ `${match.path}/links` } component={ SyncContainer } />
          { /*
              FeatureFlag variants should be in the render of a specific route or it will cause issues
              (white screens) if we have a <FeatureFlag> component as a child of the <Switch> component
             */
          }
          <Route
            path={ `${match.path}/multisyncs` }
            render={ ({ match: multisyncMatch }) => (
            <Switch>
              <Route path={ `${multisyncMatch.path}/add` } render={ (props) => {
                if (isOrgOverUserLimit && ['block-add-sync', 'block-add-edit-sync'].includes(overLimitFlagValue)) {
                  const eventName = overLimitFlagValue === 'block-add-sync'
                    ? trackingTypes.USER_DROPDOWN_EVENTS.USER_CLICKED_UPGRADE_NOW_ADD_SYNC_BLOCKED
                    : trackingTypes.USER_DROPDOWN_EVENTS.USER_CLICKED_UPGRADE_NOW_ADD_EDIT_SYNC_BLOCKED;

                  const loadEventName = overLimitFlagValue === 'block-add-sync'
                    ? trackingTypes.USER_DROPDOWN_EVENTS.USER_SAW_ADD_SYNC_BLOCKED
                    : trackingTypes.USER_DROPDOWN_EVENTS.USER_SAW_ADD_EDIT_SYNC_BLOCKED;

                  return (
                    <BlockSyncActiveUsersOverLimit
                      isEmbed={ !!embedName }
                      trackLoadEvent={ () => trackEvent(loadEventName) }
                      trackUpgradeEvent={ () => trackEvent(eventName) }
                      trackCancelEvent={ () => trackEvent(trackingTypes.USER_DROPDOWN_EVENTS.USER_CLICKED_BACK_SYNC_BLOCKED) }
                    >
                      To unlock the ability to create multisyncs, upgrade your plan!
                    </BlockSyncActiveUsersOverLimit>
                  );
                }

                return <CreateMultisync {...props} />;
              }} />

              <Route path={ `${multisyncMatch.path}/edit/:multisyncId` } render={ (props) => {
                if (isOrgOverUserLimit && overLimitFlagValue === 'block-add-edit-sync') {
                  return (
                    <BlockSyncActiveUsersOverLimit
                      isEmbed={ !!embedName }
                      trackUpgradeEvent={ () => trackEvent(trackingTypes.USER_DROPDOWN_EVENTS.USER_CLICKED_UPGRADE_NOW_ADD_EDIT_SYNC_BLOCKED) }
                      trackCancelEvent={ () => trackEvent(trackingTypes.USER_DROPDOWN_EVENTS.USER_CLICKED_BACK_SYNC_BLOCKED) }
                    >
                      To unlock the ability to edit multisyncs, upgrade your plan!
                    </BlockSyncActiveUsersOverLimit>
                  );
                }

                return <EditMultisync {...props} />;
              }} />
              <Route component={ NotFound } />
            </Switch>
            )}
          />

          <Redirect strict exact from={ `${match.path}/organizations/` } to={ `${match.path}/organizations` } />
          <Route
            exact
            path={ `${match.path}/organizations` }
            render={
              ({ match: orgMatch }) =>
                (!organizationId ? <Loading /> : <Redirect to={ `${orgMatch.path}/${organizationId}/billing` }/>)
            }
          />
          {
            organizationId
              && <Route
                exact path={ `${match.path}/organizations/:organizationId/people` }
                render={ props => <PeopleContainer {...props} /> }
              />
          }
          {
            organizationId
              && <Route
                path={ `${match.path}/organizations/:organizationId/billing` }
                render={ props => <BillingContainer {...props} /> }
              />
          }
          {
            organizationId
              && <Route
                path={ `${match.path}/organizations/:organizationId/pricing` }
                render={ props => <PricingContainer {...props} /> }
              />
          }
          <Route exact path={ `${match.path}/welcome` } component={ WelcomeContainer } />
          <Redirect exact from="/dashboard" to="/dashboard/syncs" />
          <Redirect exact from="/embed/:embedName/dashboard" to="/embed/:embedName/dashboard/syncs" />
          <Route render={() => (
            <NotFound
              goBackLink={ routes.ABSOLUTE_PATHS.DASHBOARD }
              goBackText="Go back to your syncs"
            />
          )} />
        </Switch>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const organizationId = getSelectedOrganizationId(state);

  return {
    embedName: getEmbedName(state),
    keepInformed: getUserKeepInformed(state),
    isSiteAdmin: isUserSiteAdmin(state),
    isAuthenticated: getIsAuthenticated(state),
    isAuthenticating: getIsAuthenticating(state),
    isOrgOverUserLimit: isOrganizationOverUserLimit(state, organizationId),
    overLimitFlagValue: getFeatureFlagValue(state, 'billing-experiment-1-over-user-limit'),
    showMaintenance: appIsInMaintenance(state) && !isUserSiteAdmin(state),
    userPendingInvite: getUserPendingInvite(state),
    organizationId,
  };
};

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
    dispatch(providerIdentityActions.getProviderIdentities());
    await dispatch(organizationActions.getOrganizations());
    dispatch(appActions.setSelectedOrganizationId());
  },
  fetchOrgResources: async embedName => Promise.all([
    // dispatch(billingActions.getCustomer()),
    // dispatch(inviteActions.getUserPendingInvites()),
    embedName !== 'trello' && dispatch(linkActions.getLinks()),
    // dispatch(organizationActions.getCollaborators()),
  ]),
  getPlans: () => dispatch(billingActions.getPlans()),
  acceptMarketingEmails: () => dispatch(updateUser({ keepInformed: true })),
  refuseMarketingEmails: () => dispatch(updateUser({ keepInformed: false })),
  trackEvent: (...params) => {
    dispatch(trackingActions.trackEvent(...params));
  },
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Dashboard));



// WEBPACK FOOTER //
// ./src/containers/Dashboard/Dashboard.jsx