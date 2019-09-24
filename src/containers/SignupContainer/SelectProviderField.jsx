import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import { ProviderIcon } from '../../components';
import { color, fontSize } from '../../theme';


const ProviderIconWrapper = styled.div`
  border-color: ${props => (props.isActive ? color.brand.primary : 'transparent')};
  border-radius: 50%;
  border-width: 2px;
  border-style: solid;
  box-shadow: 0px 4px 6px ${color.dark.whisper};
  cursor: pointer;
  display: inline-block;
  height: 64px;
  margin-bottom: 12px;
  padding-top: 16px;
  text-align: center;
  width: 64px;

  &:hover {
    border-color: ${color.brand.primary};
  }
`;

const Provider = styled.div`
  margin: 8px 0;
  text-align: center;
`;

const ErrorMessage = styled.div`
  color: ${color.dark.primary};
  font-size: ${fontSize.small};
  margin-bottom: .5rem;
  text-align: center;
`;


export default class SelectProviderField extends Component {
  static propTypes = {
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    providers: PropTypes.instanceOf(Map).isRequired,
    track: PropTypes.func.isRequired,
  };

  onSelectProvider = provider => () => {
    const { input, track } = this.props;
    track('SELECT_TOOL', {
      providerName: provider.get('name'),
      connectorName: provider.get('connectorName'),
    });
    input.onChange(provider);
  }

  render() {
    const {
      input, meta, providers,
    } = this.props;
    const error = (meta.error || meta.asyncError) && meta.touched;

    return (
      <div>
        <div className="row">
        {
          providers
            .sortBy(provider => provider.get('displayName'))
            .map((provider, id) => (
              <Provider
                key={ id }
                onClick={ this.onSelectProvider(provider) }
                className="col-sm-4"
              >
                <ProviderIconWrapper isActive={ input.value === provider }>
                  <ProviderIcon
                    display="inline"
                    provider={ provider }
                    size="md"
                  />
                </ProviderIconWrapper>
                <p>{ provider.get('displayName') }</p>
              </Provider>
            )).toArray()
        }
        </div>
        {
          error && (
            <ErrorMessage className="alert alert-danger">
              { meta.error }
            </ErrorMessage>
          )
        }
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/containers/SignupContainer/SelectProviderField.jsx