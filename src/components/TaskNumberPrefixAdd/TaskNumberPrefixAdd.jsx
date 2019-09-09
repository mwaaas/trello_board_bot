import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { List, Map } from 'immutable';

import { fieldTypes } from '../../consts';
import { FieldValuesSelect } from '../../containers';

import './TaskNumberPrefixAdd.scss';


export default class TaskNumberPrefixAdd extends Component {
  static propTypes = {
    containerSide: PropTypes.oneOf(['A', 'B']).isRequired,
    onAddPrefix: PropTypes.func.isRequired,
    pcdOption: PropTypes.instanceOf(Map).isRequired,
    input: PropTypes.object.isRequired,
  };

  onChangePrefix = (event) => {
    this.setState({ prefix: event.target.value });
  };

  onSelectIssueType = (value) => {
    const { onAddPrefix, pcdOption } = this.props;
    const defaultPrefix = pcdOption.getIn(['default', 'default']);

    onAddPrefix(value, defaultPrefix);
  };

  getIdsToExclude = () => {
    const { input } = this.props;
    if (!input.value) {
      return List();
    }

    return input.value.keySeq().toList();
  };

  render() {
    const { containerSide, pcdOption } = this.props;
    const otherSide = containerSide === 'A' ? 'B' : 'A';
    const fieldValueIdsToExclude = this.getIdsToExclude();
    const defaultPrefix = pcdOption.getIn(['default', 'default']);

    return (
      <div className="task-number-prefix-add">
        <FieldValuesSelect
          className="task-number-prefix-add__select"
          containerSide={ otherSide }
          disabledText="Selected"
          fieldId={ pcdOption.get('field') }
          fieldValueIdsToExclude={ fieldValueIdsToExclude }
          kind={ fieldTypes.KINDS.PCD_FIELD }
          onChange={ this.onSelectIssueType }
        />
        <input
          className="form-control task-number-prefix-add__prefix"
          type="text"
          defaultValue={ defaultPrefix }
        />
        <div className="help-block">
          Customize the prefix for a specific issue type
        </div>
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/TaskNumberPrefixAdd/TaskNumberPrefixAdd.jsx