import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Map, List } from 'immutable';
import classnames from 'classnames';
import styled from 'styled-components';

import { containerActions, providerIdentityActions } from '../../actions';

import {
  Icon,
  IconHoverTooltip,
  NewProviderModal,
  SelectInput,
} from '../../components';
import { providerIdentityTypes } from '../../consts';
import { AuthorizeProviderButton, ProviderIdentityItem } from '../../containers';
import oAuthPopup from '../../containers/OAuthPopupHoC/OAuthPopupHoC';
import {
  getAllowedProviderIdentities,
  getContainerFieldValue,
  getFieldValue,
  getInitialProviderIdentityId,
  getProviderById,
  getProviderByProviderIdentityId,
  getUserProviderIdentities,
  getVisibleProviderIdentities,
  isLoadingProviderIdentities,
} from '../../reducers';
import { color } from '../../theme';
import { formUtils } from '../../utils';


const IconWrapper = styled.div`
  margin-left: 2px;
  margin-right: 2px;
  color: ${color.brand.secondary};
`;


const StateIconWrapper = styled.span`
  color: ${color.dark.secondary};
  margin-right: 8px;

  &:hover {
    color: ${color.dark.primary};
  }
`;

const Label = styled.span`
  margin-top: 4px;
  margin-right: 4px;
`;

// todo annotation
// @oAuthPopup
class AddAccountOption extends Component {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
  };

  handleMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.onClick();
  };

  render() {
    return (
      <div
        aria-selected={ false }
        onMouseDown={ this.handleMouseDown }
        role="option"
        tabIndex={ 0 }
      >
        { this.props.children }
      </div>
    );
  }
}

AddAccountOption = oAuthPopup(AddAccountOption);

class ProviderIdentitiesSelect extends Component {
  static propTypes = {
    allowedProviderIdentityIds: PropTypes.instanceOf(List),
    containerSide: PropTypes.string.isRequired,
    disableIfNoContainerAccess: PropTypes.bool,
    fetchAllowedProviderIdentities: PropTypes.func.isRequired,
    forceClearContainers: PropTypes.bool,
    hidden: PropTypes.bool,
    initialProviderIdentityId: PropTypes.string,
    input: PropTypes.object.isRequired,
    isEdit: PropTypes.bool,
    isLoading: PropTypes.bool.isRequired,
    isProviderReadOnly: PropTypes.bool,
    label: PropTypes.string,
    mergeWithProvider: PropTypes.bool,
    meta: PropTypes.object.isRequired,
    provider: PropTypes.instanceOf(Map).isRequired,
    showHelpText: PropTypes.bool,
    showReconnectButton: PropTypes.bool,
  };

  static defaultProps = {
    disableIfNoContainerAccess: false,
    forceClearContainers: false,
    hidden: false,
    isEdit: false,
    label: 'Sync changes with this connector',
    mergeWithProvider: false,
    showHelpText: false,
    showReconnectButton: false,
  };

  state = {
    isModalOpen: false,
    reinitialize: false,
  };

  closeModal = () => {
    this.setState({ isModalOpen: false });
  }

  openModal = () => {
    this.setState({ isModalOpen: true });
  }

