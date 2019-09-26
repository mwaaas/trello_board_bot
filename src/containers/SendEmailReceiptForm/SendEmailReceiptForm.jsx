import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';

import { organizationActions } from '../../actions';
import { getCurrentSendEmailReceiptChoice } from '../../reducers';
import { CheckboxField } from '../../components';
import { organizationTypes } from '../../consts';


class SendEmailReceiptForm extends Component {
  static propTypes = {
    orgniazationId: PropTypes.string,
    handleSubmit: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
  };

  handleChange = (event, newValue, previousValue, fieldName) => {
    this.props.onSubmit({ [fieldName]: newValue });
  }

  render() {
    const { handleSubmit } = this.props;

    return (
      <form className="send-email-receipt-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <Field
            component={ CheckboxField }
            name="sendEmailReceipt"
            id="send-email-receipt"
            label="Please send me a copy of my receipt by email"
            onChange={this.handleChange}
          >
            Receive an email for my receipt
          </Field>
        </div>
      </form>
    );
  }
}

SendEmailReceiptForm = reduxForm({
  form: organizationTypes.EDIT_ORG_SEND_EMAIL_RECEIPT_FORM,
})(SendEmailReceiptForm)

const mapStateToProps = (state, ownProps) => {
  const currentSendEmailReceiptChoice = getCurrentSendEmailReceiptChoice(state, ownProps.organizationId);
  return {
    initialValues: {
      sendEmailReceipt: currentSendEmailReceiptChoice,
    },
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  onSubmit: async (formValues) => {
    dispatch(organizationActions.patchOrganization(ownProps.organizationId, formValues));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SendEmailReceiptForm);



// WEBPACK FOOTER //
// ./src/containers/SendEmailReceiptForm/SendEmailReceiptForm.jsx