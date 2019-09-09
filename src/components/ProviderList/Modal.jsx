import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import {
  Icon,
  Modal,
  Title,
} from '../';
import { AuthorizeProviderButton } from '../../containers';
import './ProviderList.scss';

const ProviderIdentityInfo = styled.div`
  max-width: 500px;
  min-width: 500px;
  margin-bottom: 1rem;
  && {
    margin-top: 2rem;
  }
`;

const ProfilePicture = styled.img`
  border-radius: 100%;
  height: 72px;
`;


export default class AddProviderModal extends Component {
  static propTypes = {
    closeModal: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    provider: PropTypes.instanceOf(Map),
    providerIdentity: PropTypes.instanceOf(Map),
  };

  onDisconnect = () => {
    const { disconnect, providerIdentity } = this.props;
    disconnect(providerIdentity.get('_id'));
  }

  render() {
    const {
      closeModal,
      isOpen,
      provider,
      providerId,
      providerIdentity,
    } = this.props;

    if (!providerIdentity) {
      return null;
    }

    const providerIdentityId = providerIdentity.get('_id');
    const avatarUrl = providerIdentity.getIn(['profileAvatars', 0]);
    const displayName = providerIdentity.get('profileDisplayName');
    const username = providerIdentity.get('profileUsername');
    const email = providerIdentity.getIn(['profileEmails', 0]);
    const domain = providerIdentity.get('domain');
    const isDisabled = providerIdentity.get('state') === 'disabled';

    return (
      <Modal
        className="provider-list__item-modal"
        confirmLabel="Disconnect"
        isOpen={ isOpen }
        onCancel={ closeModal }
        onConfirm={ this.onDisconnect }
        onRequestClose={ closeModal }
        title={ `Do you want to disconnect this ${provider.get('displayName')} connector?` }
      >
        <ProviderIdentityInfo className="provider-identity-info media">
          {
            avatarUrl && (
              <div className="media-left media-middle">
                <div className="media-object">
                  <ProfilePicture src={ avatarUrl }
                    alt={`${displayName} (${username})`}
                    title={`${displayName} (${username})`}
                  />
                </div>
              </div>
            )
          }
          <div className="media-body">
            <Title type="h4">{ displayName }</Title>
            <div><Icon name="user" /> { username }</div>
            <div><Icon name="envelope" /> { email }</div>
            {
              domain && (
                <small>
                  (This connector is tied to the <strong>{ domain }</strong> domain)
                </small>
              )
            }
          </div>
        </ProviderIdentityInfo>

        <div className="form-group">
          {
            isDisabled && (
              <AuthorizeProviderButton
                btnProps={{
                  block: true,
                  btnStyle: 'warning',
                }}
                providerIdentityId={ providerIdentityId }
                providerId={ providerId }
              >
                Reconnect
              </AuthorizeProviderButton>
            )
          }
        </div>
      </Modal>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/ProviderList/Modal.jsx