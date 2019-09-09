import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map } from 'immutable';

import { Button, ProviderButton } from '../../components';
import oAuthPopup from '../../containers/OAuthPopupHoC/OAuthPopupHoC';

// todo annotation
// @oAuthPopup
class AuthorizeProviderButton extends Component {
  static propTypes = {
    btnProps: PropTypes.object,
    children: PropTypes.node,
    onClick: PropTypes.func.isRequired,
    provider: PropTypes.instanceOf(Map).isRequired,
    includeProviderIcon: PropTypes.bool,
  };

  static defaultProps = {
    includeProviderIcon: false,
    btnProps: {},
  };

  render() {
    const {
      includeProviderIcon, provider, children, btnProps, onClick,
    } = this.props;
    const ButtonElement = includeProviderIcon ? ProviderButton : Button;

    if (includeProviderIcon) {
      btnProps.provider = provider;
    }

    return (
      <ButtonElement onClick={ onClick } {...btnProps}>
        { children || `Connect ${provider.get('displayName')}` }
      </ButtonElement>
    );
  }
}

AuthorizeProviderButton = oAuthPopup(AuthorizeProviderButton);
export default AuthorizeProviderButton;

// WEBPACK FOOTER //
// ./src/containers/AuthorizeProviderButton/AuthorizeProviderButton.jsx