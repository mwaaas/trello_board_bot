import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { reduxForm, Field, change } from 'redux-form';
import { connect } from 'react-redux';
import classnames from 'classnames';

import { organizationActions } from '../../actions';
import { Button, Icon } from '../../components';
import { organizationTypes } from '../../consts';
import { formUtils } from '../../utils';


const OrgName = ({
  meta, input, submitting, ...rest
}) => {
  const error = meta.touched && meta.error;
  return (
    <div className={ classnames('input-group', { 'has-error': error }) }>
      { error && <span className="input-group-addon">{ error }</span> }
      <input {...rest} className="form-control" {...input} />
      <div className="input-group-btn">
        <Button type="submit" btnStyle="dark" disabled={ submitting || meta.pristine }>
          {
            !submitting
              ? 'Update'
              : <span>
                Updating <Icon name="circle-o-notch" className="fa-spin" />
              </span>
          }
        </Button>
      </div>
    </div>
  );
};


class EditOrganizationNameForm extends Component {
  static propTypes = {
    currentOrgName: PropTypes.string,
    handleSubmit: PropTypes.func.isRequired,
    organizationId: PropTypes.string,
    resetOrgName: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
  };


  render() {
    const { handleSubmit, submitting } = this.props;

    return (
      <form className="edit-organization-name-form" onSubmit={ handleSubmit }>
        <Field
          component={ OrgName }
          name="orgName"
          ref="input"
          props={{ submitting }}
        />
      </form>
    );
  }
}

EditOrganizationNameForm = reduxForm({
  form: organizationTypes.EDIT_ORG_NAME_FORM,
  enableReinitialize: true,
  validate: (values) => {
    const errors = {};
    if (formUtils.isEmpty(values.orgName)) {
      errors.orgName = 'Required';
    }
    return errors;
  },
})(EditOrganizationNameForm);

const mapStateToProps = (state, { currentOrgName }) => ({
  initialValues: {
    orgName: currentOrgName,
  },
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  resetOrgName: (previousValue) => {
    dispatch(change(organizationTypes.EDIT_ORG_NAME_FORM, 'orgName', previousValue));
  },
  onSubmit: ({ orgName: newOrgName }) =>
    dispatch(organizationActions.patchOrganization(ownProps.organizationId, { name: newOrgName })),
});

export default connect(mapStateToProps, mapDispatchToProps)(EditOrganizationNameForm);



// WEBPACK FOOTER //
// ./src/containers/EditOrganizationNameForm/EditOrganizationNameForm.jsx