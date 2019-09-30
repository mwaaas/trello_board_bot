import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { List } from 'immutable';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';

import { linkActions, multisyncActions } from '../../actions';
import {
  Button,
  Dropdown,
  DropdownItem,
  Href,
  IconHoverTooltip,
  LinkList,
  Title,
  LinkItemLoading,
  Card,
  MultisyncList,
  Subheading,
  UsefulLinks,
} from '../../components';

import { routes, trackingTypes } from '../../consts'; // Tracking types for dashboard buttons
import { SiteAdminContainer, FeatureFlag, FeatureFlagVariant } from '../../containers';
import {
  getEmbedName,
  getSelectedOrganizationId,
  getSignupIntentA,
  getSortedSyncsWithoutMultisync,
  getSortedSyncsByMultisyncId,
  getSortedMultisyncs,
  getUserId,
  getUserFullName,
  isLoadedLinks,
  isLoadedMultisyncs,
  isUserSiteAdmin,
  isOrganizationAccountSuspended,
} from '../../reducers';
import { fontWeight } from '../../theme';


const Content = styled.div`
  background: white;
  min-height: calc(100vh - 66px);
  padding: 4em 6em;
`;

const SyncItems = styled.div`
  margin-top: 3em;
`;

const ButtonMargin = styled.div`
  display: inline-block;
  margin-right: 1rem;
`;

const BoldModifier = styled.span`
  font-weight: ${fontWeight.medium};
`;

const UsefulLinksWrapper = styled.div`
  margin-top: 3em;
`;

const TitleWrapper = styled.div`
  margin-bottom: 3rem;
`;

const EmptyStateImg = styled.img`
  margin-bottom: 1.6rem;
  width: 250px;
  height: auto;
`;

class SyncList extends Component {
  static propTypes = {
    embedName: PropTypes.string.isRequired,
    getLinks: PropTypes.func.isRequired,
    trackDashboardAction: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isSiteAdmin: PropTypes.bool,
    linkList: PropTypes.instanceOf(List).isRequired,
    multisyncList: PropTypes.instanceOf(List).isRequired,
    orgAccountIsSuspended: PropTypes.bool.isRequired,
    userId: PropTypes.string.isRequired,
  };

  static defaultProps = {
    isSiteAdmin: false,
  };

  componentDidMount() {
    const {
      embedName,
      selectedOrganizationId,
      getLinks,
      getMultisyncs,
    } = this.props;
    if (selectedOrganizationId) {
      getLinks(embedName);
      getMultisyncs(embedName);
    }
  }

  getRedirectionProps = () => {
    const isEmbed = !!this.props.embedName;

    // Open in new tab inside embed mode, redirect in standalone
    return isEmbed
      ? { href: `/#${routes.ABSOLUTE_PATHS.ORGANIZATIONS}` }
      : { to: routes.ABSOLUTE_PATHS.ORGANIZATIONS };
  }

  getDropdownMenu = () => {
    const { trackDashboardAction } = this.props;
    return (
      <Dropdown
        alignRight
        onToggle={ () => trackDashboardAction(trackingTypes.USER_DASHBOARD_EVENTS.ACTIONS.ARROW) }>
        <DropdownItem
          to={ routes.ABSOLUTE_PATHS.ADD_LINK }
          onClick={ () => trackDashboardAction(trackingTypes.USER_DASHBOARD_EVENTS.ACTIONS.ITEM_SYNC) }
        >
          <BoldModifier>Sync</BoldModifier> (2 projects)
        </DropdownItem>
        <DropdownItem
          to={ routes.ABSOLUTE_PATHS.ADD_MULTISYNC }
          onClick={ () => trackDashboardAction(trackingTypes.USER_DASHBOARD_EVENTS.ACTIONS.ITEM_MULTI_SYNC) }
        >
          <BoldModifier>Multi-Sync</BoldModifier> (3 or more projects)
        </DropdownItem>
      </Dropdown>
    );
  }

