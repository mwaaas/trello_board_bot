import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  change,
  Field,
  Fields,
  FormSection,
  reduxForm,
} from 'redux-form';
import { connect } from 'react-redux';
import { addNotification as notify } from 'reapop';

import { containerActions, linkActions } from '../../actions';
import {
  Button,
  Card,
  Icon,
  Section,
  StickyButtonToolbar,
  Subheading,
  Title,
  ToggleFormInput,
} from '../../components';
import {
  ChooseSyncDirection,
  ContainerConfiguration,
  ContainersSync,
  FeatureFlag,
  FeatureFlagVariant,
  GiveSyncName,
} from '../../containers';
import { getClientVersion, getIsReviewingLink, getToken } from '../../reducers';
import { formUtils } from '../../utils';
import { color } from '../../theme';
import { linkTypes, routes } from '../../consts';
import './AppsSyncForm.scss';


const validate = (values) => {
  const errors = { A: {}, B: {} };
  const { name } = values;
  ['A', 'B'].forEach((containerSide) => {
    const sideValues = values[containerSide] || {};
    const {
      providerId, providerIdentityId, containerId, existingContainer,
    } = sideValues;
    if (formUtils.isEmpty(providerId)) {
      errors[containerSide].providerId = 'Required';
    }

    if (formUtils.isEmpty(providerIdentityId)) {
      errors[containerSide].providerIdentityId = 'Required';
    }

    if (existingContainer && formUtils.isEmpty(containerId)) {
      errors[containerSide].containerId = 'Required';
    }

    if (!existingContainer) {
      const { workspaceId, newContainerName } = sideValues;
      if (formUtils.isEmpty(workspaceId)) {
        errors[containerSide].workspaceId = 'Required';
      }

      if (formUtils.isEmpty(newContainerName)) {
        errors[containerSide].newContainerName = 'Required';
      }
    }
  });

  if (formUtils.isEmpty(name)) {
    errors.name = 'Required';
  }

  return errors;
};

const asyncValidate = async (values, dispatch, ownProps) => {
  if (ownProps.isEdit) {
    return Promise.resolve();
  }

  const errors = validate(values);
  if (Object.keys(errors.A).length || Object.keys(errors.B).length) {
    return Promise.reject(errors);
  }

  let response;
  try {
    response = await dispatch(linkActions.reviewSetupSync(values));
  } catch (err) {
    dispatch(notify({
      title: 'Something went wrong :(',
      ...err,
      position: 'tc',
      closeButton: true,
    }));
  }

  // We want to make sure 2 existing containers are not already synced together
  if (!response.creatable.value) {
    return Promise.reject({
      B: {
        containerId: response.creatable.reason,
      },
    });
  }

  // Create the new containers once the review succeeds
  const createContainerPayload = {
    A: {
      ...values.A,
      containerId: values.A.containerId || values.A.workspaceId,
      existingContainer: !!values.A.containerId,
    },
    B: {
      ...values.B,
      containerId: values.B.containerId || values.B.workspaceId,
      existingContainer: !!values.B.containerId,
    },
  };

  const containerErrors = {};
  for (const side of ['A', 'B']) {
    if (!values[side].existingContainer) {
      try {
        const { container } = await dispatch(containerActions.createContainer(createContainerPayload, side)); // eslint-disable-line
        dispatch(change('syncForm', `${side}.containerId`, container.id));
        dispatch(change('syncForm', `${side}.existingContainer`, true));
      } catch (err) {
        containerErrors[side] = { newContainerName: `Could not be created. ${err.reason || ''}` };
      }
    }
  }

  if (Object.keys(containerErrors).length) {
    return Promise.reject(containerErrors);
  }

  return Promise.resolve();
};


