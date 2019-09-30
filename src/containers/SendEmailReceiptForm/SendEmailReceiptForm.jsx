import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';

import { trackingActions, organizationActions } from '../../actions';
import { getOrganizationSendEmailReceiptChoice } from '../../reducers';
import { CheckboxField } from '../../components';
import { trackingTypes, organizationTypes } from '../../consts';


class SendEmailReceiptForm extends Component {
  static propTypes = {
    orgniazationId: PropTypes.string,
    handleSubmit: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
  };

  handleChange = (event, newValue, previousValue, fieldName) => {
    const { onSubmit, trackEvent } = this.props;
    trackEvent(trackingTypes.BILLING_EVENTS.ACTION_NAME, {
      action_name: newValue
        ? trackingTypes.BILLING_EVENTS.ACTIONS.ON_SEND_RECEIPT
        : trackingTypes.BILLING_EVENTS.ACTIONS.OFF_SEND_RECEIPT,
    });
    onSubmit({ [fieldName]: newValue });
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
})(SendEmailReceiptForm);

const mapStateToProps = (state, ownProps) => {
  const orgSendEmailReceiptChoice = getOrganizationSendEmailReceiptChoice(state, ownProps.organizationId);
  return {
    initialValues: {
      sendEmailReceipt: orgSendEmailReceiptChoice,
    },
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  onSubmit: async (formValues) => {
    dispatch(organizationActions.patchOrganization(ownProps.organizationId, formValues));
  },
  trackEvent: (...params) =>
    dispatch(trackingActions.trackEvent(...params)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SendEmailReceiptForm);



// WEBPACK FOOTER //
// ./src/containers/SendEmailReceiptForm/SendEmailReceiptForm.jsx