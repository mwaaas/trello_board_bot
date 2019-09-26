import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Map } from 'immutable';

import { TextInput, RadioButton, RadioButtonGroup } from '../../components';
import { ContainersSelect, ContainerDisplay, WorkspacesSelect } from '../../containers';
import {
  getInitialContainerId,
  getInitialExistingContainer,
  getInitialNewContainerName,
  getInitialWorkspaceId,
  getOtherSideContainerFieldValue,
  getProviderCapabilitiesById,
  getProviderIdentityProviderName,
  getProviderByName,
} from '../../reducers';
import { formUtils } from '../../utils';


const RowInput = styled.div`
  margin: 12px 0 24px;
  max-width: 700px;
`;


class ChooseContainer extends Component {
  static propTypes = {
    capabilities: PropTypes.instanceOf(Map).isRequired,
    containerSide: PropTypes.oneOf(['A', 'B']).isRequired,
    existingContainer: PropTypes.object.isRequired,
    initialContainerId: PropTypes.string,
    initialExistingContainer: PropTypes.bool.isRequired,
    initialNewContainerName: PropTypes.string,
    initialWorkspaceId: PropTypes.string,
    isContainerReadOnly: PropTypes.bool.isRequired,
    otherSideContainerId: PropTypes.string,
    providerId: PropTypes.string.isRequired,
    providerIdentityId: PropTypes.string.isRequired,
    terms: PropTypes.instanceOf(Map).isRequired,
  };

  componentDidMount() {
    const {
      containerId,
      existingContainer,
      initialContainerId,
      initialExistingContainer,
      initialNewContainerName,
      initialWorkspaceId,
      newContainerName,
      workspaceId,
    } = this.props;

    if (formUtils.isEmpty(existingContainer.input.value)) {
      existingContainer.input.onChange(initialExistingContainer);
    }

    if (formUtils.isEmpty(containerId.input.value)) {
      containerId.input.onChange(initialContainerId);
    }

    if (formUtils.isEmpty(newContainerName.input.value)) {
      newContainerName.input.onChange(initialNewContainerName);
    }

    if (formUtils.isEmpty(workspaceId.input.value)) {
      workspaceId.input.onChange(initialWorkspaceId);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { isContainerReadOnly, providerId, providerIdentityId } = this.props;
    const {
      containerId,
      existingContainer,
      initialExistingContainer,
      initialNewContainerName,
      newContainerName,
      workspaceId,
    } = nextProps;

    if (isContainerReadOnly) {
      return;
    }

    // If the provider has changed, reset all the values to their new initialValue
    if (providerId !== nextProps.providerId) {
      existingContainer.input.onChange(initialExistingContainer);
    }

    if (providerId !== nextProps.providerId || providerIdentityId !== nextProps.providerIdentityId) {
      containerId.input.onChange(null);
      workspaceId.input.onChange(null);
    }

    if (this.props.initialNewContainerName !== initialNewContainerName) {
      // Only change the new container name if the user didn't touch it
      if (!newContainerName.meta.touched && newContainerName !== initialNewContainerName) {
        newContainerName.input.onChange(initialNewContainerName);
      }
    }
  }

  getNewContainerLabel = () => {
    const { terms, capabilities } = this.props;
    const containerTerm = terms.getIn(['container', 'singular']);
    const canCreate = capabilities.getIn(['container', 'create'], false);
    const label = `Create a new ${containerTerm}`;

    if (canCreate) {
      return label;
    }

    return <span>{ label } <small>(not supported)</small></span>;
  }

  handleExistenceChange = (selectedValue) => {
    const { containerId, existingContainer } = this.props;

    if (!selectedValue) {
      containerId.input.onChange(null);
    }

    existingContainer.input.onChange(selectedValue);
  }

  render() {
    const {
      capabilities,
      containerId,
      containerSide,
      existingContainer,
      isContainerReadOnly,
      newContainerName,
      otherSideContainerId,
      providerIdentityId,
      terms,
      workspaceId,
    } = this.props;
    const containerTerm = terms.getIn(['container', 'singular']);
    const canCreate = capabilities.getIn(['container', 'create'], false);
    const newContainerLabel = this.getNewContainerLabel();

    if (isContainerReadOnly) {
      return (
        <ContainerDisplay
          containerId={ containerId.input.value }
          containerSide={ containerSide }
          providerIdentityId={ providerIdentityId }
        />
      );
    }

    return (
      <RadioButtonGroup {...existingContainer.input} onChange={ this.handleExistenceChange }>
        <RadioButton value={ true } label={ `Sync an existing ${containerTerm}` }>
          <ContainersSelect
            {...containerId}
            otherSideContainerId={ otherSideContainerId }
            containerSide={ containerSide }
            providerIdentityId={ providerIdentityId }
          />
        </RadioButton>

        <RadioButton
          value={ false }
          label={ newContainerLabel }
          disabled={ !canCreate }
        >
          <RowInput>
            <TextInput
              {...newContainerName}
              label={ `${containerTerm} name` }
            />
          </RowInput>

          <RowInput>
            <WorkspacesSelect
              {...workspaceId}
              containerSide={ containerSide }
              providerIdentityId={ providerIdentityId }
            />
          </RowInput>
        </RadioButton>
      </RadioButtonGroup>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const providerName = getProviderIdentityProviderName(state, ownProps.providerIdentityId);
  const providerId = getProviderByName(state, providerName).get('_id');

  return {
    capabilities: getProviderCapabilitiesById(state, providerId, 'capabilities'),
    initialContainerId: getInitialContainerId(state, ownProps),
    initialExistingContainer: getInitialExistingContainer(state, ownProps),
    initialNewContainerName: getInitialNewContainerName(state, ownProps),
    initialWorkspaceId: getInitialWorkspaceId(state, ownProps),
    otherSideContainerId: getOtherSideContainerFieldValue(state, ownProps, 'containerId'),
    providerId,
    terms: getProviderCapabilitiesById(state, providerId, 'terms'),
  };
};

export default connect(mapStateToProps)(ChooseContainer);



// WEBPACK FOOTER //
// ./src/containers/ChooseContainer/ChooseContainer.jsx