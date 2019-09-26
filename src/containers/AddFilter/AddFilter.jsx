import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map } from 'immutable';
import styled from 'styled-components';

import { fieldTypes } from '../../consts';
import {
  Section,
  Select,
  Title,
  TitleOption,
} from '../../components';

const { CUSTOM_FIELD } = fieldTypes.KINDS;
const { BOOLEAN, ID } = fieldTypes.FIELD_VALUES_TYPE;


const FilterOption = styled.span`
  padding-left: 8px;
`;


class AddFilter extends Component {
  static propTypes = {
    allContainerFields: PropTypes.instanceOf(Map).isRequired,
    containerSide: PropTypes.oneOf(['A', 'B']).isRequired,
    fields: PropTypes.object.isRequired,
  };

  removeCustomFieldPlaceholder = (text = '') => text.replace(/\${customFieldName} /g, '')

  // Allows custom fields options to be filtered-in if their groupName is the searchString.
  filterOption = (option, searchString) => {
    const { groupName, label, value } = option;
    const compareString = `${groupName || ''} ${label} ${value}`;

    return compareString.toLowerCase().includes(searchString.toLowerCase());
  }

  getFieldsWithFilters = () => {
    const { fields, allContainerFields } = this.props;
    const appliedFilters = fields.getAll();

    let fieldsWithFilters = allContainerFields;

    // Trim down container fields to only fields with unapplied filters
    appliedFilters.forEach((appliedFilter) => {
      const { fieldId, type } = appliedFilter;
      fieldsWithFilters = fieldsWithFilters.deleteIn([fieldId, type]);
    });

    return fieldsWithFilters.filter(field => field.get('whiteList') || field.get('blackList'));
  }

  getGroupDisplayName = field => (field.get('kind') === CUSTOM_FIELD
    ? field.get('name')
    : field.getIn(['displayName', 'default']) || field.getIn(['displayName', 'plural']))

  getFieldValuesType = (field) => {
    if (field.get('kind') === CUSTOM_FIELD && field.get('type') === 'boolean') {
      return BOOLEAN;
    }

    return ID;
  }

  createFilterGroup = (field, fieldId) => {
    const group = [];
    const groupName = this.getGroupDisplayName(field);

    // Add title Header to group
    group.push({
      disabled: true,
      label: groupName,
    });

    // Add the available whiteList and blackList filters
    for (const filterType of ['whiteList', 'blackList']) {
      const filter = field.get(filterType);
      const fieldValueType = this.getFieldValuesType(field);

      if (filter) {
        group.push({
          fieldId,
          fieldValueType,
          filterType,
          groupName,
          kind: field.get('kind'),
          label: this.removeCustomFieldPlaceholder(filter.get('label')),
          value: fieldId + filterType,
        });
      }
    }

    return group;
  }

  getOptions = () => {
    const fieldsWithFiltersToApply = this.getFieldsWithFilters();

    const fieldGroups = fieldsWithFiltersToApply
      .map((field, fieldId) => this.createFilterGroup(field, fieldId))
      .toArray()
      .sort((a, b) => (a[0].label.toLowerCase() > b[0].label.toLowerCase() ? 1 : -1));

    const options = [];
    fieldGroups.forEach(group => group.forEach(option => options.push(option)));

    return options;
  }

  renderOption = (option) => {
    const { disabled } = option;
    const Option = disabled ? TitleOption : FilterOption;

    return (
      <Option>
        { option.label } { ' ' }
      </Option>
    );
  };

  addFilter = (option) => {
    const { fields } = this.props;
    const {
      fieldId,
      fieldValueType,
      filterType,
      kind,
    } = option;

    fields.push({
      fieldId,
      fieldValueType,
      kind,
      type: filterType,
      values: '',
    });
  }

  render() {
    const options = this.getOptions();

    if (options.length === 0) {
      return null;
    }

    return (
      <Section>
        <Title type="h3">
          Add filter
        </Title>
        <Select
          onChange={ this.addFilter }
          openOnFocus
          optionRenderer={ this.renderOption }
          options={ options }
          placeholder="Type or select a filter..."
          filterOption={ this.filterOption }
        />
      </Section>
    );
  }
}

export default AddFilter;



// WEBPACK FOOTER //
// ./src/containers/AddFilter/AddFilter.jsx