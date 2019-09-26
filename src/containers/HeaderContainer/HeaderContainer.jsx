import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Map } from 'immutable';

import { authActions, trackingActions } from '../../actions';
import { organizationTypes, routes } from '../../consts';
import {
  Avatar,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Header,
  Href,
  Icon,
  LimitProgressBar,
} from '../../components';
import {
  FeatureFlag,
  FeatureFlagVariant,
  OpenIntercomBubble,
} from '../../containers';
import {
  getAutoSyncLinksCount,
  getEmbedName,
  getCollaboratorsStatsByOrgId,
  getCurrentPlan,
  getFirstOrganizationId,
  getOrganizationName,
  getOrganizationSubscription,
  getUserAvatarUrl,
  getUserFullName,
  isOrganizationDelinquent,
} from '../../reducers';
import { color } from '../../theme';

const UnitoAccount = styled.div`
  margin-right: 1rem;

  .avatar {
    margin-right: 12px;
  }
`;


const StyledRedBanner = styled.div`
  background-color: ${color.brand.lightRed};
  color: ${color.light.primary};
  padding: 1rem 0;
  text-align: center;

  a, a:active, a:visited, a:hover {
    color: ${color.light.primary};
    text-decoration: underline;
  }
`;

const Separator = styled.hr`
  margin: 8px 0px;
`;

const AvatarIcon = ({ accountAvatarUrl }) => (
  <UnitoAccount>
    <Avatar src={ accountAvatarUrl } colorScheme="light" />
    <Icon name="caret-down" size="lg" />
  </UnitoAccount>
);


class RedBanner extends Component {
  static propTypes = {
    children: PropTypes.node,
    trackEventOnMount: PropTypes.func,
  }

  componentDidMount() {
    this.props.trackEventOnMount();
  }

  render() {
    return (
      <StyledRedBanner>
        { this.props.children }
      </StyledRedBanner>
    );
  }
}


class HeaderContainer extends Component {
  static propTypes = {
    accountAvatarUrl: PropTypes.string,
    accountFullName: PropTypes.string,
    collaboratorsStats: PropTypes.instanceOf(Map).isRequired,
    currentPlan: PropTypes.instanceOf(Map).isRequired,
    embedName: PropTypes.string,
    firstOrganizationId: PropTypes.string,
    isDelinquent: PropTypes.bool,
    numberOfAutoSyncs: PropTypes.number,
    onLogout: PropTypes.func.isRequired,
    workspaceName: PropTypes.string,
  };

  onGoToUpdateCard = () => {
    this.props.trackEvent(
      organizationTypes.EVENTS.USER_CLICKED_FAILED_PAYMENT_BANNER,
    );
  }

