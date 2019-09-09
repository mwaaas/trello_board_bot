import React, { Component } from 'react';
import PropTypes from 'prop-types';

const validationStrategy = {
  email: {
    pattern: "^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$", // eslint-disable-line no-useless-escape
    // The email validation regex pattern used here was based on https://github.com/manishsaraan/email-validator
    maxLength: 254,
    minLength: 6,
  },
  password: {
    pattern: '(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}', // eslint-disable-line no-useless-escape
    // Password must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters"
    maxLength: 254,
    minLength: 8,
  },
  text: {
    pattern: '',
    maxLength: 254,
    minLength: 1,
  },
};


export default class ValidatedInput extends Component {
  static propTypes = {
    input: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    className: PropTypes.string,
  };

  static defaultProps = {
    type: 'text',
  };

  render() {
    const {
      input,
      name,
      type,
    } = this.props;

    const { pattern, maxLength, minLength } = validationStrategy[type];
    return (
     <input
       {...input}
       maxLength={ maxLength }
       minLength={ minLength }
       className="form-control"
       name={ name }
       pattern={ pattern }
       required
       type={ type }
     />
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/ValidatedInput/ValidatedInput.jsx