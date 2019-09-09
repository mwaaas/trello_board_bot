import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { List, Map } from 'immutable';

import { Card } from '../../components';
import { ContainersSelect, FieldValuesSelect } from '../../containers';
import { multisyncTypes } from '../../consts';
import { getProviderCapabilitiesByProviderIdentityId } from '../../reducers';
import { color } from '../../theme';
import { formUtils } from '../../utils';


const Rest = styled.div`
  flex: 3;
`;

const FieldWrapperFieldValue = styled.div`
  flex: 3;
`;

const JoinText = styled.div`
  flex: 2;
  padding-left: .5rem;
  padding-right: .5rem;
  text-align: center;
`;

const FieldWrapperContainer = styled.div`
  flex: 5;
`;

const Flex = styled.div`
  display: flex;
  align-items: center;

  .form-group {
    margin-bottom: 0;
  }
`;

class AddMultisyncFilterItem extends Component {
  static propTypes = {
    leaves: PropTypes.object.isRequired,
    leavesPcdFields: PropTypes.instanceOf(Map).isRequired,
    onAdd: PropTypes.func.isRequired,
    root: PropTypes.object.isRequired,
    selectedFilters: PropTypes.array.isRequired,
    topology: PropTypes.oneOf(Object.values(multisyncTypes.TOPOLOGIES)).isRequired,
  };

  state = {
    containerId: null,
    fieldValueId: null,
  }

  componentDidUpdate(prevProps, prevState) {
    // Clear the state when the root.filter changes
    if (prevProps.root.filter.input.value !== this.props.root.filter.input.value) {
      this.setState({
        fieldValueId: null,
        containerId: null,
      });
    }

    // Clear the state when the value is changed in one of the existing entries
    const previousFieldValueIdsToExclude = this.getFieldValueIdsToExclude(prevProps.selectedFilters);
    const updatedFieldValueIdsToExclude = this.getFieldValueIdsToExclude(this.props.selectedFilters);

    if (!previousFieldValueIdsToExclude.includes(prevState.fieldValueId)
      && updatedFieldValueIdsToExclude.includes(this.state.fieldValueId)) {
      this.setState({ fieldValueId: null });
      return;
    }

    const previousContainerIdsToExclude = this.getContainerIdsToExclude(prevProps.selectedFilters);
    const updatedContainerIdsToExclude = this.getContainerIdsToExclude(this.props.selectedFilters);
    if (!previousContainerIdsToExclude.includes(prevState.containerId)
      && updatedContainerIdsToExclude.includes(this.state.containerId)) {
      this.setState({ containerId: null });
    }
  }

  addField = (containerId, fieldValue) => {
    const { onAdd, leavesPcdFields, topology } = this.props;
    const fieldValueId = fieldValue.id;

    return () => onAdd({
      containerId,
      fieldValueId,
      syncDirection: multisyncTypes.SYNC_DIRECTION.TWO_WAY,
      applyIncomingTag: topology === multisyncTypes.TOPOLOGIES.SPLIT && !!leavesPcdFields.has('labels'),
      isAutoSync: false,
      existingSync: false,
    });
  }

  handleChangeFieldValue = (newValue) => {
    const { containerId } = this.state;

    // FIXME?
    // Should we use a this.setState(updater) ?
    // https://reactjs.org/docs/react-component.html
    if (!formUtils.isEmpty(containerId)) {
      return this.setState({ containerId: null, fieldValueId: null }, this.addField(containerId, newValue));
    }

    return this.setState({ fieldValueId: newValue });
  }

  handleChangeContainer = (newValue) => {
    const { fieldValueId } = this.state;

    // FIXME?
    // Should we use a this.setState(updater) ?
    // https://reactjs.org/docs/react-component.html
    if (!formUtils.isEmpty(fieldValueId)) {
      return this.setState({ containerId: null, fieldValueId: null }, this.addField(newValue, fieldValueId));
    }

    return this.setState({ containerId: newValue });
  }

  getFieldValueIdsToExclude = (selectedFilters) => {
    const filters = selectedFilters || this.props.selectedFilters;
    return filters.map(entry => entry.fieldValueId);
  }

  getContainerIdsToExclude = (selectedFilters) => {
    const { root } = this.props;
    const filters = selectedFilters || this.props.selectedFilters;
    return filters
      .map(entry => entry.containerId)
      .concat(root.containerId.input.value);
  }

  render() {
    const {
      leaves,
      root,
      topology,
    } = this.props;
    const { containerId, fieldValueId } = this.state;
    const disabled = formUtils.isEmpty(root.filter.input.value);

    return (
      <Card className="multisync-item" padding="1rem" borderless color={ color.dark.quiet }>
        <Flex>
          <FieldWrapperFieldValue>
            <FieldValuesSelect
              containerId={ root.containerId.input.value }
              containerSide={ topology === multisyncTypes.TOPOLOGIES.SPLIT ? 'A' : 'B' }
              disabled={ disabled }
              disabledText="Already selected"
              fieldId={ root.filter.input.value.fieldId }
              fieldValueIdsToExclude={ List(this.getFieldValueIdsToExclude()) }
              kind={ root.filter.input.value.kind }
              onChange={ this.handleChangeFieldValue }
              placeholder={ disabled ? 'Filter name' : undefined }
              providerIdentityId={ root.providerIdentityId.input.value }
              value={ fieldValueId }
            />
          </FieldWrapperFieldValue>

          <JoinText>
            { topology === multisyncTypes.TOPOLOGIES.SPLIT ? ' will be sent to ' : ' when coming from ' }
          </JoinText>

          <FieldWrapperContainer>
            <ContainersSelect
              allowCreate
              containerSide={ topology === multisyncTypes.TOPOLOGIES.SPLIT ? 'B' : 'A' }
              disabled={ disabled }
              disabledText="Already selected"
              input={{ onChange: this.handleChangeContainer, value: containerId }}
              meta={{}}
              placeholder={ disabled ? 'project name' : undefined }
              providerIdentityId={ leaves.providerIdentityId.input.value }
              valuesToExclude={ this.getContainerIdsToExclude() }
            />
          </FieldWrapperContainer>
          <Rest />
        </Flex>
      </Card>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  leavesPcdFields: getProviderCapabilitiesByProviderIdentityId(
    state,
    { providerIdentityId: ownProps.leaves.providerIdentityId.input.value },
    'fields',
  ),
});

export default connect(mapStateToProps)(AddMultisyncFilterItem);



// WEBPACK FOOTER //
// ./src/components/MultisyncFilters/AddMultisyncFilterItem.jsx