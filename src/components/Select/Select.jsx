/**
 * @module Select
 * A wrapper around the react-select component that works with redux-form
 * All props from react-select can be passed to this component
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import ReactSelect from 'react-select';
import Creatable from 'react-select/creatable';


import './Select.scss';


export default class Select extends Component {
  static propTypes = {
    allowCreate: PropTypes.bool,
    className: PropTypes.string,
    clearable: PropTypes.bool,
    'data-test': PropTypes.string,
    onBlur: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.array.isRequired,
    value: PropTypes.any,
  };

  static defaultProps = {
    clearable: false,
  };

  handleOnBlur = () => {
    const { onBlur, value } = this.props;
    onBlur && onBlur(value);
  };

  render() {
    const {
      allowCreate,
      className,
      clearable,
      name,
      onChange,
      optType,
      options,
      value,
      ...rest
    } = this.props;
    const selectClasses = classnames('select', className);

    if (allowCreate) {
      return (
        <div data-test={ this.props['data-test'] }>
          <Creatable
            {...rest}
            className={ selectClasses }
            closeOnSelect={ !rest.multi }
            inputProps={{ name, id: name }}
            options={ options }
            onBlur={ this.handleOnBlur }
            onChange={ onChange }
            value={ value }
          />
        </div>
      );
    }

    return (
      <div data-test={ this.props['data-test'] }>
        <ReactSelect
          {...rest}
          backspaceRemoves={ rest.multi || (!rest.multi && clearable) }
          className={ selectClasses }
          clearable={ clearable }
          closeOnSelect={ !rest.multi }
          deleteRemoves={ rest.multi || (!rest.multi && clearable) }
          inputProps={{ name, id: name }}
          onBlur={ this.handleOnBlur }
          onChange={(selected) => {
            onChange(selected);
            if (rest.onChanged) {
              rest.onChanged(selected);
            }
          }}
          options={ options }
          value={ value }
        />
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/Select/Select.jsx