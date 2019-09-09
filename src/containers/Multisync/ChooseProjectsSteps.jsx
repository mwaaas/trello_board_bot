import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { FieldArray, untouch } from 'redux-form';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import styled from 'styled-components';

import {
  Modal,
  MultisyncFilters,
  Section,
  SelectInput,
  TextSelectOption,
} from '../../components';
import {
  ContainerDisplay,
  ContainersSelect,
  FilterFieldsSelect,
  ProviderIdentitiesSelect,
} from '../../containers';
import {
  getFeatureFlagValue,
  getFieldsWithFilterCapability,
  getProviderByProviderIdentityId,
  getProviderCapabilitiesById,
  getTermForProviders,
} from '../../reducers';
import { capitalize, formUtils } from '../../utils';
import { multisyncTypes } from '../../consts';
import {
  ContainerDisplayWrapper,
  FieldWrapper,
  RelativeCard,
  TextWrapper,
} from '.';

const ErrorText = styled.p`
  color: red;
  font-size: 0.7em;
  padding-left: ${props => (props.topology === multisyncTypes.TOPOLOGIES.SPLIT ? splitPaddingFor[props.field] : mergePaddingFor[props.field])}
`;

const splitPaddingFor = {
  'root.providerIdentityId': '5.5%',
  'leaves.providerIdentityId': '2.5%',
  'root.containerId': '21.5%',
  topology: '8%',
};

const mergePaddingFor = {
  'root.providerIdentityId': '2.5%',
  'leaves.providerIdentityId': '21.5%',
  'root.containerId': '29%',
  topology: '8%',
};

class ChooseProjectsSteps extends Component {
  static propTypes = {
    clearFilters: PropTypes.func.isRequired,
    containerTerm: PropTypes.string.isRequired,
    containerTermPlural: PropTypes.string.isRequired,
    containerTermRoot: PropTypes.string,
    fieldsWithFilterCapability: PropTypes.instanceOf(Map).isRequired,
    isEdit: PropTypes.bool.isRequired,
    isRootLocked: PropTypes.bool,
    leaves: PropTypes.object.isRequired,
    root: PropTypes.object.isRequired,
    taskTerm: PropTypes.string.isRequired,
    taskTermPlural: PropTypes.string.isRequired,
  };

  static defaultProps = {
    isRootLocked: false,
  }

  state = {
    openModalName: null,
    newValue: null,
  };

  isFirstSectionCompleted() {
    const { topology } = this.props;
    return !formUtils.isEmpty(topology.input.value);
  }

  isSecondSectionCompleted() {
    const { leaves, root } = this.props;
    return !formUtils.isEmpty(root.providerIdentityId.input.value)
      && !formUtils.isEmpty(root.containerId.input.value)
      && !formUtils.isEmpty(leaves.providerIdentityId.input.value);
  }

  closeModal = () => {
    this.setState({
      openModalName: null,
      newValue: null,
    });
  }

  handleRootProviderIdentityId = (newValue) => {
    const {
      root: { providerIdentityId, containerId },
    } = this.props;

    if (formUtils.isEmpty(providerIdentityId.input.value) || formUtils.isEmpty(containerId.input.value)) {
      providerIdentityId.input.onChange(newValue);
      return;
    }

    this.setState({
      openModalName: providerIdentityId.input.name,
      newValue,
    });
  }

  handleRootContainerId = (newValue) => {
    const {
      root: { containerId, filter },
    } = this.props;

    if (formUtils.isEmpty(containerId.input.value) || formUtils.isEmpty(filter.input.value)) {
      containerId.input.onChange(newValue);
      return;
    }

    this.setState({
      openModalName: containerId.input.name,
      newValue,
    });
  }

  handleLeavesProviderIdentityId = (newValue) => {
    const {
      root: { filter },
      leaves: { providerIdentityId },
    } = this.props;

    if (formUtils.isEmpty(providerIdentityId.input.value) || formUtils.isEmpty(filter.input.value)) {
      providerIdentityId.input.onChange(newValue);
      return;
    }

    this.setState({
      openModalName: providerIdentityId.input.name,
      newValue,
    });
  }

