import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';

import {
  FatalError,
  Href,
  ProviderList,
  Subheading,
  Title,
} from '../../components';
import { providerIdentityActions } from '../../actions';
import { getEmbedName, getUserProviderIdentities, getVisibleProviders } from '../../reducers';
import { routes } from '../../consts';


const Content = styled.div`
  background: white;
  min-height: calc(100vh - 66px);
  padding: 4em 6em;
`;


class ConnectorList extends Component {
  static propTypes = {
    hasProviderIdentityFatalError: PropTypes.bool.isRequired,
    onDisconnectProviderIdentity: PropTypes.func.isRequired,
    providerIdentityList: PropTypes.instanceOf(Map).isRequired,
    providerList: PropTypes.instanceOf(Map).isRequired,
  };

  state = {
    isModalOpen: false,
  }

  openModal = () => this.setState({ isModalOpen: true });

  closeModal = () => this.setState({ isModalOpen: false });

  renderProviderList = () => {
    const {
      hasProviderIdentityFatalError,
      onDisconnectProviderIdentity,
      providerIdentityList,
      providerList,
    } = this.props;

    if (hasProviderIdentityFatalError) {
      return <FatalError title="We couldn't load your connectors at this time." />;
    }

    if (!providerList.isEmpty()) {
      return (
        <ProviderList
          providerList={ providerList }
          providerIdentityList={ providerIdentityList }
          onDisconnectProviderIdentity={ onDisconnectProviderIdentity }
        />
      );
    }
  }

  render() {
    return (
      <Content className="connector-list container">
        <Title type="h1">
          Your connectors
        </Title>
        <Subheading>
          Press "Add connector" to connect your tools. We recommend creating a bot user in each tool, { ' ' }
          so synchronized comments and changes don't originate from your personal user. { ' ' }
          <Href
            href={ routes.HELP_PATHS.CREATE_SYNC_ACCOUNT_URL }
            secondary
          >
            Tell me more
          </Href>
        </Subheading>
        { this.renderProviderList() }
      </Content>
    );
  }
}

const mapStateToProps = (state) => {
  const embedName = getEmbedName(state);

  return {
    hasProviderIdentityFatalError: state.providerIdentities.get('hasFatalError'),
    providerList: getVisibleProviders(state, embedName),
    providerIdentityList: getUserProviderIdentities(state),
  };
};

const mapDispatchToProps = dispatch => ({
  onDisconnectProviderIdentity: (providerIdentityId) => {
    dispatch(providerIdentityActions.disconnectProviderIdentity(providerIdentityId));
  },
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ConnectorList));



// WEBPACK FOOTER //
// ./src/containers/ConnectorList/ConnectorList.jsx