  componentDidMount() {
    const {
      disableIfNoContainerAccess,
      fetchAllowedProviderIdentities,
      initialProviderIdentityId,
      input,
      isEdit,
    } = this.props;

    if (disableIfNoContainerAccess && isEdit) {
      fetchAllowedProviderIdentities(input.value);
    }

    if (formUtils.isEmpty(input.value)) {
      this.handleOnChange(initialProviderIdentityId);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      reinitialize: !this.props.provider.equals(nextProps.provider),
    });
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.reinitialize) {
      this.handleOnChange(nextProps.initialProviderIdentityId);
    }
  }

  getStateLabel = (providerIdentity) => {
    const {
      allowedProviderIdentityIds, disableIfNoContainerAccess, provider, input,
    } = this.props;
    const state = providerIdentity.get('state');

    const included = allowedProviderIdentityIds.includes(providerIdentity.get('_id'));
    const isActive = (included || !disableIfNoContainerAccess) && state === providerIdentityTypes.STATE.ACTIVE;
    if ((disableIfNoContainerAccess && allowedProviderIdentityIds.isEmpty()) || isActive) {
      return null;
    }

    const labelClassnames = classnames('label', {
      'label-warning': state === providerIdentityTypes.STATE.DISABLED,
      'label-default': !included && input.value !== providerIdentity.get('_id'),
    });

    if (state === providerIdentityTypes.STATE.DISABLED) {
      const ReconnectIcon = oAuthPopup(IconHoverTooltip);
      return (
        <div className="pull-right">
          <Label className={ labelClassnames }>{ state }</Label>
          <StateIconWrapper>
            <ReconnectIcon
              providerIdentityId={ providerIdentity.get('_id') }
              providerId={ provider.get('_id') }
              iconName="refresh" placement="top"
              onSuccess={ this.handleSuccess }
            >
              This connector no longer has access to { provider.get('displayName') }.
              Click to reconnect it or select another connector.
            </ReconnectIcon>
          </StateIconWrapper>
        </div>
      );
    }

    return (
      <div className="pull-right">
        <Label className={ labelClassnames }>No access</Label>
        <IconHoverTooltip placement="top">
          This connector doesn't have access to the project you selected.
        </IconHoverTooltip>
      </div>
    );
  }

  /**
   *  Returns an array of options to use in Select.
   *  The options are all the provider identities of the selected provider
   *  @returns - An array of options
   */
  getProviderIdentityOptions() {
    const {
      allowedProviderIdentityIds,
      disableIfNoContainerAccess,
      allProviderIdentities,
      visibleProviderIdentities,
      mergeWithProvider,
    } = this.props;

    const providerIdentities = mergeWithProvider ? allProviderIdentities : visibleProviderIdentities;

    const providerIdentityOptions = providerIdentities.map((providerIdentity) => {
      let disabled;
      if (disableIfNoContainerAccess) {
        disabled = allowedProviderIdentityIds.isEmpty() || !allowedProviderIdentityIds.includes(providerIdentity.get('_id'));
      } else {
        disabled = providerIdentity.get('state') === providerIdentityTypes.STATE.DISABLED;
      }

      return {
        value: providerIdentity.get('_id'),
        providerIdentity,
        disabled,
      };
    }).toList();

    return [
      { value: mergeWithProvider ? 'ADD_NEW_PROVIDER' : 'ADD_NEW_ACCOUNT' },
      ...providerIdentityOptions.toArray(),
    ];
  }

  handleOnChange = (newProviderIdentityId) => {
    const { mergeWithProvider } = this.props;

    if (mergeWithProvider && newProviderIdentityId === 'ADD_NEW_PROVIDER') {
      this.openModal();
      return;
    }

    if (newProviderIdentityId === 'ADD_NEW_ACCOUNT') {
      return;
    }

    const {
      clearContainers,
      forceClearContainers,
      input,
    } = this.props;

    // Only dispatch an update if the value really changed
    if (newProviderIdentityId && input.value !== newProviderIdentityId) {
      input.onChange(newProviderIdentityId);
      // Only clear containers if we are in add sync
      // and don't have a locked side
      if (forceClearContainers) {
        clearContainers();
      }
    }
  }

  handleSuccessAddNewAccount = ({ providerIdentity }) => {
    const { fetchAllowedProviderIdentities, input, isEdit } = this.props;

    if (isEdit) {
      fetchAllowedProviderIdentities(input.value);
    }
    this.handleOnChange(providerIdentity._id);
  }

  handleSuccessAddNewProvider = ({ providerIdentity }) => {
    this.closeModal();
    this.handleOnChange(providerIdentity.providerId);
  }

  renderValue = (option) => {
    const { mergeWithProvider } = this.props;
    if (option.providerIdentity) {
      return <ProviderIdentityItem providerIdentity={ option.providerIdentity } mergeWithProvider={ mergeWithProvider }/>;
    }

    return null;
  }

  renderOption = (option) => {
    const { provider, mergeWithProvider } = this.props;
    if (option.providerIdentity) {
      return (
        <div>
          { this.getStateLabel(option.providerIdentity) }
          <ProviderIdentityItem providerIdentity={ option.providerIdentity } mergeWithProvider={ mergeWithProvider }/>
        </div>
      );
    }

    if (mergeWithProvider) {
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

    return (
      <AddAccountOption
        providerId={ provider.get('_id') }
        onSuccess={ this.handleSuccessAddNewAccount }
        botGuidance
      >
        <div className="media">
          <div className="media-left">
            <IconWrapper>
              <Icon name="plus-square-o" className="fa-2x" />
            </IconWrapper>
          </div>
          <div className="media-body">
            <div>Add { provider.get('displayName') } user</div>
            <small>Grant access to another { provider.get('displayName') } user</small>
          </div>
        </div>
      </AddAccountOption>
    );
  }

  render() {
    const {
      hidden,
      input,
      isLoading,
      label,
      meta,
      provider,
      showReconnectButton,
    } = this.props;

    const options = this.getProviderIdentityOptions();
    const classNames = classnames('provider-identity-form-group-container', {
      // 'Invalid token' errors should be displayed even if the field hasn't been touched
      hidden: hidden && options.length === 1,
    });

    return (
      <div className={ classNames }>
        <SelectInput
          {...this.props}
          clearable={ false }
          data-test="provider-identity-form-group__select"
          input={ input }
          isLoading={ isLoading }
          label={ label }
          meta={ meta }
          onChange={ this.handleOnChange }
          optionRenderer={ this.renderOption }
          options={ options }
          placeholder={ isLoading ? 'Loading your connectors...' : 'Select a connector' }
          searchable={ false }
          simpleValue
          valueRenderer={ this.renderValue }
        />
        <NewProviderModal
          isOpen={ this.state.isModalOpen }
          onSuccess={ this.handleSuccessAddNewProvider }
          onRequestClose={ this.closeModal }
        />
        {
          showReconnectButton && (
            <AuthorizeProviderButton
              providerIdentityId={ input.value }
              providerId={ provider.get('_id') }
              btnProps={{ pullRight: true }}
            >
              Reconnect
            </AuthorizeProviderButton>
          )
        }

      </div>
    );
  }
}