  handleFilter = (newValue) => {
    const {
      root: { filter },
    } = this.props;

    if (formUtils.isEmpty(filter.input.value)) {
      filter.input.onChange(newValue);
      return;
    }

    this.setState({
      openModalName: filter.input.name,
      newValue,
    });
  }

  handleTopology = (newValue) => {
    const {
      leaves,
      root,
      topology,
    } = this.props;

    if (formUtils.isEmpty(topology.input.value)) {
      topology.input.onChange(newValue);
      return;
    }

    if (
      topology.input.value !== newValue
        && formUtils.isEmpty(root.providerIdentityId.input.value)
        && formUtils.isEmpty(leaves.providerIdentityId.input.value)
        && formUtils.isEmpty(root.containerId.input.value)
    ) {
      topology.input.onChange(newValue);
      return;
    }

    this.setState({
      openModalName: topology.input.name,
      newValue,
    });
  }

  resetFiltersAndCloseModal = () => {
    const { clearFilters } = this.props;
    clearFilters();
    this.closeModal();
  }

  getModalElements = (modalName) => {
    if (!modalName) {
      return {};
    }

    const {
      dispatch,
      isRootLocked,
      leaves,
      root,
      topology,
    } = this.props;
    const { newValue } = this.state;

    const modalContent = {
      [topology.input.name]: {
        title: 'Changing your Multi-sync type?',
        description: 'Updating the type of your Multi-sync will reset the whole configuration',
        onClick: () => {
          topology.input.onChange(newValue);
          !isRootLocked && root.providerIdentityId.input.onChange(null);
          leaves.providerIdentityId.input.onChange(null);
          !isRootLocked && root.containerId.input.onChange(null);
          root.filter.input.onChange(null);
          dispatch(untouch(
            root.providerIdentityId.meta.form,
            root.providerIdentityId.input.name,
            leaves.providerIdentityId.input.name,
            root.filter.input.name,
            !isRootLocked ? root.containerId.input.name : undefined,
          ));
          this.resetFiltersAndCloseModal();
        },
      },
      [root.providerIdentityId.input.name]: {
        title: 'Changing main tool connected?',
        description: 'Updating the main tool will reset all the filters',
        onClick: () => {
          root.providerIdentityId.input.onChange(newValue);
          !isRootLocked && root.containerId.input.onChange(null);
          root.filter.input.onChange(null);
          dispatch(untouch(
            root.providerIdentityId.meta.form,
            root.providerIdentityId.input.name,
            root.filter.input.name,
            !isRootLocked ? root.containerId.input.name : undefined,
          ));
          this.resetFiltersAndCloseModal();
        },
      },
      [leaves.providerIdentityId.input.name]: {
        title: 'Changing main tool connected?',
        description: 'Updating the main tool will reset all the filters',
        onClick: () => {
          leaves.providerIdentityId.input.onChange(newValue);
          root.filter.input.onChange(null);
          dispatch(untouch(root.filter.meta.form, root.filter.input.name));
          this.resetFiltersAndCloseModal();
        },
      },
      [root.containerId.input.name]: {
        title: 'Changing main project?',
        description: 'Updating the main project will reset all your filters',
        onClick: () => {
          root.containerId.input.onChange(newValue);
          root.filter.input.onChange(null);
          dispatch(untouch(root.filter.meta.form, root.filter.input.name));
          this.resetFiltersAndCloseModal();
        },
      },
      [root.filter.input.name]: {
        title: 'Changing your filter?',
        description: 'Updating your filter will reset all setups',
        onClick: () => {
          root.filter.input.onChange(newValue);
          this.resetFiltersAndCloseModal();
        },
      },
    };

    return modalContent[modalName];
  }

  getModal = () => {
    const { openModalName } = this.state;
    const { title, description, onClick } = this.getModalElements(openModalName);

    return (
      <Modal
        cancelLabel="Nevermind"
        confirmLabel="Confirm change"
        isOpen={ openModalName !== null }
        onCancel={ this.closeModal }
        onConfirm={ onClick }
        onRequestClose={ this.closeModal }
        title={ title }
      >
        { description }
      </Modal>
    );
  }

