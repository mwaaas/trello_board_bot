import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map, List } from 'immutable';

import { fieldActions } from '../../actions';
import { FieldAssociationRowCreate, InlineLoading, Section } from '../../components';
import { FieldAssociationList } from '../../containers';
import { multisyncTypes } from '../../consts';
import { getFieldAssociationsForMultisync, getContainerById } from '../../reducers';
import { MultisyncContainersSync } from '.';

export class MultisyncFieldAssociationList extends Component {
  static propTypes = {
    defaultTarget: PropTypes.oneOf(['A', 'B', 'both']).isRequired,
    deleteFieldAssociation: PropTypes.func.isRequired,
    fieldAssociations: PropTypes.instanceOf(List).isRequired,
    leafContainerId: PropTypes.string.isRequired,
    leafContainer: PropTypes.instanceOf(Map).isRequired,
    leafProviderIdentityId: PropTypes.string.isRequired,
    leafProvider: PropTypes.instanceOf(Map).isRequired,
    rootProvider: PropTypes.instanceOf(Map).isRequired,
    rootContainerId: PropTypes.string.isRequired,
    rootContainer: PropTypes.instanceOf(Map).isRequired,
    rootProviderIdentityId: PropTypes.string.isRequired,
    syncDirection: PropTypes.string.isRequired,
    topology: PropTypes.oneOf(Object.values(multisyncTypes.TOPOLOGIES)).isRequired,
  }

  render() {
    const {
      addNewFieldAssociation,
      defaultTarget,
      deleteFieldAssociation,
      fieldAssociations,
      leafContainer,
      leafContainerId,
      leafProvider,
      leafProviderIdentityId,
      rootContainer,
      rootContainerId,
      rootProvider,
      rootProviderIdentityId,
      syncDirection,
      topology,
    } = this.props;

    const providerA = topology === multisyncTypes.TOPOLOGIES.SPLIT ? rootProvider : leafProvider;
    const providerB = topology === multisyncTypes.TOPOLOGIES.SPLIT ? leafProvider : rootProvider;
    const containerIdA = topology === multisyncTypes.TOPOLOGIES.SPLIT ? rootContainerId : leafContainerId;
    const containerIdB = topology === multisyncTypes.TOPOLOGIES.SPLIT ? leafContainerId : rootContainerId;
    const containerA = topology === multisyncTypes.TOPOLOGIES.SPLIT ? rootContainer : leafContainer;
    const containerB = topology === multisyncTypes.TOPOLOGIES.SPLIT ? leafContainer : rootContainer;
    const providerIdentityIdA = topology === multisyncTypes.TOPOLOGIES.SPLIT ? rootProviderIdentityId : leafProviderIdentityId;
    const providerIdentityIdB = topology === multisyncTypes.TOPOLOGIES.SPLIT ? leafProviderIdentityId : rootProviderIdentityId;

    return (
      <div className="multisync-field-association-list">
        <Section>
          <MultisyncContainersSync
            providerA={ providerA }
            providerB={ providerB }
            syncDirection={ syncDirection }
            containerA={ containerA }
            containerB={ containerB }
          />
        </Section>

        <Section>
          <FieldAssociationRowCreate
            defaultTarget={ defaultTarget }
            fieldAssociations={ fieldAssociations }
            onAdd={ addNewFieldAssociation }
            providerA={ providerA }
            providerB={ providerB }
          />
        </Section>
        <Section>
          {
            fieldAssociations.isEmpty() ? (
              <InlineLoading>
                Loading...
              </InlineLoading>
            ) : (
              <FieldAssociationList
                containerIdA={ containerIdA }
                containerIdB={ containerIdB }
                defaultTarget={ defaultTarget }
                entity={ multisyncTypes.ENTITY_NAME }
                fieldAssociations={ fieldAssociations }
                multisyncLeafSide={ topology === multisyncTypes.TOPOLOGIES.SPLIT ? 'B' : 'A' }
                onDeleteFieldAssociation={ deleteFieldAssociation }
                providerA={ providerA }
                providerB={ providerB }
                providerIdentityIdA={ providerIdentityIdA }
                providerIdentityIdB={ providerIdentityIdB }
              />
            )
          }
        </Section>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  fieldAssociations: getFieldAssociationsForMultisync(state, ownProps),
  rootContainer: getContainerById(state, ownProps.topology === multisyncTypes.TOPOLOGIES.SPLIT ? 'A' : 'B', ownProps.rootContainerId),
  leafContainer: getContainerById(state, ownProps.topology === multisyncTypes.TOPOLOGIES.SPLIT ? 'B' : 'A', ownProps.leafContainerId),
});

const mapDispatchToProps = (dispatch, { leafContainerId }) => ({
  addNewFieldAssociation: ({ A, B, target }) => {
    dispatch(fieldActions.addFieldAssociation(
      { field: A.value, kind: A.kind, mappingCategory: A.category },
      { field: B.value, kind: B.kind, mappingCategory: B.category },
      target,
      multisyncTypes.ENTITY_NAME,
      leafContainerId,
    ));
  },
  deleteFieldAssociation: (index) => {
    dispatch(fieldActions.deleteFieldAssociation(index, multisyncTypes.ENTITY_NAME, leafContainerId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MultisyncFieldAssociationList);



// WEBPACK FOOTER //
// ./src/containers/Multisync/MultisyncFieldAssociationList.jsx