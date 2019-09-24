import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { List, Map } from 'immutable';

import Select, { Async } from 'react-select';
import styled from 'styled-components';
import classnames from 'classnames';
import debounce from 'lodash.debounce';

import { fieldActions } from '../../actions';
import { TextSelectOption } from '../../components';
import { fieldTypes } from '../../consts';
import { getField } from '../../reducers';
import { fontWeight } from '../../theme';
import { formUtils } from '../../utils';


const Label = styled.label`
  font-weight: ${fontWeight.medium};
  margin-bottom: .5rem;
`;


class FieldValuesSelect extends Component {
  static propTypes = {
    autoFocus: PropTypes.bool,
    autoload: PropTypes.bool,
    category: PropTypes.string,
    className: PropTypes.string,
    containerId: PropTypes.string,
    containerSide: PropTypes.oneOf(['A', 'B']).isRequired,
    disabled: PropTypes.bool,
    disabledText: PropTypes.string,
    fetchFieldValues: PropTypes.func.isRequired,
    field: PropTypes.instanceOf(Map).isRequired,
    fieldId: PropTypes.string.isRequired,
    fieldValueIdsToExclude: PropTypes.instanceOf(List),
    helpText: PropTypes.string,
    input: PropTypes.object,
    kind: PropTypes.oneOf(Object.values(fieldTypes.KINDS)),
    label: PropTypes.string,
    multi: PropTypes.bool,
    onChange: PropTypes.func,
    openOnFocus: PropTypes.bool,
    pcdOption: PropTypes.instanceOf(Map),
    placeholder: PropTypes.string,
    providerIdentityId: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  };

  static defaultProps = {
    autoload: false,
    clearable: false,
    disabled: false,
    fieldValueIdsToExclude: List(),
    multi: false,
    openOnFocus: false,
  };

  state = {
    defaultOptions: false,
    fieldValues: false,
    isLoading: false,
  };

  componentDidMount() {
    if (this.requiresInitialFetch()) {
      this.fetchInitialFieldValues();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.fieldId !== prevProps.fieldId) {
      this.setState({ fieldValues: false });
    }
  }

  requiresInitialFetch() {
    const { field } = this.props;
    const value = this.getValue();
    return !field.get('searchable') && !formUtils.isEmpty(value);
  }

