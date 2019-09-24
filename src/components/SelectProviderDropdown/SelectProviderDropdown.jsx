import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import { color } from '../../theme';
import { ProviderIconWithLabel, SelectInput } from '../../components';

const SelectorWrapper = styled.div`
  .Select-control {
    height:50px;
    border: 1px solid ${color.dark.secondary};
    border-radius: 2px;
    line-height: 50px;

    .Select-placeholder, .Select--single > .Select-control .Select-value {
      line-height: 50px;
    }
  }

  .Select-menu-outer {
    border-width: 1px;
    border-radius: 0 2px 0;
    border-color: ${color.dark.subtlesubtle} ${color.dark.secondary} ${color.dark.secondary};
  }
  .Select--single > .Select-control .Select-value {
    line-height:50px;
  }
  .Select-input {
    height: 50px;
  }

  .has-value.Select, .has-value.Select.is-focused {
    .Select-control {
      border-color: ${color.brand.green};
      box-shadow: 0 3px 5px -1px ${color.dark.subtle}, 0 6px 10px 0 ${color.dark.whisper}, 0 1px 18px 0 ${color.dark.whisper};
    }
  }
  .has-error.Select, .has-error.Select.is-focused {
    .Select-control {
      border-color: ${color.brand.error};
      box-shadow: 0 3px 5px -1px ${color.dark.subtle}, 0 6px 10px 0 ${color.dark.whisper}, 0 1px 18px 0 ${color.dark.whisper};
    }
  }
  .Select.is-open {
    .Select-control {
      border-color: ${color.dark.secondary};
      box-shadow: 0 3px 5px -1px ${color.dark.subtle}, 0 6px 10px 0 ${color.dark.whisper}, 0 1px 18px 0 ${color.dark.whisper};
    }
    .Select-menu-outer {
      box-shadow: 0 5px 5px 0px ${color.dark.subtle}, 0 10px 10px 0 ${color.dark.whisper}, 0 18px 18px 0 ${color.dark.whisper};
    }
  }
`;

export default class SelectProviderDropdown extends Component {
  static propTypes = {
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    providers: PropTypes.instanceOf(Map).isRequired,
  };

  onSelectProvider = ({ provider }) => {
    const { track } = this.props;

    track('selected tool', {
      connectorName: provider.get('connectorName'),
    });
  };

  handleOnChange = (newProvider) => {
    const { input } = this.props;
    // Only dispatch an update if the value really changed
    if (newProvider && input.value !== newProvider) {
      input.onChange(newProvider);
      this.onSelectProvider(newProvider);
    }
  };

  handleSuccess = ({ providerIdentity }) => {
    this.handleOnChange(providerIdentity.providerId);
  };

  getProviderOptions = () => {
    const { providers } = this.props;
    return providers
      .sortBy(provider => provider.get('displayName'))
      .map(provider => ({ value: provider.get('_id'), provider}))
      .toArray();
  };

  renderOption = ({ provider }) => {
    if (provider) {
      return (
        <div
          key={ provider.get('_id') }
        >
          <ProviderIconWithLabel
            provider= { provider }
            showBadge={ false }
          />
        </div>
      );
    }
  };


  render() {
    const {
      input, meta, placeholder,
    } = this.props;

    return (
      <SelectorWrapper>
        <SelectInput
          data-test="select-provider__dropdown"
          {...this.props}
          clearable={ false }
          input={ input }
          meta={{ ...meta }}
          onChange={ this.handleOnChange }
          optionRenderer={ this.renderOption }
          options={ this.getProviderOptions() }
          placeholder={ placeholder }
          searchable={ false }
          valueRenderer={ this.renderOption }
        />
      </SelectorWrapper>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/SelectProviderDropdown/SelectProviderDropdown.jsx