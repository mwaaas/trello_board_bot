import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { List, Map } from 'immutable';
import styled from 'styled-components';

import { Icon } from '../../components';
import { FieldValuesSelect } from '../../containers';


const Col = styled.div`
  .new-field-values-group__A {
    padding-right: 1em;
  }

  .new-field-values-group__B {
    padding-left: 1em;
  }
`;


export default class NewFieldValuesGroup extends Component {
  static propTypes = {
    containerIdA: PropTypes.string.isRequired,
    containerIdB: PropTypes.string.isRequired,
    fieldAssociation: PropTypes.instanceOf(Map).isRequired,
    onAddNewGroup: PropTypes.func.isRequired,
    providerA: PropTypes.instanceOf(Map).isRequired,
    providerB: PropTypes.instanceOf(Map).isRequired,
    providerIdentityIdA: PropTypes.string.isRequired,
    providerIdentityIdB: PropTypes.string.isRequired,
  };

  state = {
    A: null,
    B: null,
  };

  handleAddFieldValue = containerSide => (newOption) => {
    const { onAddNewGroup } = this.props;
    const otherSide = containerSide === 'A' ? 'B' : 'A';

    // If add a new group mapping, wait for both values to be set and add the group
    if (this.state[otherSide]) {
      const fieldA = containerSide === 'A' ? newOption : this.state.A;
      const fieldB = containerSide === 'B' ? newOption : this.state.B;
      onAddNewGroup(fieldA, fieldB);
      this.setState({ A: null, B: null });
      return;
    }

    this.setState({ [containerSide]: newOption });
  }

  render() {
    const {
      containerIdA,
      containerIdB,
      entity,
      fieldAssociation,
      providerIdentityIdA,
      providerIdentityIdB,
    } = this.props;

    return (
      <div className="row">
        <Col className="col-xs-5">
          <FieldValuesSelect
            category={ fieldAssociation.getIn(['A', 'mappingCategory']) }
            className="new-field-values-group__A"
            containerId={ containerIdA }
            containerSide="A"
            fieldId={ fieldAssociation.getIn(['A', 'field']) }
            fieldValueIdsToExclude={ fieldAssociation.getIn(['A', 'mapping'], List()).flatten(1) }
            kind={ fieldAssociation.getIn(['A', 'kind']) }
            onChange={ this.handleAddFieldValue('A') }
            providerIdentityId={ providerIdentityIdA }
            value={ this.state.A }
          />
        </Col>

        <div className="col-xs-2 text-center">
          <Icon name="exchange" />
        </div>

        <Col className="col-xs-5">
          <FieldValuesSelect
            category={ fieldAssociation.getIn(['B', 'mappingCategory']) }
            className="new-field-values-group__B"
            containerId={ containerIdB }
            containerSide="B"
            entity={ entity }
            fieldId={ fieldAssociation.getIn(['B', 'field']) }
            fieldValueIdsToExclude={ fieldAssociation.getIn(['B', 'mapping'], List()).flatten(1) }
            kind={ fieldAssociation.getIn(['B', 'kind']) }
            onChange={ this.handleAddFieldValue('B') }
            providerIdentityId={ providerIdentityIdB }
            value={ this.state.B }
          />
        </Col>
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/containers/NewFieldValuesGroup/NewFieldValuesGroup.jsx