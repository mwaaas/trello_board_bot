import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';

import { billingActions } from '../../actions';
import { Button, ValidatedInput, Icon } from '../../components';
import { organizationTypes } from '../../consts';
import { getFieldValue } from '../../reducers';


class EditOrganizationBillingEmailForm extends Component {
  static propTypes = {
    currentBillingEmail: PropTypes.string,
    handleSubmit: PropTypes.func.isRequired,
    orgCustomerId: PropTypes.string,
    orgniazationId: PropTypes.string,
    submitting: PropTypes.bool.isRequired,
  };


  render() {
    const { handleSubmit, submitting, isPristine } = this.props;

    return (
      <form className="edit-organization-billing-email-form" onSubmit={ handleSubmit }>
        <div className="input-group">
          <Field
            component={ ValidatedInput }
            name="orgBillingEmail"
            ref="input"
            props={{
              submitting,
              type: 'email',
              name: 'orgBillingEmail',
            }}
          />
          <span className="input-group-btn">
            <Button type="submit" btnStyle="dark" disabled={ submitting || isPristine }>
              {
                !submitting
                  ? 'Update'
                  : <span> Updating <Icon name="circle-o-notch" className="fa-spin" /></span>
              }
            </Button>
          </span>
        </div>
      </form>
    );
  }
}
EditOrganizationBillingEmailForm = reduxForm({
  form: organizationTypes.EDIT_ORG_BILLING_EMAIL_FORM,
  enableReinitialize: true,
})(EditOrganizationBillingEmailForm)

const mapStateToProps = (state, { currentOrgBillingEmail }) => ({
  initialValues: {
    orgBillingEmail: currentOrgBillingEmail,
  },
  isPristine: currentOrgBillingEmail === getFieldValue(state, 'orgBillingEmail', organizationTypes.EDIT_ORG_BILLING_EMAIL_FORM),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onSubmit: async ({ orgBillingEmail: newOrgBillingEmail }) =>
    dispatch(billingActions.editBillingEmail(ownProps.orgCustomerId, newOrgBillingEmail)),
});

export default connect(mapStateToProps, mapDispatchToProps)(EditOrganizationBillingEmailForm);



// WEBPACK FOOTER //
// ./src/containers/EditOrganizationBillingEmailForm/EditOrganizationBillingEmailForm.jsx