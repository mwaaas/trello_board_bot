import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Map } from 'immutable';

import {
  Icon,
  NewProviderModal,
  ProviderItem,
  ReadOnlyInputField,
  SelectInput,
} from '../../components';
import { color } from '../../theme';
import {
  getEmbedName,
  getDefaultParamProviderId,
  getOtherSideContainerFieldValue,
  getProvidersWithExistingProviderIdentities,
} from '../../reducers';
import { formUtils } from '../../utils';


const IconWrapper = styled.div`
  color: ${color.brand.secondary};
  margin: 0 0 -5px 2px;
`;


class ProvidersSelect extends Component {
  static propTypes = {
    containerSide: PropTypes.oneOf(['A', 'B']).isRequired,
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    initialProviderId: PropTypes.string,
    otherProviderId: PropTypes.string,
    providers: PropTypes.instanceOf(Map).isRequired,
    readOnly: PropTypes.bool,
  };

  static defaultProps = {
    readOnly: false,
  };

  state = {
    isModalOpen: false,
  };

  closeModal = () => {
    this.setState({ isModalOpen: false });
  }

  openModal = () => {
    this.setState({ isModalOpen: true });
  }

  componentDidMount() {
    const { input, initialProviderId } = this.props;
    if (formUtils.isEmpty(input.value)) {
      input.onChange(initialProviderId);
    }
  }

  getProviderOptions = () => {
    const { providers } = this.props;

    return providers
      .map(provider => ({ value: provider.get('_id'), provider }))
      .toList()
      .push({ value: 'ADD_NEW_PROVIDER' })
      .toArray();
  }

  handleOnChange = (newProvider) => {
    const { input } = this.props;

    if (newProvider === 'ADD_NEW_PROVIDER') {
      this.openModal();
      return;
    }

    // Only dispatch an update if the value really changed
    if (newProvider && input.value !== newProvider) {
      input.onChange(newProvider);
    }
  }

  handleSuccess = ({ providerIdentity }) => {
    this.closeModal();
    this.handleOnChange(providerIdentity.providerId);
  }

  renderOption = ({ provider }) => {
    if (provider) {
      return (
        <ProviderItem provider={ provider } size="sm" />
      );
    }

    return (
      <div className="media">
        <div className="media-left">
          <IconWrapper className="media-object">
            <Icon name="plus-square-o" className="fa-2x" />
          </IconWrapper>
        </div>
        <div className="media-body">
          Add another tool
        </div>
      </div>
    );
  }

  render() {
    const {
      input, meta, providers, readOnly,
    } = this.props;
    const selectedProvider = providers.get(input.value, Map());

    if (!selectedProvider.isEmpty() && readOnly) {
      return (
        <ReadOnlyInputField label="Tool">
          <ProviderItem provider={ selectedProvider } size="sm" />
        </ReadOnlyInputField>
      );
    }

    return (
      <div>
        <SelectInput
          {...this.props}
          clearable={ false }
          data-test="provider-form-group__select"
          input={ input }
          label="Tool"
          meta={{ ...meta, error: !this.state.isModalOpen && meta.error }}
          onChange={ this.handleOnChange }
          optionRenderer={ this.renderOption }
          options={ this.getProviderOptions() }
          placeholder="Select a tool"
          searchable={ false }
          simpleValue
          valueRenderer={ this.renderOption }
        />
        <NewProviderModal
          isOpen={ this.state.isModalOpen }
          onSuccess={ this.handleSuccess }
          onRequestClose={ this.closeModal }
        />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  hidden: getEmbedName(state) === 'trello',
  providers: getProvidersWithExistingProviderIdentities(state),
  otherProviderId: getOtherSideContainerFieldValue(state, ownProps, 'providerId'),
  initialProviderId: getDefaultParamProviderId(state, ownProps.containerSide),
});

export default connect(mapStateToProps)(ProvidersSelect);



// WEBPACK FOOTER //
// ./src/containers/ProvidersSelect/ProvidersSelect.jsx