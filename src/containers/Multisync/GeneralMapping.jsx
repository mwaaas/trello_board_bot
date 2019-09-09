import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map, List } from 'immutable';
import { change } from 'redux-form';

import { fieldActions } from '../../actions';
import { fieldTypes, multisyncTypes } from '../../consts';
import {
  FieldAssociationRowCreate,
  Href,
  InlineLoading,
  Section,
} from '../../components';
import { FieldAssociationList } from '../../containers';
import { getFieldAssociationsForMultisync, isLoadedDefaultFieldAssociations, isActionLoading } from '../../reducers';

import { MultisyncContainersSync, TextWrapper } from '.';


class GeneralMapping extends Component {
  static propTypes = {
    addNewFieldAssociation: PropTypes.func.isRequired,
    deleteFieldAssociation: PropTypes.func.isRequired,
    fieldAssociations: PropTypes.instanceOf(List).isRequired,
    generateDefaultFieldAssociations: PropTypes.func.isRequired,
    isEdit: PropTypes.bool,
    isLoaded: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    leavesProvider: PropTypes.instanceOf(Map).isRequired,
    rootProvider: PropTypes.instanceOf(Map).isRequired,
    topology: PropTypes.oneOf(Object.values(multisyncTypes.TOPOLOGIES)).isRequired,
  };

  static defaultProps = {
    isEdit: false,
  }

  componentDidMount() {
    const { isLoaded, generateDefaultFieldAssociations, isEdit } = this.props;
    if (!isLoaded && !isEdit) {
      generateDefaultFieldAssociations();
    }
  }

  render() {
    const {
      addNewFieldAssociation,
      deleteFieldAssociation,
      fieldAssociations,
      isEdit,
      isLoading,
      leavesProvider,
      rootProvider,
      topology,
    } = this.props;

    if (isLoading) {
      return <InlineLoading />;
    }

    const providerA = topology === multisyncTypes.TOPOLOGIES.SPLIT ? rootProvider : leavesProvider;
    const providerB = topology === multisyncTypes.TOPOLOGIES.SPLIT ? leavesProvider : rootProvider;
    return (
      <div className="general-mapping">
        <Section>
          {
            isEdit ? (
              <TextWrapper>
                Please note that changes will <i>only</i> be applied on the next sync added in this Multi-Sync.
                If you need to update the mapped fields on an existing sync, please edit each sync individually.<br/>
                👉 Need some help updating the field mapping?
                Check out the <Href href="https://guide.unito.io/hc/en-us/articles/226811628-Customize-Which-and-How-Fields-are-Synchronized">
                Knowledge Base</Href>.
              </TextWrapper>
            ) : (
              <TextWrapper>
                Unito automatically connects fields between your tools, please verify that every field is correctly mapped.<br/>
                👉 Need some help with field mapping?
                Check out the <Href href="https://guide.unito.io/hc/en-us/articles/226811628-Customize-Which-and-How-Fields-are-Synchronized">
                Knowledge Base</Href>.
              </TextWrapper>
            )
          }
        </Section>

        <Section>
          <MultisyncContainersSync providerA={ providerA } providerB={ providerB } />
        </Section>
        <Section>
          <FieldAssociationRowCreate
            fieldAssociations={ fieldAssociations }
            onAdd={ addNewFieldAssociation }
            providerA={ providerA }
            providerB={ providerB }
          />
        </Section>

        <Section>
          <FieldAssociationList
            fieldAssociations={ fieldAssociations }
            hideFieldValues
            onDeleteFieldAssociation={ deleteFieldAssociation }
            providerA={ providerA }
            providerB={ providerB }
            entity={ multisyncTypes.ENTITY_NAME }
          />
        </Section>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  fieldAssociations: getFieldAssociationsForMultisync(state, {
    ...ownProps,
    rootProvider: ownProps.rootProvider,
    leafProvider: ownProps.leavesProvider,
  }),
  isLoaded: isLoadedDefaultFieldAssociations(state),
  isLoading: isActionLoading(state, fieldTypes.GENERATE_FIELD_ASSOCIATIONS),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  deleteFieldAssociation: (index) => {
    dispatch(change('multisyncForm', 'fieldAssociationsHaveChanged', true));
    dispatch(fieldActions.deleteFieldAssociation(index, multisyncTypes.ENTITY_NAME));
  },
  addNewFieldAssociation: ({ A, B, target }) => {
    dispatch(change('multisyncForm', 'fieldAssociationsHaveChanged', true));
    dispatch(fieldActions.addFieldAssociation(
      { field: A.value, kind: A.kind, mappingCategory: A.category },
      { field: B.value, kind: B.kind, mappingCategory: B.category },
      target,
      multisyncTypes.ENTITY_NAME,
    ));
  },
  generateDefaultFieldAssociations: () => {
    const providerIdentityIdA = ownProps.topology === multisyncTypes.TOPOLOGIES.SPLIT
      ? ownProps.rootProviderIdentityId
      : ownProps.leavesProviderIdentityId;
    const providerIdentityIdB = ownProps.topology === multisyncTypes.TOPOLOGIES.SPLIT
      ? ownProps.leavesProviderIdentityId
      : ownProps.rootProviderIdentityId;
    dispatch(fieldActions.generateDefaultFieldAssociations(
      { providerIdentityId: providerIdentityIdA },
      { providerIdentityId: providerIdentityIdB },
    ));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(GeneralMapping);



// WEBPACK FOOTER //
// ./src/containers/Multisync/GeneralMapping.jsx