  getTopologyOptions = () =>
    Object.values(multisyncTypes.TOPOLOGIES).map((topology) => {
      const option = {
        disabled: topology === multisyncTypes.TOPOLOGIES.MERGE && this.props.syncWizardMergeIsDisabled,
        label: this.getTopologyLabel(topology), // Capitalize
        value: topology,
      };

      return option;
    });

  renderTopologyOption = (option) => {
    const { disabled, label } = option;

    return (
      <TextSelectOption
        disabled={ disabled }
        disabledText='(coming soon!)'
        maxTextLength={30}
      >
        { label } { ' ' }
      </TextSelectOption>
    );
  }

  getRootFilterLabel = () => {
    const { fieldsWithFilterCapability, root } = this.props;
    const { value } = root.filter.input;

    return fieldsWithFilterCapability.getIn([value.fieldId, value.type, 'sourcePhrase']);
  }

  getTopologyLabel = (topology) => {
    const { isEdit } = this.props;
    const topologyLabels = {
      split: `share${isEdit ? 's' : ''} tasks between different projects`,
      merge: `consolidate${isEdit ? 's' : ''} tasks from different projects`,
    };

    return topologyLabels[topology];
  };

  getSplitSteps = () => {
    const {
      isEdit,
      isRootLocked,
      leaves,
      root,
      taskTermPlural,
      topology,
    } = this.props;
    const rootError = root.providerIdentityId.meta.touched && (root.providerIdentityId.meta.error || root.providerIdentityId.meta.asyncError);
    const leavesError = leaves.providerIdentityId.meta.touched && (leaves.providerIdentityId.meta.error || leaves.providerIdentityId.meta.asyncError);
    const containerError = root.containerId.meta.touched && (root.containerId.meta.error || root.containerId.meta.asyncError);
    return (
      <div>
        <TextWrapper>
          Using { ' ' }
          <FieldWrapper>
            <ProviderIdentitiesSelect
              {...root.providerIdentityId}
              input={{
                ...root.providerIdentityId.input,
                onChange: this.handleRootProviderIdentityId,
              }}
              containerSide="A"
              disabled={ isRootLocked || isEdit }
              forceClearContainers
              label={ null }
              mergeWithProvider
              showError={false}
            />
          </FieldWrapper>
          { ', ' }
          {
            rootError
              && <ErrorText field={root.providerIdentityId.input.name} topology={topology.input.value} >
                { root.providerIdentityId.meta.error }
              </ErrorText>
          }
        </TextWrapper>

        <TextWrapper>
        {
          isEdit
            ? `it sends ${taskTermPlural} from `
            : `I’d like to send ${taskTermPlural} from `
        }
        <FieldWrapper>
          {
            isRootLocked || isEdit ? (
              <ContainerDisplay
                containerId={ root.containerId.input.value }
                containerSide="A"
                providerIdentityId={ root.providerIdentityId.input.value }
                type="inputNoLabel"
              />
            ) : (
              <div>
                <ContainersSelect
                  {...root.containerId}
                  input={{
                    ...root.containerId.input,
                    onChange: this.handleRootContainerId,
                  }}
                  containerSide="A"
                  disabled={ formUtils.isEmpty(root.providerIdentityId.input.value) }
                  providerIdentityId={ root.providerIdentityId.input.value }
                  showError={false}
                />
              </div>
            )
          }
        </FieldWrapper>
          {
            containerError
              && <ErrorText field={root.containerId.input.name} topology={topology.input.value} >
                { root.containerId.meta.error }
              </ErrorText>
          }
        </TextWrapper>

        <TextWrapper>
          to { ' ' }
          <FieldWrapper>
            <ProviderIdentitiesSelect
              {...leaves.providerIdentityId}
              input={{
                ...leaves.providerIdentityId.input,
                onChange: this.handleLeavesProviderIdentityId,
              }}
              containerSide="B"
              disabled={ isEdit }
              forceClearContainers
              label={ null }
              mergeWithProvider
              showError={false}
            />
          </FieldWrapper>
          {
            leavesError
              && <ErrorText field={leaves.providerIdentityId.input.name} topology={topology.input.value} >
                { leaves.providerIdentityId.meta.error }
              </ErrorText>
          }
        </TextWrapper>
      </div>
    );
  }