  render() {
    const {
      accountAvatarUrl,
      accountFullName,
      collaboratorsStats,
      currentPlan,
      embedName,
      onLogout,
      firstOrganizationId,
      isDelinquent,
      numberOfAutoSyncs,
      trackEvent,
      workspaceName,
    } = this.props;

    if (!firstOrganizationId) {
      return null;
    }

    const avatarIcon = <AvatarIcon accountAvatarUrl={ accountAvatarUrl } />;

    const numberOfCollaborators = collaboratorsStats.get('numCollaborators', 0);
    const planMaxUsers = Number(currentPlan.getIn(['featuresById', 'MAX_USERS', 'limit']));
    const planMaxAutoSyncs = Number(currentPlan.getIn(['featuresById', 'MAX_AUTO_SYNCS', 'limit']));

    return (
      <div className="header-container">
        <Header>
          <li>
            <Href
              to={ routes.ABSOLUTE_PATHS.SYNCS }
              data-test="header__btn--syncs"
            >
              Syncs
            </Href>
          </li>
          <li>
            <Href
              to={ routes.ABSOLUTE_PATHS.CONNECTORS }
              data-test="header__btn--connectors"
            >
              Connectors
            </Href>
          </li>

          <li>
            <Href
              href={ routes.HELP_PATHS.UNITO_HELP_URL }
              data-test="header__btn--help"
            >
              User guide
            </Href>
          </li>

          <Dropdown
            tag="li"
            alignRight
            btnContent={avatarIcon}
            data-test="header__unito-account"
          >
            <DropdownHeader title="Signed in as" subtitle={accountFullName} />

            <DropdownDivider />

            <DropdownItem>
              <FeatureFlag name="billing-experiment-1-over-user-limit">
                <FeatureFlagVariant value={ true }>
                  <div className="clearfix">
                    <LimitProgressBar
                      limitName="Active Users"
                      limitValue={ planMaxUsers }
                      currentValue={ numberOfCollaborators }
                      organizationId={ firstOrganizationId }
                      showDetailsLink={ embedName !== 'trello' }
                      trackEvent={ trackEvent }
                    />
                    <Separator />
                    <LimitProgressBar
                      limitName="Auto Syncs"
                      limitValue={ planMaxAutoSyncs }
                      currentValue={ numberOfAutoSyncs }
                      organizationId={ firstOrganizationId }
                      trackEvent={ trackEvent }
                    />
                  </div>
                </FeatureFlagVariant>
              </FeatureFlag>
            </DropdownItem>

            <FeatureFlag name="billing-experiment-1-over-user-limit">
              <FeatureFlagVariant value={ true }>
                <DropdownDivider />
              </FeatureFlagVariant>
            </FeatureFlag>

            {
              // Hide for now until we figure out how to show the right organization given the context
              // The default at this moment is the first organization, which isn't always the right org in embed trello
              !!embedName && embedName !== 'trello' && (
                <DropdownItem href="/" data-test="header__btn--stand-alone">
                  Open Unito app
                </DropdownItem>
              )
            }

            {
              !embedName && (
                <DropdownHeader title={workspaceName} />
              )
            }

            {
              !embedName && (
                <DropdownItem
                  to={ `${routes.ABSOLUTE_PATHS.ORGANIZATIONS}/${firstOrganizationId}/billing` }
                  data-test="header__btn--billing"
                >
                  Billing
                </DropdownItem>
              )
            }

            {
              !embedName && (
                <DropdownItem
                  to={ `${routes.ABSOLUTE_PATHS.ORGANIZATIONS}/${firstOrganizationId}/people` }
                  data-test="header__btn--workspace"
                >
                  Workspace
                </DropdownItem>
              )
            }

            { !embedName && <DropdownDivider /> }

            {
              !embedName && (
                <DropdownItem
                  onClick={ () => trackEvent(organizationTypes.EVENTS.USER_CLICKED_BILLING_HEADER_MENU_UPGRADE_NOW) }
                  to={ `${routes.ABSOLUTE_PATHS.ORGANIZATIONS}/${firstOrganizationId}/pricing` }
                >
                  Pricing
                </DropdownItem>
              )
            }

            {
              !embedName && (
                <DropdownItem onClick={ onLogout } data-test="header__btn--log-out">
                  Log out
                </DropdownItem>
              )
            }
          </Dropdown>
        </Header>
        {
          isDelinquent && (
            <RedBanner trackEventOnMount={ () => trackEvent(organizationTypes.EVENTS.USER_SAW_FAILED_PAYMENT_BANNER) }>
              <div className="container">
                We had trouble charging your credit card.{ ' ' }
                Please update your billing information to continue using Unito.{ ' ' }
                <Href
                  to={ `${routes.ABSOLUTE_PATHS.ORGANIZATIONS}/${firstOrganizationId}/billing` }
                  onClick={ this.onGoToUpdateCard }
                >
                  Update billing info
                </Href>
              </div>
            </RedBanner>
          )
        }

        {
          !isDelinquent && (numberOfCollaborators > planMaxUsers) && (
            <FeatureFlag name="billing-experiment-1-over-user-limit">
              <FeatureFlagVariant value="banner-cta-self-upgrade">
                <RedBanner trackEventOnMount={ () => trackEvent(organizationTypes.EVENTS.USER_SAW_BILLING_EXPERIMENT_1) }>
                  <div className="container">
                    <Icon name="lock" /> { ' ' }
                    Oops! You’ve hit your plan limit of active users. Unlock your team’s potential! { ' ' }
                    <Href
                      to={ `${routes.ABSOLUTE_PATHS.ORGANIZATIONS}/${firstOrganizationId}/billing` }
                      onClick={ () => trackEvent(organizationTypes.EVENTS.USER_CLICKED_BILLING_EXPERIMENT_1) }
                    >
                      Upgrade now
                    </Href>
                  </div>
                </RedBanner>
              </FeatureFlagVariant>
              <FeatureFlagVariant value="banner-cta-contact-sales">
                <RedBanner trackEvent={ () => trackEvent(organizationTypes.EVENTS.USER_SAW_BILLING_EXPERIMENT_1) }>
                  <div className="container">
                    <Icon name="lock" /> { ' ' }
                    Oops! You’ve hit your plan limit of active users. Unlock your team’s potential! { ' ' }
                    <OpenIntercomBubble
                      onClick={ () => trackEvent(organizationTypes.EVENTS.USER_CLICKED_BILLING_EXPERIMENT_1) }
                      message="Hey Unito! I am over the active users limit. Let's talk about it!"
                    >
                      Contact us
                    </OpenIntercomBubble>
                  </div>
                </RedBanner>
              </FeatureFlagVariant>
            </FeatureFlag>
          )
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const firstOrganizationId = getFirstOrganizationId(state);
  const currentSubscription = getOrganizationSubscription(state, firstOrganizationId);
  return {
    accountAvatarUrl: getUserAvatarUrl(state),
    accountFullName: getUserFullName(state),
    collaboratorsStats: getCollaboratorsStatsByOrgId(state, firstOrganizationId),
    currentPlan: getCurrentPlan(state, currentSubscription),
    embedName: getEmbedName(state),
    firstOrganizationId,
    isDelinquent: isOrganizationDelinquent(state),
    numberOfAutoSyncs: getAutoSyncLinksCount(state),
    workspaceName: getOrganizationName(state),
  };
};

const mapDispatchToProps = dispatch => ({
  onLogout: () => {
    dispatch(authActions.logoutUser());
  },
  trackEvent: (...params) => {
    dispatch(trackingActions.trackEvent(...params));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(HeaderContainer);



// WEBPACK FOOTER //
// ./src/containers/HeaderContainer/HeaderContainer.jsx