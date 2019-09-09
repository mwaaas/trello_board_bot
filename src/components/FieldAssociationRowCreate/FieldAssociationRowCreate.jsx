import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { List, Map } from 'immutable';

import {
  Icon,
  Button,
  Title,
} from '../';
import { NewFieldAssociationFieldSelect } from '../../containers';
import { fieldTypes } from '../../consts';
import { otherSide as getOtherSide } from '../../utils';
import './FieldAssociationRowCreate.scss';


const directionIcon = {
  both: 'exchange',
  A: 'long-arrow-left',
  B: 'long-arrow-right',
};


export default class FieldAssociationRowCreate extends Component {
  static propTypes = {
    defaultTarget: PropTypes.oneOf(Object.values(fieldTypes.TARGET)),
    fieldAssociations: PropTypes.instanceOf(List).isRequired,
    onAdd: PropTypes.func.isRequired,
    providerA: PropTypes.instanceOf(Map).isRequired,
    providerB: PropTypes.instanceOf(Map).isRequired,
  };

  static defaultProps = {
    defaultTarget: fieldTypes.TARGET.BOTH,
  };

  state = {
    A: null,
    B: null,
  };

  /**
   * Return new field association target based on:
   * linkBlock, readOnly and writeOnly properties of the selected fields
   * and the sync direction
   */
  getTarget = (containerSide, selectedField) => {
    let { A, B } = this.state;
    if (containerSide === 'A') {
      A = selectedField;
    } else if (containerSide === 'B') {
      B = selectedField;
    }
    const { defaultTarget } = this.props;

    if (A === null && B === null) {
      return defaultTarget;
    }

    if (A && A.value === fieldTypes.DESCRIPTION_FOOTER) {
      return fieldTypes.TARGET.A;
    }

    if (B && B.value === fieldTypes.DESCRIPTION_FOOTER) {
      return fieldTypes.TARGET.B;
    }

    if (A && A.field.get('readOnly')) {
      return fieldTypes.TARGET.B;
    }

    if (B && B.field.get('readOnly')) {
      return fieldTypes.TARGET.A;
    }

    return defaultTarget;
  };

  handleChange = containerSide => (selectedField) => {
    const otherSide = getOtherSide(containerSide);
    const { onAdd } = this.props;

    const otherSideField = this.state[otherSide];
    if (otherSideField) {
      const target = this.getTarget(containerSide, selectedField);

      onAdd({
        [containerSide]: selectedField,
        [otherSide]: otherSideField,
        target,
      });

      this.setState({ A: null, B: null });
      return;
    }

    this.setState({ [containerSide]: selectedField });
  };

  getExistingFieldsBySide = (containerSide) => {
    const { fieldAssociations } = this.props;
    return fieldAssociations.map(association => association.getIn([containerSide, 'field']));
  };

  render() {
    const {
      providerA,
      providerB,
    } = this.props;
    const target = this.getTarget();

    return (
      <div className="field-association-row-create">
        <Title type="h3">Map a new pair</Title>

        <div className="row">
          <div className="col-xs-5">
            <NewFieldAssociationFieldSelect
              containerSide="A"
              existingFields={ this.getExistingFieldsBySide('A') }
              onChange={ this.handleChange('A') }
              otherSideOption={ this.state.B }
              provider={ providerA }
              selectedOption={ this.state.A }
            />
          </div>

          <div className="col-xs-2 text-center">
            <Icon
              name={ directionIcon[target] }
              className="field-association-row-create__divider"
            />
          </div>

          <div className="col-xs-5">
            <NewFieldAssociationFieldSelect
              containerSide="B"
              existingFields={ this.getExistingFieldsBySide('B') }
              onChange={ this.handleChange('B') }
              otherSideOption={ this.state.A }
              provider={ providerB }
              selectedOption={ this.state.B }
            />
          </div>

          <div className="field-association-row-create__actions">
            <Button
              btnStyle="link"
              onClick={ () => this.setState({ A: null, B: null }) }
              className="field-association-row-create__clear"
              size="xs"
              title="Clear"
            >
              <Icon name="remove" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/FieldAssociationRowCreate/FieldAssociationRowCreate.jsx