import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { fromJS, Map, List } from 'immutable';
import { connect } from 'react-redux';

import { InlineLoading } from '../../components';
import { FieldAssociationItem } from '../../containers';
import { fieldTypes, linkTypes, multisyncTypes } from '../../consts';
import { getIsCustomFieldsLoading } from '../../reducers';
import './FieldAssociationList.scss';


const readOnlyFieldAssociations = fromJS([
  { A: { field: 'title', displayName: 'title' }, B: { field: 'title', displayName: 'title' } },
  { A: { field: 'description', displayName: 'description' }, B: { field: 'description', displayName: 'description' } },
  { A: { field: 'comments', displayName: 'comments' }, B: { field: 'comments', displayName: 'comments' } },
]);

class FieldAssociationList extends Component {
  static propTypes = {
    containerIdA: PropTypes.string,
    containerIdB: PropTypes.string,
    defaultTarget: PropTypes.oneOf(Object.values(fieldTypes.TARGET)),
    entity: PropTypes.oneOf([linkTypes.ENTITY_NAME, multisyncTypes.ENTITY_NAME]).isRequired,
    fieldAssociations: PropTypes.instanceOf(List).isRequired,
    isEdit: PropTypes.bool,
    isLoadingCustomFields: PropTypes.bool,
    hideFieldValues: PropTypes.bool,
    multisyncLeafSide: PropTypes.oneOf(['A', 'B']),
    onDeleteFieldAssociation: PropTypes.func.isRequired,
    providerA: PropTypes.instanceOf(Map).isRequired,
    providerB: PropTypes.instanceOf(Map).isRequired,
    providerIdentityIdA: PropTypes.string,
    providerIdentityIdB: PropTypes.string,
  };

  state = {
    expandedIndex: null,
  };

  static defaultProps = {
    hideFieldValues: false,
  };

  componentWillReceiveProps(nextProps) {
    // Check in react doc if we can set the state here
    // if container id is different, set expandIndex to null
    if (this.props.containerIdB !== nextProps.containerIdB) {
      this.setState({ expandedIndex: null });
    }
  }

  onCustomizeAssociation = (fieldAssociation, index) => {
    // Only return the onCustomize function if it's a field association with field value mapping
    if (fieldAssociation.get('hasMapValues')) {
      return this.collapseInFieldAssociation(index);
    }
  }

  onDeleteAssociation = index => () => {
    // Remove expandedIndex so we avoid issues with index
    this.setState({ expandedIndex: null });
    this.props.onDeleteFieldAssociation(index);
  }

  collapseInFieldAssociation = index => () => {
    const { expandedIndex } = this.state;
    const newIndex = index === expandedIndex ? null : index;
    this.setState({ expandedIndex: newIndex });
  }

  render() {
    const {
      containerIdA,
      containerIdB,
      defaultTarget,
      entity,
      fieldAssociations,
      isEdit,
      isLoadingCustomFields,
      hideFieldValues,
      multisyncLeafSide,
      providerA,
      providerB,
      providerIdentityIdA,
      providerIdentityIdB,
    } = this.props;
    const { expandedIndex } = this.state;

    if (isEdit && isLoadingCustomFields) {
      return (
        <InlineLoading>
          Loading...
        </InlineLoading>
      );
    }

    return (
      <div className="field-association-list">
        <ul className="field-association-list__items">

          {
            fieldAssociations.map((association, index) => {
              const onCustomizeClick = this.onCustomizeAssociation(association, index);
              const onDeleteClick = this.onDeleteAssociation(index);
              const fieldNameA = association.getIn(['A', 'displayName']) || association.getIn(['A', 'field']);
              const fieldNameB = association.getIn(['B', 'displayName']) || association.getIn(['B', 'field']);

              return (
                <li key={ `${fieldNameA}${fieldNameB}` }>
                  <FieldAssociationItem
                    defaultTarget={ defaultTarget }
                    fieldAssociation={ association }
                    fieldAssociationIndex={ index }
                    isActive={ expandedIndex === index }
                    hideFieldValues={ hideFieldValues }
                    multisyncLeafSide={ multisyncLeafSide }
                    onCustomizeClick={ onCustomizeClick }
                    onDeleteClick={ onDeleteClick }
                    providerA={ providerA }
                    providerB={ providerB }
                    entity={ entity }
                    containerIdA={ containerIdA }
                    containerIdB={ containerIdB }
                    providerIdentityIdA={ providerIdentityIdA }
                    providerIdentityIdB={ providerIdentityIdB }
                  />
                </li>
              );
            }).toArray()
          }

          {
            readOnlyFieldAssociations.map((fieldAssociation, index) => (
              <li key={ index }>
                <FieldAssociationItem
                  defaultTarget={ defaultTarget }
                  entity={ entity }
                  fieldAssociation={ fieldAssociation }
                  providerA={ providerA }
                  providerB={ providerB }
                />
              </li>
            ))
          }
        </ul>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isLoadingCustomFields: getIsCustomFieldsLoading(state),
});

export default connect(mapStateToProps)(FieldAssociationList);



// WEBPACK FOOTER //
// ./src/containers/FieldAssociationList/FieldAssociationList.jsx