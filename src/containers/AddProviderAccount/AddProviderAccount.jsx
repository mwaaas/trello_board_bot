import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import styled from 'styled-components';

import { Button, ProviderIcon } from '../../components';
import oAuthPopupHoC from '../../containers/OAuthPopupHoC/OAuthPopupHoC';
import { authActions } from '../../actions';
import {
  getEmbedName,
  getVisibleProvidersByFamily,
} from '../../reducers';


const ProviderWrapper = styled.div`
  display: inline-block;
  margin: 17px;

  &:hover {
    cursor: pointer;
  };
`;

class AddProviderAccount extends Component {
  static propTypes = {
    botGuidance: PropTypes.bool,
    onSuccess: PropTypes.func,
    providersByFamily: PropTypes.instanceOf(Map),
    rehydrateAuthState: PropTypes.func.isRequired,
  };

  static defaultProps = {
    botGuidance: false,
    providersByFamily: Map(),
  };

  state = {
    focusedFamily: null,
  };

  onFocusConnector = connectorName => () => {
    this.setState({ focusedFamily: connectorName });
  }

  renderAuthButton = (provider) => {
    const { onSuccess } = this.props;
    const AuthButton = oAuthPopupHoC(ProviderWrapper);

    return (
      <AuthButton
        key={ provider.get('_id') }
        onSuccess={ onSuccess }
        providerId={ provider.get('_id') }
      >
        <ProviderIcon
          displayTooltip={ false }
          provider={ provider }
          size="lg"
        />
        {
          <span>{ provider.get('displayName') }</span>
        }
      </AuthButton>
    );
  }

  renderConnectorGroup = (provider) => {
    const connectorName = provider.get('connectorName');

    return (
      <ProviderWrapper
        key={ connectorName }
        onClick={ this.onFocusConnector(provider.get('family')) }
      >
        <ProviderIcon
          displayTooltip={ false }
          provider={ provider }
          size="lg"
        />
        {
          <span>{ provider.get('family') }</span>
        }
      </ProviderWrapper>
    );
  }

  renderIcon = (providers) => {
    const firstProvider = providers.first();

    return providers.size === 1
      ? this.renderAuthButton(firstProvider) : this.renderConnectorGroup(firstProvider);
  }

  render() {
    const { providersByFamily } = this.props;
    const { focusedFamily } = this.state;

    return (
      <div>
      {
        !focusedFamily ? (
          providersByFamily
            .sortBy((providers, familyName) => familyName)
            .map(providers => this.renderIcon(providers))
            .toArray()
        ) : (
          <div>
            <div>
              {
                providersByFamily
                  .get(focusedFamily)
                  .sortBy(provider => provider.get('displayName'))
                  .map(this.renderAuthButton)
                  .toArray()
              }
            </div>
            <Button
              btnStyle="link"
              onClick={ this.onFocusConnector(null) }
            >
              Back
            </Button>
          </div>
        )
      }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const embedName = getEmbedName(state);
  return {
    providersByFamily: getVisibleProvidersByFamily(state, embedName),
  };
};

const mapDispatchToProps = dispatch => ({
  rehydrateAuthState: () => dispatch(authActions.rehydrateAuthState()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AddProviderAccount);



// WEBPACK FOOTER //
// ./src/containers/AddProviderAccount/AddProviderAccount.jsx