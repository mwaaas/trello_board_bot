import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';

import { inviteTypes } from '../../consts';
import { formUtils } from '../../utils';
import { Button } from '../../components';

import './InviteByEmailForm.scss';


export default class InviteByEmailForm extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    invalid: PropTypes.bool.isRequired,
  };

  render() {
    const { handleSubmit, invalid, pristine } = this.props;

    return (
      <form className="invite-by-email-form input-group" onSubmit={ handleSubmit }>
        <Field
          name="email"
          component="input"
          type="email"
          placeholder="Enter email"
          props={{
            className: 'form-control',
            ref: 'input',
          }}
        />
        <div className="input-group-btn">
          <Button
            btnStyle="dark"
            disabled={ invalid || pristine }
            type="submit"
          >
            Invite
          </Button>
        </div>
      </form>
    );
  }
}

InviteByEmailForm = reduxForm({
  form: inviteTypes.INVITE_BY_EMAIL_FORM,
  validate: (values) => {
    const errors = {};
    if (formUtils.isEmpty(values.email)) {
      errors.email = 'Required';
    }
    return errors;
  },
})(InviteByEmailForm)

// WEBPACK FOOTER //
// ./src/containers/InviteByEmailForm/InviteByEmailForm.jsx