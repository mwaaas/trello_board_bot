import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';

import { fieldActions } from '../../actions';
import { FieldAssociationRowCreate, Section } from '../../components';
import { fieldTypes, linkTypes } from '../../consts';
import { ContainersSync, FieldAssociationList } from '../../containers';
import Trackable from '../../components/TrackableHoC/TrackableHoC';
import {
  getContainerFieldValue,
  getCurrentSyncDirection,
  getFieldAssociationsList,
  getProvider,
} from '../../reducers';



class FieldMappingList extends Component {
  static propTypes = {
    deleteFieldAssociation: PropTypes.func.isRequired,
    fieldAssociations: PropTypes.instanceOf(List).isRequired,
    isEdit: PropTypes.bool,
    providerA: PropTypes.instanceOf(Map).isRequired,
    providerB: PropTypes.instanceOf(Map).isRequired,
    syncDirection: PropTypes.oneOf(Object.values(fieldTypes.TARGET)),
  };

  static defaultProps = {
    isEdit: false,
  };

  state = {
    collapsedInMappingName: '',
  };

  onCollapseInMapping = (mappingName) => {
    if (this.state.collapsedInMappingName === mappingName) {
      this.setState({ collapsedInMappingName: '' });
    } else {
      this.setState({ collapsedInMappingName: mappingName });
    }
  }

  onDeleteFieldAssociation = (index) => {
    this.props.deleteFieldAssociation(index);
  }

  render() {
    const {
      addNewFieldAssociation,
      fieldAssociations,
      isEdit,
      providerA,
      providerB,
      syncDirection,
      containerIdA,
      containerIdB,
      providerIdentityIdA,
      providerIdentityIdB,
    } = this.props;

    return (
      <div className="field-mapping-list">
        <Section>
          <ContainersSync isEdit={ isEdit } />
        </Section>
        <Section>
          <FieldAssociationRowCreate
            defaultTarget={ syncDirection }
            fieldAssociations={ fieldAssociations }
            onAdd={ addNewFieldAssociation }
            providerA={ providerA }
            providerB={ providerB }
          />
        </Section>
        <FieldAssociationList
          defaultTarget={ syncDirection }
          fieldAssociations={ fieldAssociations }
          isEdit={ isEdit }
          onDeleteFieldAssociation={ this.onDeleteFieldAssociation }
          providerA={ providerA }
          providerB={ providerB }
          entity={ linkTypes.ENTITY_NAME }
          containerIdA={ containerIdA }
          containerIdB={ containerIdB }
          providerIdentityIdA={ providerIdentityIdA }
          providerIdentityIdB={ providerIdentityIdB }
        />
      </div>
    );
  }
}
FieldMappingList = Trackable(FieldMappingList, 'customize/fields');


const mapStateToProps = state => ({
  fieldAssociations: getFieldAssociationsList(state),
  syncDirection: getCurrentSyncDirection(state),
  providerA: getProvider(state, { containerSide: 'A' }),
  providerB: getProvider(state, { containerSide: 'B' }),
  containerIdA: getContainerFieldValue(state, { containerSide: 'A' }, 'containerId'),
  containerIdB: getContainerFieldValue(state, { containerSide: 'B' }, 'containerId'),
  providerIdentityIdA: getContainerFieldValue(state, { containerSide: 'A' }, 'providerIdentityId'),
  providerIdentityIdB: getContainerFieldValue(state, { containerSide: 'B' }, 'providerIdentityId'),
});

const mapDispatchToProps = dispatch => ({
  deleteFieldAssociation: (index) => {
    dispatch(fieldActions.deleteFieldAssociation(index, 'links'));
  },
  addNewFieldAssociation: ({ A, B, target }) => {
    dispatch(fieldActions.addFieldAssociation(
      { field: A.fieldId, kind: A.kind, mappingCategory: A.category },
      { field: B.fieldId, kind: B.kind, mappingCategory: B.category },
      target,
      linkTypes.ENTITY_NAME,
    ));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(FieldMappingList);



// WEBPACK FOOTER //
// ./src/containers/FieldMappingList/FieldMappingList.jsx