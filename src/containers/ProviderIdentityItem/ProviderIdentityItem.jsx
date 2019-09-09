import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { providerIdentityActions } from '../../actions';
import classnames from 'classnames';

import { getProviderByName } from '../../reducers';
import { Avatar, Icon, ProviderIcon } from '../../components';
import { providerIdentityTypes } from '../../consts';
import './ProviderIdentityItem.scss';


const Item = styled.div`
  margin-top: 0;
  cursor: ${props => (props.onClick ? 'pointer' : 'default')};
`;

const ToolIconsWrapper = styled.div`
  position: relative;
`;

const ProviderIconWrapper = styled.div`
  position: absolute;
  right: -6px;
  bottom: 0;
  background-color: white;
  border-radius: 50%;

  div > img {
    width: 16px;
    height: 16px;
  }
`;


class ProviderIdentityItem extends Component {
  static propTypes = {
    avatarOnly: PropTypes.bool,
    onClick: PropTypes.func,
    providerIdentity: PropTypes.instanceOf(Map).isRequired,
    mergeWithProvider: PropTypes.bool,
  };

  static defaultProps = {
    avatarOnly: false,
  };

  componentWillMount() {
    const { providerIdentity, validateProviderIdentity } = this.props;
    const isActive = providerIdentity.get('state') === providerIdentityTypes.STATE.ACTIVE;
    const isValidated = providerIdentity.get('isValidated');

    if (!isValidated || !isActive) {
      validateProviderIdentity();
    }
  }

  handleOnClick = () => {
    const { onClick, providerIdentity } = this.props;
    onClick && onClick(providerIdentity); // eslint-disable-line
  }

  render() {
    const {
      providerIdentity,
      avatarOnly,
      provider,
      mergeWithProvider,
    } = this.props;

    const providerName = provider.get('displayName');
    const username = providerIdentity.get('profileDisplayName');
    const email = providerIdentity.getIn(['profileEmails', 0]);
    const domain = providerIdentity.get('domain');

    let details = username;
    let altDescription = details;

    if (email) {
      details += ` (${email})`;
    }

    if (domain) {
      altDescription += ` - ${domain}`;
    }

    const description = mergeWithProvider ? `${providerName} via ${username}` : details;

    const itemProps = {
      className: classnames('provider-identity-item', {
        'provider-identity-item--withdomain': !!domain,
        media: !avatarOnly,
      }),
      title: description,
      onClick: this.handleOnClick,
    };

    if (avatarOnly) {
      return (
        <Item {...itemProps}>
          {
            !mergeWithProvider
            && <Avatar
              alt={ altDescription }
              src={ providerIdentity.getIn(['profileAvatars', 0], '') }
            />
          }

          {
            providerIdentity.get('state') === providerIdentityTypes.STATE.DISABLED
            && <Icon
              className="fa-exclamation-circle provider-identity-item__disconnected"
              name="disconnected"
            />
          }
        </Item>
      );
    }

    return (
      <Item {...itemProps}>
        <div className="media-left media-middle">
        {
          mergeWithProvider
            ? <ToolIconsWrapper>
                <ProviderIconWrapper>
                  <ProviderIcon
                    provider={provider}
                    size={'sm'}
                  />
                </ProviderIconWrapper>
                <Avatar
                  alt={altDescription}
                  src={providerIdentity.getIn(['profileAvatars', 0], '')}
                />
              </ToolIconsWrapper>
            : <Avatar
                alt={ altDescription }
                src={ providerIdentity.getIn(['profileAvatars', 0], '') }
              />
        }

        </div>
        <div className="provider-identity-item__label media-body">
          <div className="provider-identity-item__description">
            { description }
          </div>
        </div>
      </Item>
    );
  }
}

const mapStateToProps = (state, { providerIdentity }) => ({
  provider: getProviderByName(state, providerIdentity.get('providerName')),
});

const mapDispatchToProps = (dispatch, { providerIdentity }) => ({
  validateProviderIdentity: () => {
    dispatch(providerIdentityActions.validateProviderIdentity(providerIdentity.get('_id')));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ProviderIdentityItem);



// WEBPACK FOOTER //
// ./src/containers/ProviderIdentityItem/ProviderIdentityItem.jsx