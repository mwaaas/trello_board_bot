import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map, List } from 'immutable';
import classnames from 'classnames';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { fieldActions } from '../../actions';
import { linkTypes, multisyncTypes } from '../../consts';
import { FieldValuesGroup } from '../../components';
import { color } from '../../theme';


const StyledGroup = styled.div`
  background: ${color.light.primary};
  border: 1px solid ${color.dark.whisper};
  border-radius: 4px;
  margin: 0;

  animation: slide-down .3s ease-out;

  @keyframes slide-down {
    0% { opacity: 0; transform: translateY(-100%); }
    100% { opacity: 1; transform: translateY(0); }
  }

  &:hover {
    .field-values-group__add {
      display: block;
    }
  }
`;


class MappingGroup extends Component {
  static propTypes = {
    className: PropTypes.string,
    containerIdA: PropTypes.string.isRequired,
    containerIdB: PropTypes.string.isRequired,
    entity: PropTypes.oneOf([linkTypes.ENTITY_NAME, multisyncTypes.ENTITY_NAME]).isRequired,
    fieldAssociation: PropTypes.instanceOf(Map),
    fieldAssociationIndex: PropTypes.number.isRequired,
    fieldNameA: PropTypes.string.isRequired,
    fieldNameB: PropTypes.string.isRequired,
    groupIndex: PropTypes.number,
    mappingGroup: PropTypes.instanceOf(Map),
    multisyncLeafSide: PropTypes.oneOf(['A', 'B']),
    onAddFieldValue: PropTypes.func.isRequired,
    onMakeDefaultItem: PropTypes.func.isRequired,
    onUnmapItem: PropTypes.func.isRequired,
    providerA: PropTypes.instanceOf(Map).isRequired,
    providerB: PropTypes.instanceOf(Map).isRequired,
    providerIdentityIdA: PropTypes.string.isRequired,
    providerIdentityIdB: PropTypes.string.isRequired,
  };

  static defaultProps = {
    mappingGroup: Map({
      A: List(),
      B: List(),
    }),
  };

  state = {
    shouldHighlightSideA: false,
    shouldHighlightSideB: false,
  };

  handleShouldHighlightOtherSide = (otherSide, needsHighlight) => {
    this.setState({
      [`shouldHighlightSide${otherSide}`]: needsHighlight,
    });
  }

  handleAddFieldValue = (containerSide, fieldId) => {
    const { onAddFieldValue } = this.props;
    onAddFieldValue(containerSide, fieldId);
  }

  render() {
    const {
      className,
      containerIdA,
      containerIdB,
      fieldAssociation,
      fieldNameA,
      fieldNameB,
      mappingGroup,
      onMakeDefaultItem,
      onUnmapItem,
      providerA,
      providerB,
      providerIdentityIdA,
      providerIdentityIdB,
    } = this.props;

    const { shouldHighlightSideA, shouldHighlightSideB } = this.state;
    const classNames = classnames('mapping-group', 'row', className);

    const fieldValueIdsToExclude = Map({
      A: fieldAssociation.getIn(['A', 'mapping'], List()).flatten(1),
      B: fieldAssociation.getIn(['B', 'mapping'], List()).flatten(1),
    });

    return (
      <StyledGroup className={ classNames }>
        {
          mappingGroup.map((mappedFieldValues, containerSide) => {
            const isActive = (shouldHighlightSideA && containerSide === 'A') || (shouldHighlightSideB && containerSide === 'B');
            const colClassNames = classnames('col-xs-5', { 'col-xs-push-2': containerSide === 'B' });
            const provider = containerSide === 'A' ? providerA : providerB;
            const fieldName = containerSide === 'A' ? fieldNameA : fieldNameB;
            const containerId = containerSide === 'A' ? containerIdA : containerIdB;
            const providerIdentityId = containerSide === 'A' ? providerIdentityIdA : providerIdentityIdB;

            return (
              <div className={ colClassNames } key={ containerSide }>
                <FieldValuesGroup
                  category={ fieldAssociation.getIn([containerSide, 'mappingCategory']) }
                  containerSide={ containerSide }
                  fieldId={ fieldAssociation.getIn([containerSide, 'field']) }
                  fieldName={ fieldName }
                  fieldValueIdsToExclude={ fieldValueIdsToExclude.get(containerSide) }
                  fieldValues={ mappedFieldValues }
                  isActive={ isActive }
                  kind={ fieldAssociation.getIn([containerSide, 'kind']) }
                  onAddFieldValue={ this.handleAddFieldValue }
                  onMakeDefaultItem={ onMakeDefaultItem }
                  onShouldHighlightOtherSide={ this.handleShouldHighlightOtherSide }
                  onUnmapItem={ onUnmapItem }
                  provider={ provider }
                  target={ fieldAssociation.get('target') }
                  containerId={ containerId }
                  providerIdentityId={ providerIdentityId }
                />
              </div>
            );
          }, this).toArray()
        }
      </StyledGroup>
    );
  }
}

const mapDispatchToProps = (dispatch, {
  containerIdA,
  containerIdB,
  entity,
  fieldAssociationIndex,
  groupIndex,
  multisyncLeafSide,
}) => ({
  onAddFieldValue: (containerSide, fieldValue) => {
    dispatch(fieldActions.addItem({
      fieldAssociationIndex,
      containerSide,
      groupIndex,
      fieldId: fieldValue.id,
      entity,
      containerIdA,
      containerIdB,
      multisyncLeafSide,
    }));
  },
  onMakeDefaultItem: (containerSide, itemIndex) => {
    dispatch(fieldActions.makeDefaultItem({
      containerIdA,
      containerIdB,
      containerSide,
      entity,
      fieldAssociationIndex,
      groupIndex,
      itemIndex,
      multisyncLeafSide,
    }));
  },
  onUnmapItem: (containerSide, itemIndex) => {
    dispatch(fieldActions.unmapItem({
      fieldAssociationIndex,
      containerSide,
      groupIndex,
      itemIndex,
      entity,
      containerIdA,
      containerIdB,
      multisyncLeafSide,
    }));
  },
});

export default connect(null, mapDispatchToProps)(MappingGroup);



// WEBPACK FOOTER //
// ./src/containers/MappingGroup/MappingGroup.jsx