  getMergeSteps = () => {
    const {
      isEdit,
      isRootLocked,
      leaves,
      root,
      taskTermPlural,
      topology,
    } = this.props;
    const rootError = root.providerIdentityId.meta.touched && (root.providerIdentityId.meta.error || root.providerIdentityId.meta.asyncError);
    const leavesError = leaves.providerIdentityId.meta.touched && (leaves.providerIdentityId.meta.error || leaves.providerIdentityId.meta.asyncError);
    const containerError = root.containerId.meta.touched && (root.containerId.meta.error || root.containerId.meta.asyncError);

    return (
      <div>
        <TextWrapper>
          {
            isEdit
              ? `It syncs ${taskTermPlural} from `
              : `I’d like to send ${taskTermPlural} from `
          }
          <FieldWrapper>
            <ProviderIdentitiesSelect
              {...leaves.providerIdentityId}
              input={{
                ...leaves.providerIdentityId.input,
                onChange: this.handleLeavesProviderIdentityId,
              }}
              containerSide="A"
              disabled={ isEdit }
              forceClearContainers
              label={ null }
              mergeWithProvider
              showError={false}
            />
          </FieldWrapper>
          {
            leavesError
              && <ErrorText field={leaves.providerIdentityId.input.name} topology={topology.input.value} >
                { leaves.providerIdentityId.meta.error }
              </ErrorText>
          }
        </TextWrapper>

        <TextWrapper>
          to { ' ' }
          <FieldWrapper>
            <ProviderIdentitiesSelect
              {...root.providerIdentityId}
              input={{
                ...root.providerIdentityId.input,
                onChange: this.handleRootProviderIdentityId,
              }}
              containerSide="B"
              disabled={ isRootLocked || isEdit }
              forceClearContainers
              label={ null }
              mergeWithProvider
              showError={false}
            />
          </FieldWrapper>
          { '. ' }
          {
            rootError
              && <ErrorText field={root.providerIdentityId.input.name} topology={topology.input.value} >
                { root.providerIdentityId.meta.error }
              </ErrorText>
          }
        </TextWrapper>

        <TextWrapper>
          {
            isEdit
              ? `The ${taskTermPlural} are consolidated into `
              : `The ${taskTermPlural} will be consolidated into `
          }
          <FieldWrapper>
            {
              isRootLocked || isEdit ? (
                <ContainerDisplay
                  containerId={ root.containerId.input.value }
                  containerSide="B"
                  providerIdentityId={ root.providerIdentityId.input.value }
                  type="inputNoLabel"
                />
              ) : (
                <ContainersSelect
                  {...root.containerId}
                  input={{
                    ...root.containerId.input,
                    onChange: this.handleRootContainerId,
                  }}
                  containerSide="B"
                  disabled={ formUtils.isEmpty(root.providerIdentityId.input.value) }
                  providerIdentityId={ root.providerIdentityId.input.value }
                  showError={false}
                />
              )
            }
          </FieldWrapper>
          {
            containerError
              && <ErrorText field={root.containerId.input.name} topology={topology.input.value} >
                { root.containerId.meta.error }
              </ErrorText>
          }
        </TextWrapper>
      </div>
    );
  }

