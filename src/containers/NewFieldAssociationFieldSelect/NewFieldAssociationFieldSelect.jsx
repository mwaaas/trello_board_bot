import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { List, fromJS, Map } from 'immutable';
import { connect } from 'react-redux';
import ReactSelect from 'react-select';

import { IconHoverTooltip, TextSelectOption } from '../../components';
import { fieldTypes } from '../../consts';
import { getCustomFields, getMappingCategories } from '../../reducers';
import { color } from '../../theme';
import './NewFieldAssociationFieldSelect.scss';


class NewFieldAssociationFieldSelect extends Component {
  static propTypes = {
    containerSide: PropTypes.oneOf(['A', 'B']).isRequired,
    customFields: PropTypes.instanceOf(Map),
    existingFields: PropTypes.instanceOf(List).isRequired,
    onChange: PropTypes.func.isRequired,
    otherSideOption: PropTypes.object,
    provider: PropTypes.instanceOf(Map).isRequired,
    selectedOption: PropTypes.object,
    workflows: PropTypes.instanceOf(Map).isRequired,
  };

  getOptions = () => {
    const allFields = this.getAllFields();
    return allFields.map((option) => {
      const alreadyMapped = option.get('alreadyMapped', false);
      return {
        alreadyMapped,
        disabled: !this.isOptionCompatible(option) || alreadyMapped,
        value: option.get('id'),
        label: option.get('displayName'),
        kind: option.get('kind'),
        field: option.get('field'),
        category: option.get('category'),
        fieldId: option.get('fieldId'),
      };
    }).toArray();
  }

  getAllFields = () => {
    const fields = this.getPcdFieldOptions();
    const categories = this.getCategoryOptions();
    const common = this.getCommonOptions();
    const customFields = this.getCustomFieldOptions();
    return fields
      .concat(categories)
      .concat(common)
      .concat(customFields)
      .sortBy((field) => {
        const displayName = field.get('displayName') || '';
        return displayName.toLowerCase();
      });
  }

  isOptionCompatible = (option) => {
    const { otherSideOption, provider } = this.props;
    // If there is no field selected on the other side any option is available
    if (!otherSideOption) {
      return true;
    }

    // Cannot map 2 description footers
    if (option.get('id') === fieldTypes.DESCRIPTION_FOOTER && otherSideOption.value === fieldTypes.DESCRIPTION_FOOTER) {
      return false;
    }

    // All fields are compatible with Sync footer
    if (option.get('id') === fieldTypes.DESCRIPTION_FOOTER || otherSideOption.value === fieldTypes.DESCRIPTION_FOOTER) {
      return true;
    }

    const customFieldCompatibilities = provider.getIn(['capabilities', 'customFieldCompatibilities'], Map());
    switch (option.get('kind')) {
      case fieldTypes.KINDS.CUSTOM_FIELD: {
        // Custom fields type are compatible because of the set by value feature
        if (otherSideOption.kind === fieldTypes.KINDS.CUSTOM_FIELD) {
          return true;
        }

        if (otherSideOption.kind === fieldTypes.KINDS.PCD_FIELD) {
          const compatibility = customFieldCompatibilities.get(option.getIn(['field', 'type'])) || List();
          return compatibility.contains(otherSideOption.fieldId);
        }
        break;
      }

      case fieldTypes.KINDS.PCD_FIELD: {
        if (otherSideOption.kind === fieldTypes.KINDS.PCD_FIELD) {
          // Can't map 2 readOnly fields
          if (option.getIn(['field', 'readOnly'], false) && otherSideOption.field.get('readOnly', false)) {
            return false;
          }

          const compatibilities = provider.getIn(['capabilities', 'fieldCompatibilities'], Map());
          const compatibility = compatibilities.get(option.get('fieldId')) || List();
          return compatibility.contains(otherSideOption.fieldId);
        }

        if (otherSideOption.kind === fieldTypes.KINDS.CUSTOM_FIELD) {
          const compatibility = customFieldCompatibilities.get(otherSideOption.field.get('type')) || List();
          return compatibility.contains(option.get('fieldId'));
        }
        break;
      }

      default:
        return false;
    }

    return false;
  }