class AppsSyncForm extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    linkIsBeingReviewed: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    isEdit: PropTypes.bool,
  };

  static defaultProps = {
    isEdit: false,
  };

  componentWillMount() {
    if (!this.props.isEdit) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    const {
      asyncValidating,
      handleSubmit,
      isEdit,
      linkIsBeingReviewed,
      linkKind,
      onCancel,
    } = this.props;

    return (
      <div className="apps-sync-form">
        {
          isEdit ? (
            <Section>
              <Title type="h2">
                Projects synced
              </Title>
            </Section>
          ) : (
            <Title type="h2">
              Choose what to sync
            </Title>
          )
        }
        {
          !isEdit && (
            <Subheading>
              Select or create your projects to get started
            </Subheading>
          )
        }
        <form onSubmit={ handleSubmit }>

          {
            isEdit
            && <Section>
              <ContainersSync isEdit />
            </Section>
          }

          <Section>
            <div className="row">
              <div className="col-xs-6">
                <Card borderless color={ color.dark.quiet }>
                  <FormSection name="A">
                    <ContainerConfiguration
                      containerSide="A"
                      isEdit={ isEdit }
                    />
                  </FormSection>
                </Card>
              </div>

              <div className="col-xs-6">
                <Card borderless color={ color.dark.quiet }>
                  <FormSection name="B">
                    <ContainerConfiguration
                      containerSide="B"
                      isEdit={ isEdit }
                    />
                  </FormSection>
                </Card>
              </div>
            </div>
          </Section>

          {

            linkKind !== linkTypes.KIND.TASK_SYNC && (
              <Section>
                <Card borderless color={ color.dark.quiet }>
                  <Fields
                    component={ ChooseSyncDirection }
                    isEdit={ isEdit }
                    names={ ['A.readOnly', 'B.readOnly'] }
                  />
                </Card>
              </Section>
            )
          }

          {
            linkKind !== linkTypes.KIND.TASK_SYNC && (
              <Section>
                <Card borderless color={ color.dark.quiet }>
                  <div className="row">
                    <div className="col-xs-6 col-xs-offset-3">
                      <Title type="h3" className="text-center">
                        Auto sync
                      </Title>
                      <Field
                        component={ ToggleFormInput }
                        name="isAutoSync"
                        props={{ label: 'Information will be automatically synced', defaultValue: !isEdit }}
                      />
                    </div>
                  </div>
                </Card>
              </Section>
            )
          }

          {
            !isEdit && (
              <Section className="text-center hide">
                <hr />
                <div className="row">
                  <div className="col-xs-6 col-xs-offset-3">
                    <Field component={ GiveSyncName } name="name" />
                  </div>
                </div>
              </Section>
            )
          }

          <StickyButtonToolbar>
            <Button
              btnStyle="dark"
              onClick={ onCancel }
              pullLeft
              reverse
            >
              Cancel
            </Button>
            <Button
              btnStyle={ isEdit ? 'primary' : 'dark' }
              disabled={ linkIsBeingReviewed || asyncValidating }
              onClick={ handleSubmit }
              pullRight
            >
              { isEdit ? 'Save and sync' : 'Next' } { ' ' }
              { (linkIsBeingReviewed || asyncValidating) && <Icon name="circle-o-notch" className="fa-spin" /> }
            </Button>

            <FeatureFlag name="sync-wizard">
              <FeatureFlagVariant value={ true }>
                <Button
                  pullRight
                  type="href"
                  btnStyle="link"
                  to={ routes.ABSOLUTE_PATHS.USE_CASES }
                  onClick={ this.handleOnClick }
                >
                  Back
                </Button>
              </FeatureFlagVariant>
            </FeatureFlag>
          </StickyButtonToolbar>
        </form>
      </div>
    );
  }
}
AppsSyncForm = reduxForm({
  form: 'syncForm',
  asyncBlurFields: [],
  asyncValidate,
  destroyOnUnmount: false,
  validate,
})(AppsSyncForm)
const mapStateToProps = state => ({
  linkIsBeingReviewed: getIsReviewingLink(state),
  token: getToken(state),
  clientVersion: getClientVersion(state),
});

export default connect(mapStateToProps)(AppsSyncForm);



// WEBPACK FOOTER //
// ./src/containers/AppsSyncForm/AppsSyncForm.jsx