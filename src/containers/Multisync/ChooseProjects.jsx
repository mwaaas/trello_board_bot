import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { addNotification as notify } from 'reapop';
import { Prompt } from 'react-router';
import {
  Field,
  Fields,
  SubmissionError,
  reduxForm,
} from 'redux-form';

import { linkActions, multisyncActions } from '../../actions';
import appHistory from '../../app-history';
import {
  Button,
  StickyButtonToolbar,
  Section,
  Icon,
  TextInput,
} from '../../components';
import { trackingTypes, routes } from '../../consts';
import { getIsSideLocked } from '../../reducers';
import { formUtils } from '../../utils';

import {
  ChooseProjectsSteps,
  FieldWrapper,
  TextWrapper,
} from '.';

const PAGE_INDEX = 1;

const validate = (values) => {
  const errors = {
    root: {},
    leaves: {},
    filters: [],
  };

  const {
    root = {},
    leaves = {},
    topology,
  } = values || {};

  if (formUtils.isEmpty(topology)) {
    errors.topology = 'Required';
  }

  if (formUtils.isEmpty(root.containerId)) {
    errors.root.containerId = 'Required';
  }

  if (formUtils.isEmpty(root.providerIdentityId)) {
    errors.root.providerIdentityId = 'Required';
  }

  if (formUtils.isEmpty(leaves.providerIdentityId)) {
    errors.leaves.providerIdentityId = 'Required';
  }

  if (formUtils.isEmpty(root.filter)) {
    errors.root.filter = 'Required';
  }

  return errors;
};

// todo annotation
// @reduxForm({
//   destroyOnUnmount: false,
//   forceUnregisterOnUnmount: true,
//   form: 'multisyncForm',
//   validate,
// })
class ChooseProjects extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    trackEvent: PropTypes.func.isRequired,
  };

  static defaultProps = {
    isEdit: false,
  };

  state = {
    submitHasBeenClicked: false,
  };

  onSubmit = async (formValues) => {
    const {
      dispatch,
      isEdit,
      trackEvent,
    } = this.props;

    const currentErrors = validate(formValues);
    if (Object.keys(currentErrors.root).length || Object.keys(currentErrors.leaves).length || Object.keys(currentErrors.filters).length) {
      trackEvent(trackingTypes.FORM_ACTIONS.VALIDATION_FAILED, PAGE_INDEX, { errors: currentErrors, formValues });
      return Promise.reject(currentErrors);
    }

    const errors = {
      filters: {},
    };

    try {
      const responses = await dispatch(linkActions.reviewSetupSyncForMultisync(formValues));
      responses.forEach((resp, index) => {
        if (!resp.creatable.value) {
          errors.filters[index] = {
            containerId: resp.creatable.reason,
          };
        }
      });
    } catch (err) {
      trackEvent(trackingTypes.FORM_ACTIONS.VALIDATION_FAILED, PAGE_INDEX, { errors: err, formValues });
      return dispatch(notify({
        title: 'Something went wrong :(',
        ...err,
        position: 'tc',
        closeButton: true,
        status: 'error',
      }));
    }

    if (Object.keys(errors.filters).length) {
      trackEvent(trackingTypes.FORM_ACTIONS.VALIDATION_FAILED, PAGE_INDEX, { errors, formValues });
      throw new SubmissionError(errors);
    }

    if (isEdit) {
      await dispatch(multisyncActions.saveMultisync(formValues));
      trackEvent(trackingTypes.FORM_ACTIONS.SUBMIT, PAGE_INDEX, { formValues });
      this.setState({ submitHasBeenClicked: true }, () => appHistory.push({ pathname: routes.ABSOLUTE_PATHS.DASHBOARD }));
      return;
    }

    trackEvent(trackingTypes.FORM_ACTIONS.NEXT, PAGE_INDEX, { formValues });
    appHistory.push({ pathname: 'map-fields' });
  };

  render() {
    const {
      array,
      handleSubmit,
      invalid,
      isRootLocked,
      submitting,
      trackEvent,
      isEdit,
      pristine,
    } = this.props;

    return (
      <div className="create-mutisync-container__choose-projects">
        <form onSubmit={ handleSubmit(this.onSubmit) }>
          {
            isEdit && (
              <Section>
                <TextWrapper>
                  My Multi-sync name is { ' ' }
                  <FieldWrapper>
                    <Field
                      name="multisyncName"
                      component={ TextInput }
                      placeholder="Enter your Multi-sync name"
                    />
                  </FieldWrapper>
                </TextWrapper>
              </Section>
            )
          }

          <Section>
            <Fields
              names={[
                'leaves.providerIdentityId',
                'root.containerId',
                'root.filter',
                'root.providerIdentityId',
                'topology',
              ]}
              component={ ChooseProjectsSteps }
              isRootLocked={ isRootLocked }
              clearFilters={ () => { array.removeAll('filters'); } }
              isEdit={ isEdit }
            />
          </Section>

          <StickyButtonToolbar>
            <Button
              type="href"
              btnStyle="dark"
              reverse
              to="/dashboard"
              onClick={ () => pristine && trackEvent(trackingTypes.FORM_ACTIONS.CANCEL, PAGE_INDEX) }
            >
              Cancel
            </Button>
            <Button
              onClick={ handleSubmit(this.onSubmit) }
              disabled={ submitting || invalid }
              pullRight
              btnStyle="dark"
            >
              { isEdit ? 'Save ' : 'Next step ' }
              { submitting && <Icon name="circle-o-notch" className="fa-spin" /> }
            </Button>
            {
              !isEdit && (
                <Button
                  pullRight
                  type="href"
                  btnStyle="link"
                  to={ routes.ABSOLUTE_PATHS.USE_CASES }
                  onClick={ () => (
                    pristine
                      ? trackEvent(trackingTypes.FORM_ACTIONS.CANCEL, PAGE_INDEX)
                      : trackEvent(trackingTypes.FORM_ACTIONS.BACK, PAGE_INDEX)
                  ) }
                >
                  Back
                </Button>
              )
            }
          </StickyButtonToolbar>
        </form>

        <Prompt
          message={ location => location.pathname.includes(`/dashboard/multisyncs/${ isEdit ? 'edit' : 'add'}/`) ? true : 'Discard unsaved changes?' } // eslint-disable-line
          when={ !pristine && !this.state.submitHasBeenClicked }
        />
      </div>
    );
  }
}
ChooseProjects = reduxForm({
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  form: 'multisyncForm',
  validate,
})(ChooseProjects);

const mapStateToProps = state => ({
  isRootLocked: getIsSideLocked(state, { containerSide: 'A' }),
});

export default connect(mapStateToProps)(ChooseProjects);



// WEBPACK FOOTER //
// ./src/containers/Multisync/ChooseProjects.jsx