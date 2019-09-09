import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { CheckboxText, Tooltip } from '../../components';
import { color } from '../../theme';


export default class CheckboxField extends Component {
  static propTypes = {
    label: PropTypes.node.isRequired,
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
  };

  render() {
    const {
      label, input, meta, ...rest
    } = this.props;
    const error = (meta.error || meta.asyncError) && meta.touched;

    return (
      <CheckboxText
        {...rest}
        {...input}
        ref="checkbox"
        checked={ !!input.value }
        color={ error ? color.brand.error : undefined }
      >
        { label }
        {
          error && (
            <Tooltip placement="top" show={ !!error } target={ this.refs.checkbox.refs.checkbox }>
              { meta.error }
            </Tooltip>
          )
        }
      </CheckboxText>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/CheckboxField/CheckboxField.jsx