  renderSyncs = () => {
    const {
      isLoading,
      linkList,
      multisyncList,
      embedName,
      trackDashboardAction,
      syncsByMultisyncId,
      isSiteAdmin,
      userId,
      orgAccountIsSuspended,
    } = this.props;

    if (isLoading) {
      return (
        <div>
          <LinkItemLoading />
          <LinkItemLoading />
          <LinkItemLoading />
          <LinkItemLoading />
        </div>
      );
    }

    if (linkList.isEmpty() && multisyncList.isEmpty()) {
      return (
        <Card className="link-list text-center">
          <EmptyStateImg
            alt=""
            src={ `${process.env.PUBLIC_URL}/images/empty_state.svg` }
          />
          <Title type="h3">
            Start creating your sync!
          </Title>
          <Subheading>
            Add the projects and customize the information that will sync between them.
          </Subheading>

          <FeatureFlag name="onboarding-flow">
            <FeatureFlagVariant value={ true }>
              <ButtonMargin>
                <Button
                  btnStyle="secondary"
                  reverse
                  to={routes.ABSOLUTE_PATHS.WELCOME}
                  type="href"
                >
                  Check our welcome tutorial
                </Button>
              </ButtonMargin>
            </FeatureFlagVariant>
          </FeatureFlag>
          <Button
            btnStyle="primary"
            className="dropdown-toggle"
            data-test="dashboard__btn--addsync"
            disabled={ orgAccountIsSuspended }
            to={ routes.ABSOLUTE_PATHS.ADD_LINK }
            type={ orgAccountIsSuspended ? 'button' : 'href' }
            onClick={ () => trackDashboardAction(trackingTypes.USER_DASHBOARD_EVENTS.ACTIONS.ADD_SYNC) }
            dropdown={ this.getDropdownMenu() }
          >
            Add sync { ' ' }
            {
              orgAccountIsSuspended && (
                <IconHoverTooltip placement="top">
                  Your account is suspended.<br />
                  <Href {...this.getRedirectionProps()}>Subscribe to a plan</Href> to create new syncs.
                </IconHoverTooltip>
              )
            }
          </Button>
        </Card>
      );
    }

    return (
      <div>
        <MultisyncList
          multisyncList={ multisyncList }
          syncsByMultisyncId={ syncsByMultisyncId }
          isSiteAdmin={ isSiteAdmin }
          userId={ userId }
        />
        <LinkList
          embedName={ embedName }
          isSiteAdmin={ isSiteAdmin }
          linkList={ linkList }
          userId={ userId }
        />
      </div>

    );
  }

  render() {
    const {
      embedName,
      isSiteAdmin,
      linkList,
      multisyncList,
      orgAccountIsSuspended,
      signupIntentA,
      trackDashboardAction,
    } = this.props;

    return (
      <Content className="sync-list container">
        <TitleWrapper className="row">
          <Title type="h1" className="col-xs-6">
            Your syncs
          </Title>
          <div className="col-xs-6">
            { !(linkList.isEmpty() && multisyncList.isEmpty())
                && <Button
                  btnStyle="primary"
                  data-test="dashboard__btn--addsync"
                  disabled={ orgAccountIsSuspended }
                  pullRight
                  onClick={() => trackDashboardAction(trackingTypes.USER_DASHBOARD_EVENTS.ACTIONS.ADD_SYNC)}
                  to={ routes.ABSOLUTE_PATHS.ADD_LINK }
                  type={ orgAccountIsSuspended ? 'button' : 'href' }
                  dropdown={ this.getDropdownMenu() }
                >
                  Add sync { ' ' }
                  {
                    orgAccountIsSuspended
                      && <IconHoverTooltip placement="top">
                        Your account is suspended.
                        <br />
                        <Href {...this.getRedirectionProps()}>Subscribe to a plan</Href>{' '}
                        to create new syncs.
                      </IconHoverTooltip>
                  }
                </Button>
            }
          </div>
        </TitleWrapper>

        <SyncItems>
          { isSiteAdmin && !embedName && <SiteAdminContainer /> }

          { this.renderSyncs() }
        </SyncItems>

        {
          (linkList.isEmpty() && multisyncList.isEmpty())
            && <UsefulLinksWrapper>
              <UsefulLinks
                trackDashboardAction={trackDashboardAction}
                embedName={embedName}
                signupIntentA={signupIntentA}
              />
            </UsefulLinksWrapper>
        }
      </Content>
    );
  }
}

const mapStateToProps = (state) => {
  const selectedOrganizationId = getSelectedOrganizationId(state);

  return {
    signupIntentA: getSignupIntentA(state),
    embedName: getEmbedName(state),
    isLoading: !isLoadedLinks(state) || !isLoadedMultisyncs(state),
    isSiteAdmin: isUserSiteAdmin(state),
    linkList: getSortedSyncsWithoutMultisync(state),
    syncsByMultisyncId: getSortedSyncsByMultisyncId(state),
    multisyncList: getSortedMultisyncs(state),
    orgAccountIsSuspended: isOrganizationAccountSuspended(state, selectedOrganizationId),
    userId: getUserId(state),
    userFullName: getUserFullName(state),
    selectedOrganizationId,
  };
};

const mapDispatchToProps = dispatch => ({
  getLinks: (embedName) => {
    if (embedName === 'trello') {
      dispatch(linkActions.getContainerLinks());
    } else {
      dispatch(linkActions.getLinks());
    }
  },
  getMultisyncs: (embedName) => {
    if (embedName === 'trello') {
      dispatch(multisyncActions.getContainerMultisyncs());
    } else {
      dispatch(multisyncActions.getMultisyncs());
    }
  },
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SyncList));



// WEBPACK FOOTER //
// ./src/containers/SyncList/SyncList.jsx