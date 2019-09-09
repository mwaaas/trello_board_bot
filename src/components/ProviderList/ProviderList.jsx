import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map } from 'immutable';
import styled from 'styled-components';

import { ProviderItem, ProviderIdentityList } from '../';
import { AuthorizeProviderButton } from '../../containers';
import { color } from '../../theme';
import Modal from './Modal';
import './ProviderList.scss';


const Providers = styled.ul`
  list-style: none;
  padding: 0;
`;

const Provider = styled.li`
  display: grid;
  grid-template-columns: auto auto;
  border: 1px solid ${color.dark.whisper};
  margin-bottom: 12px;
  border-radius: 4px;
  padding: 10px 20px;
`;

const Identities = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const ButtonMargin = styled.div`
  margin-left: 1.25em;
`;


export default class ProviderList extends Component {
  static propTypes = {
    providerList: PropTypes.instanceOf(Map).isRequired,
    onDisconnectProviderIdentity: PropTypes.func.isRequired,
    providerIdentityList: PropTypes.instanceOf(Map),
  };

  static defaultProps = {
    providerIdentityList: Map(),
  };

  state = {
    selectedProviderIdentity: null,
    providerIdentityModalIsOpen: false,
    selectedProvider: null,
  };

  onDisconnectProviderIdentity = (providerIdentityId) => {
    this.setState({ providerIdentityModalIsOpen: false });
    this.props.onDisconnectProviderIdentity(providerIdentityId);
  };

  closeModal = () => {
    this.setState({
      selectedProviderIdentity: null,
      selectedProvider: null,
      providerIdentityModalIsOpen: false,
    });
  };

  showModal = (providerIdentity) => {
    const { providerList } = this.props;

    this.setState({
      selectedProviderIdentity: providerIdentity,
      selectedProvider: providerList.find(p => p.get('name') === providerIdentity.get('providerName')),
      providerIdentityModalIsOpen: true,
    });
  };

  getProviderIdentities = (providerName) => {
    const { providerIdentityList } = this.props;

    return providerIdentityList.filter(providerIdentity => providerIdentity.get('providerName').split('_old')[0] === providerName);
  };

  render() {
    const { providerList } = this.props;
    const { selectedProvider, selectedProviderIdentity, providerIdentityModalIsOpen } = this.state;

    return (
      <div className="provider-list">
        <Providers>
          {
            providerList
              .valueSeq()
              .map(provider => (
                <Provider className="provider" key={ provider.get('_id') }>
                  <ProviderItem provider={ provider } bold />
                  <Identities className="provider-identities">
                    <ProviderIdentityList
                      providerIdentityList={ this.getProviderIdentities(provider.get('name')) }
                      onClickProviderIdentity={ this.showModal }
                      avatarOnly
                    />
                    <ButtonMargin>
                      <AuthorizeProviderButton
                        botGuidance
                        btnProps={{ size: 'xs', btnStyle: 'dark', reverse: true }}
                        providerId={ provider.get('_id') }
                      >
                        Add connector
                      </AuthorizeProviderButton>
                    </ButtonMargin>
                  </Identities>
                </Provider>
              ))
              .toArray()
          }
        </Providers>
        <Modal
          closeModal={ this.closeModal }
          disconnect={ this.onDisconnectProviderIdentity }
          isOpen={ providerIdentityModalIsOpen }
          provider={ selectedProvider ? providerList.get(selectedProvider.get('_id')) : Map() }
          providerId={ selectedProvider && selectedProvider.get('_id') }
          providerIdentity={ selectedProviderIdentity }
        />
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/ProviderList/ProviderList.jsx