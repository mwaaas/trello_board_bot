import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';

import { Select } from '../../components';
import { fieldTypes } from '../../consts';
import { getFieldsWithFilterCapability } from '../../reducers';


class FilterFieldsSelect extends Component {
  static propTypes = {
    containerSide: PropTypes.string,
    fieldsWithFilterCapability: PropTypes.instanceOf(Map).isRequired,
    includeCustomFields: PropTypes.bool,
    labelType: PropTypes.oneOf(['label', 'sourcePhrase', 'destinationPhrase']),
    type: PropTypes.oneOf(['whiteList', 'blackList', 'both']),
  };

  static defaultProps = {
    includeCustomFields: false,
    labelType: 'label',
    type: 'both',
  };

  getOptions = () => {
    const {
      fieldsWithFilterCapability,
      type,
      includeCustomFields,
      labelType,
    } = this.props;

    let whiteLists = Map();
    let blackLists = Map();
    if (['both', 'whiteList'].includes(type)) {
      whiteLists = fieldsWithFilterCapability
        .filter(field => includeCustomFields || field.get('kind') === fieldTypes.KINDS.PCD_FIELD)
        .filter(field => field.hasIn(['whiteList', labelType], false))
        .map((field, fieldId) => ({
          label: field.getIn(['whiteList', labelType]),
          fieldId,
          type: 'whiteList',
          kind: field.get('kind'),
          value: `whiteList.${field.get('kind')}.${fieldId}`,
        }));
    }

    if (['both', 'blackList'].includes(type)) {
      const fieldsWithBlackList = fieldsWithFilterCapability.filter(field => field.has('blackList'));
      blackLists = fieldsWithBlackList.map((field, fieldId) => ({
        label: field.getIn(['blackList', labelType]),
        fieldId,
        type: 'blackList',
        kind: field.get('kind'),
        value: `blackList.${field.get('kind')}.${fieldId}`,
      }));
    }

    return whiteLists.concat(blackLists).toArray();
  }

  filterOption = (option, searchString) => {
    const {
      fieldId,
      type,
      groupName,
      label,
      value,
    } = option;

    const compareString = `${groupName || ''} ${label} ${value} ${type} ${fieldId}`;
    return compareString.toLowerCase().includes(searchString.toLowerCase());
  }

  handleOnBlur = (selectedValue) => {
    const [type, kind, fieldId] = selectedValue.split('.');
    this.props.input.onBlur({
      fieldId,
      type,
      kind,
    });
  }

  handleOnChange = (value) => {
    this.props.input.onChange(value);
  }

  render() {
    const { input, ...rest } = this.props;
    return (
      <Select
        {...input}
        {...rest}
        clearable={ false }
        filterOption={ this.filterOption }
        options={ this.getOptions() }
        placeholder="Type or select a filter..."
        onChange={ this.handleOnChange }
      />
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  fieldsWithFilterCapability: getFieldsWithFilterCapability(state, ownProps),
});

export default connect(mapStateToProps)(FilterFieldsSelect);



// WEBPACK FOOTER //
// ./src/containers/FilterFieldsSelect/FilterFieldsSelect.jsx