function getProvider(state, ownProps) {
  if (ownProps.provider) {
    return ownProps.provider;
  }

  if (ownProps.mergeWithProvider) {
    return getProviderByProviderIdentityId(state, getFieldValue(state, ownProps.input.name, ownProps.meta.form));
  }

  return getProviderById(state, { providerId: getContainerFieldValue(state, ownProps, 'providerId') });
}

const mapStateToProps = (state, ownProps) => ({
  initialProviderIdentityId: getInitialProviderIdentityId(state, ownProps),
  provider: getProvider(state, ownProps),
  allProviderIdentities: getUserProviderIdentities(state, ownProps),
  visibleProviderIdentities: getVisibleProviderIdentities(state, ownProps),
  isLoading: isLoadingProviderIdentities(state),
  allowedProviderIdentityIds: getAllowedProviderIdentities(state, ownProps),
});

const mapDispatchToProps = (dispatch, { input, meta, containerSide }) => ({
  fetchAllowedProviderIdentities: () => {
    dispatch(providerIdentityActions.fetchAllowedProviderIdentities({ inputName: input.name, formName: meta.form, containerSide }));
  },
  clearContainers: () => {
    dispatch(containerActions.clearContainers(containerSide));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ProviderIdentitiesSelect);



// WEBPACK FOOTER //
// ./src/containers/ProviderIdentitiesSelect/ProviderIdentitiesSelect.jsx