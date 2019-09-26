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
  FeatureFlag,
  FeatureFlagVariant,
  HeaderContainer,
  PeopleContainer,
  PricingContainer,
  PickUseCase,
  SyncContainer,
  SyncList,
  UserOrgInviteModal,
  WelcomeContainer,
} from '../../containers';
import { authTypes, organizationTypes } from '../../consts';
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

  render() {
    const {
      embedName,
      history,
      isAuthenticated,
      isAuthenticating,
      isLoading,
      isOrgOverUserLimit,
      match,
      organizationId,
      overLimitFlagValue,
      userPendingInvite,
      showMaintenance,
      trackEvent,
    } = this.props;

    if (!isAuthenticated && !isAuthenticating) {
      return <Redirect to={`/login${history.location.search || ''}`} />;
    }

    if (isLoading || isAuthenticating) {
      return <Loading />;
    }

    return (
      <div className="dashboard-container">
        { this.getMarketingEmailModal() }
        { showMaintenance && <Maintenance /> }
        { !userPendingInvite.isEmpty() && <UserOrgInviteModal invite={ userPendingInvite } /> }

        <HeaderContainer />
        <Switch>
          <Route exact path={ `${match.path}/syncs` } component={ SyncList } />
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
              <FeatureFlag name="sync-wizard">
                <FeatureFlagVariant value={ true }>
                  <Switch>
                    <Route path={ `${multisyncMatch.path}/add` } render={ (props) => {
                      if (isOrgOverUserLimit && ['block-add-sync', 'block-add-edit-sync'].includes(overLimitFlagValue)) {
                        const eventName = overLimitFlagValue === 'block-add-sync'
                          ? organizationTypes.EVENTS.USER_CLICKED_UPGRADE_NOW_ADD_SYNC_BLOCKED
                          : organizationTypes.EVENTS.USER_CLICKED_UPGRADE_NOW_ADD_EDIT_SYNC_BLOCKED;

                        const loadEventName = overLimitFlagValue === 'block-add-sync'
                          ? organizationTypes.EVENTS.USER_SAW_ADD_SYNC_BLOCKED
                          : organizationTypes.EVENTS.USER_SAW_ADD_EDIT_SYNC_BLOCKED;

                        return (
                          <BlockSyncActiveUsersOverLimit
                            isEmbed={ !!embedName }
                            trackLoadEvent={ () => trackEvent(loadEventName) }
                            trackUpgradeEvent={ () => trackEvent(eventName) }
                            trackCancelEvent={ () => trackEvent(organizationTypes.EVENTS.USER_CLICKED_BACK_SYNC_BLOCKED) }
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
                            trackUpgradeEvent={ () => trackEvent(organizationTypes.EVENTS.USER_CLICKED_UPGRADE_NOW_ADD_EDIT_SYNC_BLOCKED) }
                            trackCancelEvent={ () => trackEvent(organizationTypes.EVENTS.USER_CLICKED_BACK_SYNC_BLOCKED) }
                          >
                            To unlock the ability to edit multisyncs, upgrade your plan!
                          </BlockSyncActiveUsersOverLimit>
                        );
                      }

                      return <EditMultisync {...props} />;
                    }} />
                    <Route component={ NotFound } />
                  </Switch>
                </FeatureFlagVariant>
                <FeatureFlagVariant value={ false }>
                  <Route component={ NotFound } />
                </FeatureFlagVariant>
              </FeatureFlag>
            )}
          />

          <Route
            path={ `${match.path}/use-cases` }
            render={ ({ match: pickUseCaseMatch }) => (
              <FeatureFlag name="sync-wizard">
                <FeatureFlagVariant value={ true }>
                  <Switch>
                    <Route
                      path={ pickUseCaseMatch.url }
                      render={ props => <PickUseCase {...props} embedName={ embedName } /> }
                    />
                  </Switch>
                </FeatureFlagVariant>
                <FeatureFlagVariant value={ false }>
                  <Route component={ NotFound } />
                </FeatureFlagVariant>
              </FeatureFlag>
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
              && <Route exact path={ `${match.path}/organizations/:organizationId/people` } component={ PeopleContainer } />
          }
          {
            organizationId && <Route path={ `${match.path}/organizations/:organizationId/billing` } component={ BillingContainer } />
          }
          {
            organizationId && <Route path={ `${match.path}/organizations/:organizationId/pricing` } component={ PricingContainer } />
          }
          <Route exact path={ `${match.path}/welcome` } component={ WelcomeContainer } />
          <Redirect exact from="/dashboard" to="/dashboard/syncs" />
          <Redirect exact from="/embed/:embedName/dashboard" to="/embed/:embedName/dashboard/syncs" />
          <Route component={ NotFound } />
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



// WEBPACK FOOTER //
// ./src/containers/Dashboard/Dashboard.jsx