  renderOption = (option) => {
    const {
      disabled,
      label,
      value,
      alreadyMapped,
    } = option;
    const isDescriptionFooter = value === fieldTypes.DESCRIPTION_FOOTER;

    return (
      <TextSelectOption
        disabled={ disabled || alreadyMapped }
        maxTextLength={ 30 }
        disabledText={ alreadyMapped ? 'Mapped' : 'Incompatible' }
      >
        { label } { ' ' }
        {
          isDescriptionFooter && (
            <IconHoverTooltip placement="top" iconColor={ color.dark.hint }>
              Special block of text added at the end of the description. { ' ' }
              Displays additional information from fields of the other app.
            </IconHoverTooltip>
          )
        }
      </TextSelectOption>
    );
  }

  /*
   * Retrieve pcd fields
   * Filter out existing field association from pcdFields
   * Also filter out pcd fields that are displayed as categories (i.e status workflows in Wrike)
   * since they are handled in the workflows mapping below this block of code
   */
  getPcdFieldOptions = () => {
    const { existingFields, provider } = this.props;
    const pcdFields = provider.getIn(['capabilities', 'fields'], Map());
    return pcdFields
      .filter(field => !field.get('notAssociable', false))
      .map((field, fieldId) => fromJS({
        alreadyMapped: existingFields.contains(fieldId),
        displayName: field.getIn(['displayName', 'default']) || field.getIn(['displayName', 'singular']),
        field,
        id: fieldId,
        fieldId,
        kind: fieldTypes.KINDS.PCD_FIELD,
      })).toList();
  }

  /*
   * Retrieve categories
   * Here we handle pcd fields that were filtered out in the block of code above
   * Filter out existing field association from pcdFields
   */
  getCategoryOptions = () => {
    const { existingFields, workflows, provider } = this.props;
    const pcdFields = provider.getIn(['capabilities', 'fields'], Map());

    return workflows.map((categoriesObj, fieldId) => (
      categoriesObj.map((category, categoryId) => {
        const field = pcdFields.get(fieldId);
        const displayName = pcdFields.getIn([fieldId, 'displayName', 'singular']);
        return fromJS({
          alreadyMapped: existingFields.contains(fieldId),
          id: `${fieldId}${categoryId}`,
          category: categoryId,
          displayName: `${displayName} - ${category.get('displayName')}`,
          field,
          kind: fieldTypes.KINDS.PCD_FIELD,
          fieldId,
        });
      })
    )).flatten(1).toList();
  }

  /*
   * Retrieve pcd common destinations
   * Filter out linkBlock if selected on other side
   */
  getCommonOptions = () => {
    const { existingFields, provider } = this.props;
    const commonDestinations = provider.getIn(['capabilities', 'commonDestinations'], Map());
    return commonDestinations.map((field, fieldId) => fromJS({
      alreadyMapped: fieldId !== fieldTypes.DESCRIPTION_FOOTER && existingFields.contains(fieldId),
      displayName: field.get('singular'),
      field,
      id: fieldId,
      kind: fieldTypes.KINDS.PCD_COMMON,
      fieldId,
    })).toList();
  }

  getCustomFieldOptions = () => {
    const { customFields, existingFields } = this.props;
    return customFields.map(field => fromJS({
      alreadyMapped: existingFields.contains(field.get('id')),
      id: field.get('id'),
      displayName: field.get('name'),
      kind: fieldTypes.KINDS.CUSTOM_FIELD,
      field,
      fieldId: field.get('id'),
    }));
  }

  render() {
    const { selectedOption } = this.props;
    const options = this.getOptions();
    const value = selectedOption ? selectedOption.value : '';

    return (
      <div className="new-field-association-field-select">
        <ReactSelect
          clearable={ false }
          inputProps={{ id: `field-association-row-create__field-${value}` }}
          onChange={ this.props.onChange }
          optionRenderer={ this.renderOption }
          options={ options }
          placeholder="Type or select a field..."
          value={ value }
        />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  workflows: getMappingCategories(state, ownProps.containerSide),
  customFields: getCustomFields(state, ownProps.containerSide),
});

export default connect(mapStateToProps)(NewFieldAssociationFieldSelect);



// WEBPACK FOOTER //
// ./src/containers/NewFieldAssociationFieldSelect/NewFieldAssociationFieldSelect.jsx