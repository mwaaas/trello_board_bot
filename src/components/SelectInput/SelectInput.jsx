import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';

import { Select, Tooltip } from '../../components';


export default class SelectInput extends Component {
  static propTypes = {
    className: PropTypes.string,
    input: PropTypes.object.isRequired,
    label: PropTypes.string,
    meta: PropTypes.object,
    options: PropTypes.array.isRequired,
    showError: PropTypes.bool,
  };

  static defaultProps = {
    meta: {},
    showError: true,
  };

  render() {
    const {
      className,
      input,
      label,
      meta,
      showError,
      ...rest
    } = this.props;
    const error = meta.touched && (meta.error || meta.asyncError);
    const classNames = classnames('form-group', { 'has-error': error }, className);

    return (
      <div className="select-input form-group">
        { label && <label htmlFor={ input.name }>{ label }</label> }
        <Select
          {...input}
          {...rest}
          className={ classNames }
          ref="selectField"
        />
        {
          showError && error && (
            <Tooltip placement="top" show={ !!error } target={ this.refs.selectField }>
              { meta.error }
            </Tooltip>
          )
        }
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/SelectInput/SelectInput.jsx