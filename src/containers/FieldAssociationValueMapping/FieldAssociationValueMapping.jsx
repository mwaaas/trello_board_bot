import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { fieldActions } from '../../actions';
import { Button, Card, Icon } from '../../components';
import { MappingGroup, NewFieldValuesGroup } from '../../containers';
import { getFieldAssociationItems } from '../../reducers';
import { color } from '../../theme';


const ValueMapping = styled.div`
  padding: 0 36px 24px;
  border-top: 1px solid transparent;
  border-radius: 2px;
`;

const Margin = styled.div`
  margin-bottom: 16px;
`;

const Group = styled.div`
  position: relative;
  margin-bottom: 16px;

  &:hover .btn {
    visibility: visible;
  }
`;

const TrashIconWrapper = styled.div`
  position: absolute;
  right: -37px;
  top 0px;

  .btn {
    visibility: hidden;
    height: 38px;
    width: 38px;
    padding: 0;
    color: ${color.dark.hint};

    &:hover {
      color: ${color.brand.error};
    }
  }

  &:hover .btn {
    visibility: visible;
  }
`;


class FieldAssociationValueMapping extends Component {
  static propTypes = {
    fieldAssociation: PropTypes.instanceOf(Map).isRequired,
    fieldAssociationIndex: PropTypes.number.isRequired,
    fieldNameA: PropTypes.string.isRequired,
    fieldNameB: PropTypes.string.isRequired,
    mapping: PropTypes.instanceOf(List).isRequired,
    multisyncLeafSide: PropTypes.oneOf(['A', 'B']),
    onAddNewGroup: PropTypes.func.isRequired,
    onRemoveGroup: PropTypes.func.isRequired,
    providerA: PropTypes.instanceOf(Map).isRequired,
    providerB: PropTypes.instanceOf(Map).isRequired,
  };

  state = {
    displayNewGroup: false,
  };

  componentDidMount() {
    if (this.props.mapping.isEmpty()) {
      this.showNewGroup();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.mapping.isEmpty()) {
      this.showNewGroup();
    }
  }

  showNewGroup = () => {
    this.setState({ displayNewGroup: true });
  }

  hideNewGroup = () => {
    this.setState({ displayNewGroup: false });
  }

  handleAddNewGroup = (fieldIdA, fieldIdB) => {
    this.props.onAddNewGroup(fieldIdA, fieldIdB);
    this.hideNewGroup();
  }

  render() {
    const {
      fieldAssociation,
      fieldAssociationIndex,
      fieldNameA,
      fieldNameB,
      mapping,
      onRemoveGroup,
      providerA,
      providerB,
      entity,
      containerIdA,
      containerIdB,
      multisyncLeafSide,
      providerIdentityIdA,
      providerIdentityIdB,
    } = this.props;
    const { displayNewGroup } = this.state;

    return (
      <ValueMapping className="field-association-value-mapping">
        <Margin className="clearfix">
          <Button
            btnStyle="link"
            onClick={ this.showNewGroup }
            pullLeft
            reverse
            size="sm"
          >
            Add new group <Icon name="plus-circle" />
          </Button>
        </Margin>
        {
          displayNewGroup && (
            <Group>
              <Card>
                <NewFieldValuesGroup
                  containerIdA={ containerIdA }
                  containerIdB={ containerIdB }
                  entity={ entity }
                  fieldAssociation={ fieldAssociation }
                  fieldAssociationIndex={ fieldAssociationIndex }
                  onAddNewGroup={ this.handleAddNewGroup }
                  providerA={ providerA }
                  providerB={ providerB }
                  providerIdentityIdA={ providerIdentityIdA }
                  providerIdentityIdB={ providerIdentityIdB }
                />
                <TrashIconWrapper>
                  <Button btnStyle="link" onClick={ this.hideNewGroup } size="xs">
                    <Icon name="trash" />
                  </Button>
                </TrashIconWrapper>
              </Card>
            </Group>
          )
        }
        {
          mapping.map((mappingGroup, groupIndex) => (
            <Group key={ `${groupIndex}-${fieldNameA}-${fieldNameB}` }>
              <MappingGroup
                fieldAssociation={ fieldAssociation }
                fieldAssociationIndex={ fieldAssociationIndex }
                fieldNameA={ fieldNameA }
                fieldNameB={ fieldNameB }
                groupIndex={ groupIndex }
                mappingGroup={ mappingGroup }
                multisyncLeafSide={ multisyncLeafSide }
                providerA={ providerA }
                providerB={ providerB }
                entity={ entity }
                providerIdentityIdA={ providerIdentityIdA }
                providerIdentityIdB={ providerIdentityIdB }
                containerIdA={ containerIdA }
                containerIdB={ containerIdB }
              />
              <TrashIconWrapper>
                <Button
                  btnStyle="link"
                  onClick={ onRemoveGroup(groupIndex) }
                  title="Remove this group"
                  size="xs"
                >
                  <Icon name="trash" />
                </Button>
              </TrashIconWrapper>
            </Group>
          )).toArray()
        }
      </ValueMapping>
    );
  }
}

const mapStateToProps = (state, { fieldAssociation }) => ({
  mapping: getFieldAssociationItems(state, fieldAssociation),
});

const mapDispatchToProps = (dispatch, {
  fieldAssociationIndex,
  entity,
  multisyncLeafSide,
  containerIdA,
  containerIdB,
}) => ({
  onAddNewGroup: (fieldValueA, fieldValueB) => {
    dispatch(fieldActions.addNewGroup({
      containerIdA,
      containerIdB,
      entity,
      fieldAssociationIndex,
      fieldValueA,
      fieldValueB,
      multisyncLeafSide,
    }));
  },
  onRemoveGroup: groupIndex => () => {
    dispatch(fieldActions.removeGroup({
      containerIdA,
      containerIdB,
      entity,
      fieldAssociationIndex,
      groupIndex,
      multisyncLeafSide,
    }));
  },
});


export default connect(mapStateToProps, mapDispatchToProps)(FieldAssociationValueMapping);



// WEBPACK FOOTER //
// ./src/containers/FieldAssociationValueMapping/FieldAssociationValueMapping.jsx