  getOptions = (fieldValues) => {
    if (!fieldValues) {
      return [];
    }

    const options = fieldValues.map(this.buildOption);
    return options.sort((a, b) => a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase()));
  }

  buildOption = (fieldValue) => {
    const {
      disabledText,
      fieldId,
      fieldValueIdsToExclude,
      kind,
    } = this.props;

    return {
      ...fieldValue,
      disabled: fieldValueIdsToExclude.includes(fieldValue.id) || fieldValue.isHidden,
      disabledText: fieldValue.isHidden ? 'Archived' : disabledText,
      fieldId,
      kind,
    };
  };

  // To prevent bug: https://github.com/JedWatson/react-select/issues/1274
  promptTextCreator = label => `${label}`;

  renderValue = ({
    color,
    disabled,
    iconUrl,
    displayName,
    emails = [], // Users might not have a displayName, show their email instead
  }) => (
    <TextSelectOption
      disabled={ disabled }
      color={ color }
      iconUrl={ iconUrl }
      maxTextLength={ 24 }
      disabledText=""
    >
      { displayName || emails[0] }
    </TextSelectOption>
  );

  renderOption = ({
    color,
    disabled,
    disabledText,
    iconUrl,
    displayName,
    emails = [], // Users might not have a displayName, show their email instead
  }) => (
    <TextSelectOption
      disabled={ disabled }
      color={ color }
      iconUrl={ iconUrl }
      maxTextLength={ 24 }
      disabledText={ disabledText }
    >
      { displayName || emails[0] }
    </TextSelectOption>
  );

  /*
   * Don't transform to async await or Promise return
   * For an unknown reason the debounce method with the loadOptions and
   * a promise return don't play well together and the options aren't display
   * in the select even if they are there...
   */
  searchFieldValues = (searchString, callback) => {
    const { fetchFieldValues } = this.props;
    if (!searchString) {
      return callback(null, { options: this.state.defaultOptions });
    }

    fetchFieldValues(searchString).then(({ fieldValues }) => {
      const options = this.getOptions(fieldValues);
      return callback(null, { options });
    });
  }

  fetchInitialSearchableFieldValues = (search, callback) => {
    const { fetchFieldValue, multi } = this.props;
    const value = this.getValue();
    if (formUtils.isEmpty(value)) {
      return callback(null, { options: this.state.defaultOptions });
    }

    const inputValues = Array.isArray(value) ? value : [value];
    Promise.all(inputValues.map(fieldValue => fetchFieldValue(fieldValue.id || fieldValue))).then((responses) => {
      // Overwrite the initial displayNames that are the ids, with the real displayName of the
      // field values fetched from the backend. Don't remove or overwrite field values that no longer exist
      // on the projects, so that we are able to see that they disappeared (will show as: <my id> * in input value)
      const defaultValues = responses.map((r, index) => ({ ...inputValues[index], ...r.fieldValue }));
      const defaultOptions = this.getOptions(defaultValues);
      this.handleOnChange(multi ? defaultOptions : defaultOptions[0]);
      this.setState({ defaultOptions });
      return callback(null, { options: defaultOptions });
    });
  }

  debouncedFetchFieldValues = debounce(this.searchFieldValues, 500);

  fetchInitialFieldValues = async () => {
    this.setState({ isLoading: true });
    const { fieldValues } = await this.props.fetchFieldValues();
    this.setState({ fieldValues, isLoading: false });

    // On initial load, the selected values aren't complete objects
    // So reconstruct the selected values and trigger an onChange
    // to propertly display the selected values
    const { multi } = this.props;
    const value = this.getValue();
    if (formUtils.isEmpty(value)) {
      return;
    }

    if (multi) {
      const inputValues = !(typeof value === 'string') ? value || [] : [value];
      const selectedOptions = inputValues.map((opt) => {
        const fieldValue = fieldValues.find(fv => fv.id === opt.id) || opt;
        return this.buildOption(fieldValue);
      });
      this.handleOnChange(selectedOptions);
    }
  }

  handleOnChange = (value) => {
    const {
      input,
      onChange,
    } = this.props;

    input && input.onChange(value);
    onChange && onChange(value);
  }

  getValue = () => {
    const { input, value } = this.props;
    return (input && input.value) || value;
  }

  render() {
    const {
      autoFocus,
      autoload,
      className,
      clearable,
      disabled,
      field,
      helpText,
      input,
      label,
      multi,
      openOnFocus,
      placeholder,
      ...rest
    } = this.props;

    const { fieldValues, defaultOptions } = this.state;
    const classNames = classnames('field-values-select', className);
    const inputProps = input || {};
    const fieldDisplayNameSingular = field.getIn(['displayName', 'singular'], '');
    const fieldDisplayNamePlural = field.getIn(['displayName', 'plural'], '');
    const currentValue = this.getValue();

    const props = {
      autoload,
      autoFocus,
      clearable,
      disabled,
      labelKey: 'displayName',
      valueKey: 'id',
      inputProps: { name: inputProps.name, id: inputProps.name },
      multi,
      noResultsText: `No ${fieldDisplayNamePlural} found`,
      onChange: this.handleOnChange,
      optionRenderer: this.renderOption,
      placeholder: placeholder || `Select your ${rest.multi ? fieldDisplayNamePlural : fieldDisplayNameSingular}...`,
      searchPromptText: `Type your ${fieldDisplayNameSingular} name to search...`,
      simpleValue: false,
      value: currentValue,
      valueRenderer: this.renderValue,
    };

    const needsFetch = !fieldValues && !defaultOptions && !formUtils.isEmpty(currentValue);
    return (
      <div className={ classNames }>
        {
          label && (
            <Label htmlFor={ input.name }>
              { label }
            </Label>
          )
        }

        {
          field.get('searchable') ? (
            <Async
              {...props}
              autoload={ needsFetch }
              loadOptions={ needsFetch ? this.fetchInitialSearchableFieldValues : this.debouncedFetchFieldValues }
            />
          ) : (
            <Select
              {...props}
              isLoading={ this.state.isLoading }
              onOpen={ this.fetchInitialFieldValues }
              openOnFocus
              options={ this.getOptions(this.state.fieldValues) }
            />
          )
        }

        {
          helpText && (
            <div className="help-block">
              { helpText }
            </div>
          )
        }
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  field: getField(state, ownProps),
});

const mapDispatchToProps = (dispatch, {
  category,
  containerId,
  containerSide,
  fieldId,
  kind,
  providerIdentityId,
}) => ({
  fetchFieldValue: fieldValueId =>
    dispatch(fieldActions.fetchFieldValue({
      containerId,
      containerSide,
      fieldId,
      fieldValueId,
      kind,
      providerIdentityId,
    })),
  fetchFieldValues: searchString =>
    dispatch(fieldActions.fetchFieldValues({
      category,
      containerId,
      containerSide,
      fieldId,
      kind,
      providerIdentityId,
      searchString,
    })),
});

export default connect(mapStateToProps, mapDispatchToProps)(FieldValuesSelect);



// WEBPACK FOOTER //
// ./src/containers/FieldValuesSelect/FieldValuesSelect.jsx