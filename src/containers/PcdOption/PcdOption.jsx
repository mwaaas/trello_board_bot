import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';

import { fieldTypes } from '../../consts';
import { ToggleFormInput } from '../../components';
import { FieldValuesSelect, TaskNumberPrefixInput } from '../../containers';
import {
  getOtherSideContainerFieldValue,
  getProviderCapabilities,
} from '../../reducers';
import './PcdOption.scss';


class PcdOption extends Component {
  static propTypes = {
    containerSide: PropTypes.oneOf(['A', 'B']).isRequired,
    option: PropTypes.instanceOf(Map).isRequired,
    otherProviderDisplayName: PropTypes.string.isRequired,
    sideTerms: PropTypes.instanceOf(Map).isRequired,
    otherSideTerms: PropTypes.instanceOf(Map).isRequired,
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
  };

  replaceOtherProviderName = (text = '') => text
    .replace(/\${termTaskSingular}/g, this.props.sideTerms.getIn(['task', 'singular']))
    .replace(/\${otherProviderName}/g, this.props.otherProviderDisplayName)
    .replace(/\${otherTermTaskSingular}/g, this.props.otherSideTerms.getIn(['task', 'singular']))

  render() {
    const {
      input, meta, containerSide, option,
    } = this.props;
    const inputTypes = {
      checkbox: ToggleFormInput,
      select: FieldValuesSelect,
      taskNumberPrefixInput: TaskNumberPrefixInput,
    };
    const InputType = inputTypes[option.get('type')];

    if (!InputType) {
      return null;
    }

    const label = this.replaceOtherProviderName(option.get('label'));
    const helpText = this.replaceOtherProviderName(option.get('help'));
    const placeholder = this.replaceOtherProviderName(option.get('placeholder'));

    return (
      <InputType
        className="pcd-option"
        containerSide={ containerSide }
        fieldId={ option.get('field') }
        helpText={ helpText }
        input={ input }
        kind={ fieldTypes.KINDS.PCD_FIELD }
        label={ label }
        meta={ meta }
        pcdOption={ option }
        placeholder={ placeholder }
      />
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const otherProviderId = getOtherSideContainerFieldValue(state, ownProps, 'providerId');

  return {
    otherProviderDisplayName: state.providers.getIn(
      ['entities', otherProviderId, 'displayName'],
      '',
    ),
    otherSideTerms: getProviderCapabilities(state, ownProps, 'terms', true),
    sideTerms: getProviderCapabilities(state, ownProps, 'terms', false),
  };
};

export default connect(mapStateToProps)(PcdOption);



// WEBPACK FOOTER //
// ./src/containers/PcdOption/PcdOption.jsx