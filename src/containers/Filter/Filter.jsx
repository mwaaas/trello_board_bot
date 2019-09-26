import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { List, Map } from 'immutable';
import { connect } from 'react-redux';
import classnames from 'classnames';

import { fieldTypes } from '../../consts';
import { FieldValuesBoolean, FieldValuesSelect } from '../../containers';
import { getMultisyncDiscriminantId, getProviderDisplayName, getProviderCapabilities } from '../../reducers';
import { formUtils } from '../../utils';


class Filter extends Component {
  static propTypes = {
    containerSide: PropTypes.oneOf(['A', 'B']).isRequired,
    customFieldName: PropTypes.string.isRequired,
    fieldId: PropTypes.string.isRequired,
    fieldValueIdsToExclude: PropTypes.instanceOf(List),
    filter: PropTypes.instanceOf(Map).isRequired,
    input: PropTypes.object.isRequired,
    kind: PropTypes.oneOf(Object.values(fieldTypes.KINDS)),
    multisyncDiscriminantId: PropTypes.string,
    otherProviderDisplayName: PropTypes.string.isRequired,
    otherTermTaskSingular: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['whiteList', 'blackList']).isRequired,
    valueLabels: PropTypes.instanceOf(Map).isRequired,
  };

  static defaultProps = {
    fieldValueIdsToExclude: List(),
  };

  replacePlaceholders = (text = '') => {
    const { customFieldName, otherProviderDisplayName, otherTermTaskSingular } = this.props;

    return text
      .replace(/\${otherProviderName}/g, otherProviderDisplayName)
      .replace(/\${otherTermTaskSingular}/g, otherTermTaskSingular)
      .replace(/\${customFieldName}/g, customFieldName);
  }

  getFieldValueIdsToExclude = () => {
    const { multisyncDiscriminantId, fieldValueIdsToExclude } = this.props;

    if (multisyncDiscriminantId) {
      return fieldValueIdsToExclude.push(multisyncDiscriminantId);
    }

    return fieldValueIdsToExclude;
  }

  render() {
    const {
      containerSide,
      fieldId,
      filter,
      input,
      kind,
      type,
      searchable,
      valueLabels,
    } = this.props;

    const helpText = this.replacePlaceholders(filter.get('help'));
    const isEmpty = formUtils.isEmpty(input.value);
    const label = this.replacePlaceholders(filter.get('label'));

    const labelFalse = valueLabels.get('false');
    const labelTrue = valueLabels.get('true');
    const isBooleanValue = labelFalse && labelTrue;

    const classNames = classnames('form-group', `pcd-filter--${type}`, {
      'select-form-group': !isBooleanValue,
    });

    if (isBooleanValue) {
      return (
        <div className="filter">
          <FieldValuesBoolean
            className={ classNames }
            helpText={ helpText }
            input={ input }
            label={ label }
            labelFalse={ labelFalse }
            labelTrue={ labelTrue }
          />
        </div>
      );
    }

    // /* eslint-disable jsx-a11y/no-autofocus */
    return (
      <div className="filter">
        <FieldValuesSelect
          autoFocus={ isEmpty }
          autoload={ isEmpty }
          className={ classNames }
          containerSide={ containerSide }
          disabledText="Already selected"
          fieldId={ fieldId }
          fieldValueIdsToExclude={ this.getFieldValueIdsToExclude() }
          helpText={ helpText }
          input={ input }
          kind={ kind }
          label={ label }
          multi={ filter.get('multi') }
          openOnFocus={ isEmpty }
          placeholder={ this.replacePlaceholders(filter.get('placeholder')) }
          searchable={ searchable }
        />
      </div>
    );
    // /* eslint-enable jsx-ally/no-autofocus */
  }
}

const mapStateToProps = (state, ownProps) => ({
  otherTermTaskSingular: getProviderCapabilities(state, ownProps, 'terms', true).getIn(['task', 'singular']),
  otherProviderDisplayName: getProviderDisplayName(state, ownProps, true),
  multisyncDiscriminantId: getMultisyncDiscriminantId(state, ownProps),
});

export default connect(mapStateToProps)(Filter);



// WEBPACK FOOTER //
// ./src/containers/Filter/Filter.jsx