  render() {
    const {
      isEdit,
      leaves,
      root,
      taskTermPlural,
      topology,
    } = this.props;
    const firstSectionCompleted = this.isFirstSectionCompleted();
    const secondSectionCompleted = this.isSecondSectionCompleted();
    const topologyError = topology.meta.touched && (topology.meta.error || topology.meta.asyncError);

    return (
      <div className="choose-projects-steps">
        { this.getModal() }

        {
          !isEdit && (
            <Section>
              <TextWrapper>
                I want to { ' ' }
                <FieldWrapper>
                  <SelectInput
                    {...topology}
                    onChange={ this.handleTopology }
                    clearable={ false }
                    optionRenderer={ this.renderTopologyOption }
                    options={ this.getTopologyOptions() }
                    placeholder="Select what you want to do"
                    searchable={ false }
                    simpleValue
                    showError={false}
                  />
                </FieldWrapper>
                {
                  topologyError
                    && <ErrorText field={topology.input.name} >
                      { topology.meta.error }
                    </ErrorText>
                }
              </TextWrapper>
            </Section>
          )
        }

        {
          firstSectionCompleted && (
            <Section>
              <RelativeCard>
                {
                  isEdit && (
                    <TextWrapper marginBottom="1rem">
                      This Multi-sync { this.getTopologyLabel(topology.input.value) }.
                    </TextWrapper>
                  )
                }

                {
                  topology.input.value === multisyncTypes.TOPOLOGIES.SPLIT
                    ? this.getSplitSteps()
                    : this.getMergeSteps()
                }
              </RelativeCard>
            </Section>
          )
        }

        {
          secondSectionCompleted && (
            <Section>
              <TextWrapper>
                {
                  topology.input.value === multisyncTypes.TOPOLOGIES.SPLIT
                    ? `${capitalize(taskTermPlural)} from `
                    : 'In '
                }
                <ContainerDisplayWrapper>
                  <ContainerDisplay
                    containerId={ root.containerId.input.value }
                    containerSide={ topology.input.value === multisyncTypes.TOPOLOGIES.SPLIT ? 'A' : 'B' }
                    providerIdentityId={ root.providerIdentityId.input.value }
                    type="icon"
                  />
                </ContainerDisplayWrapper>
                { topology.input.value === multisyncTypes.TOPOLOGIES.SPLIT && 'that are ' }
                { topology.input.value === multisyncTypes.TOPOLOGIES.MERGE && isEdit && `${taskTermPlural} are ` }

                <FieldWrapper>
                  <FilterFieldsSelect
                    {...root.filter}
                    input={{
                      ...root.filter.input,
                      onChange: this.handleFilter,
                    }}
                  // Manually recreating the selected option when on edit mode (the label prop will be the one displayed in the select)
                    value={ isEdit ? { label: this.getRootFilterLabel() } : root.filter.input.value }
                    labelType={ topology.input.value === multisyncTypes.TOPOLOGIES.SPLIT ? 'sourcePhrase' : 'destinationPhrase' }
                    providerIdentityId={ root.providerIdentityId.input.value }
                    disabled={ isEdit }
                    searchable={ false }
                    type="whiteList"
                  />
                </FieldWrapper>
              </TextWrapper>

              <FieldArray
                name="filters"
                component={ MultisyncFilters }
                props={{
                  leaves,
                  root,
                  isEdit,
                  topology,
                }}
              />
            </Section>
          )
        }
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const rootProviderIdentityId = ownProps.root.providerIdentityId.input.value;
  const providerIdA = getProviderByProviderIdentityId(state, rootProviderIdentityId).get('_id');
  const providerIdB = getProviderByProviderIdentityId(state, ownProps.leaves.providerIdentityId.input.value).get('_id');

  return {
    fieldsWithFilterCapability: getFieldsWithFilterCapability(state, {
      providerIdentityId: rootProviderIdentityId,
      meta: {
        form: 'multisyncForm',
      },
    }),
    taskTermPlural: getTermForProviders(state, providerIdA, providerIdB, 'task', 'plural'),
    taskTerm: getTermForProviders(state, providerIdA, providerIdB),
    containerTerm: getTermForProviders(state, providerIdA, providerIdB, 'container'),
    containerTermRoot: getProviderCapabilitiesById(state, providerIdA, 'terms').getIn(['container', 'singular']),
    containerTermPlural: getTermForProviders(state, providerIdA, providerIdB, 'container', 'plural'),
    syncWizardMergeIsDisabled: !getFeatureFlagValue(state, 'sync-wizard-merge'),
  };
};

export default connect(mapStateToProps)(ChooseProjectsSteps);



// WEBPACK FOOTER //
// ./src/containers/Multisync/ChooseProjectsSteps.jsx