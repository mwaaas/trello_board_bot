import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';


export default class TextAreaInput extends Component {
  static propTypes = {
    className: PropTypes.string,
    helpText: PropTypes.node,
    input: PropTypes.object.isRequired,
    label: PropTypes.node,
    meta: PropTypes.object,
    placeholder: PropTypes.string,
    rows: PropTypes.number,
    subLabel: PropTypes.string,
  };

  static defaultProps = {
    rows: 6,
  };

  render() {
    const {
      className,
      helpText,
      input,
      label,
      meta,
      placeholder,
      rows,
      subLabel,
    } = this.props;
    const classNames = classnames('form-control', className);

    return (
      <div className="form-group">
        { label && <label htmlFor={ input.name }>{ label }</label> }
        { subLabel && <p>{ subLabel }</p> }
        <textarea
          {...input}
          className={classNames}
          rows={rows}
          placeholder={placeholder}
        />
        {
          meta.touched && meta.error && (
            <div className="has-error">
              <div className="help-block">
                {meta.error} {helpText}
              </div>
            </div>
          )
        }
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/TextAreaInput/TextAreaInput.jsx