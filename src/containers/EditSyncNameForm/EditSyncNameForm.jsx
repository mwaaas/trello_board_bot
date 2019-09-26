import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';

import { SyncNameInput } from '../../components';
import { formUtils } from '../../utils';


export default class EditSyncNameForm extends Component {
  render() {
    return (
      <Field
        component={ SyncNameInput }
        name="name"
        props={{
          label: 'Sync name',
          maxLength: 75,
        }}
      />
    );
  }
}

EditSyncNameForm = reduxForm({
  form: 'syncForm',
  destroyOnUnmount: false,
  validate: (values) => {
    const errors = {};
    if (formUtils.isEmpty(values.name)) {
      errors.name = 'Required';
    }
    return errors;
  },
})(EditSyncNameForm);



// WEBPACK FOOTER //
// ./src/containers/EditSyncNameForm/EditSyncNameForm.jsx