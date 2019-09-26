import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { List } from 'immutable';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';

import { linkActions, multisyncActions } from '../../actions';
import {
  Button,
  Href,
  IconHoverTooltip,
  LinkList,
  Title,
  LinkItemLoading,
  Card,
  MultisyncList,
  Subheading,
} from '../../components';
import { routes } from '../../consts';
import { SiteAdminContainer, FeatureFlag, FeatureFlagVariant } from '../../containers';
import {
  getEmbedName,
  getSelectedOrganizationId,
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


class SyncList extends Component {
  static propTypes = {
    embedName: PropTypes.string.isRequired,
    getLinks: PropTypes.func.isRequired,
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

  renderSyncs = () => {
    const {
      isLoading,
      linkList,
      multisyncList,
      embedName,
      syncsByMultisyncId,
      isSiteAdmin,
      userId,
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
        <Card className="link-list link-list--empty text-center">
          <Subheading>
            Don't know where to start? Have a look at our { ' ' }
            <Href
              href={ routes.HELP_PATHS.UNITO_HELP_URL }
              data-test="header__btn--help"
            >
              User guide
            </Href>.
            <br />
            Or get started by adding your first sync.
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

          <FeatureFlag name="sync-wizard">
            <FeatureFlagVariant value={ true }>
              <Button
                btnStyle="primary"
                to={ routes.ABSOLUTE_PATHS.USE_CASES }
                type="href"
              >
                Add sync
              </Button>
            </FeatureFlagVariant>
            <FeatureFlagVariant value={ false }>
              <Button
                btnStyle="primary"
                to={ routes.ABSOLUTE_PATHS.ADD_LINK }
                type="href"
              >
                Add sync
              </Button>
            </FeatureFlagVariant>
          </FeatureFlag>
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
      isLoading,
      orgAccountIsSuspended,
      userFullName,
    } = this.props;

    return (
      <Content className="sync-list container">
        <FeatureFlag name="sync-wizard">
          <FeatureFlagVariant value={ true }>
            <Button
              btnStyle="primary"
              data-test="dashboard__btn--addsync"
              disabled={ orgAccountIsSuspended }
              pullRight
              to={ routes.ABSOLUTE_PATHS.USE_CASES }
              type={ orgAccountIsSuspended ? 'button' : 'href' }
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
          </FeatureFlagVariant>

          <FeatureFlagVariant value={ false }>
            <Button
              btnStyle="primary"
              data-test="dashboard__btn--addsync"
              disabled={ orgAccountIsSuspended }
              pullRight
              to={ routes.ABSOLUTE_PATHS.ADD_LINK }
              type={ orgAccountIsSuspended ? 'button' : 'href' }
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
          </FeatureFlagVariant>
        </FeatureFlag>

        <Title type="h1">
          <strong>Welcome</strong> { userFullName }!
        </Title>

        {
          linkList.isEmpty() && multisyncList.isEmpty() && !isLoading && (
            <Subheading>
              Don’t know where to start? Have a look at our { ' ' }
              <Href
                href={ routes.HELP_PATHS.UNITO_HELP_URL }
                data-test="header__btn--help"
              >
                User guide
              </Href>.
            </Subheading>
          )
        }

        <SyncItems>
          <Title type="h2">
            Your syncs
          </Title>

          { isSiteAdmin && !embedName && <SiteAdminContainer /> }

          { this.renderSyncs() }

        </SyncItems>
      </Content>
    );
  }
}

const mapStateToProps = state => ({
  embedName: getEmbedName(state),
  isLoading: !isLoadedLinks(state) || !isLoadedMultisyncs(state),
  isSiteAdmin: isUserSiteAdmin(state),
  linkList: getSortedSyncsWithoutMultisync(state),
  syncsByMultisyncId: getSortedSyncsByMultisyncId(state),
  multisyncList: getSortedMultisyncs(state),
  orgAccountIsSuspended: isOrganizationAccountSuspended(state),
  userId: getUserId(state),
  userFullName: getUserFullName(state),
  selectedOrganizationId: getSelectedOrganizationId(state),
});

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