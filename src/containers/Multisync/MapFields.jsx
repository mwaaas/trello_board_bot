import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, SubmissionError } from 'redux-form';
import { Redirect, Prompt } from 'react-router';
import { Map } from 'immutable';
import { addNotification as notify } from 'reapop';

import appHistory from '../../app-history';
import {
  Button,
  NavTabs,
  Icon,
  StickyButtonToolbar,
} from '../../components';
import { getFieldValue, getProviderByProviderIdentityId } from '../../reducers';
import { linkActions, multisyncActions } from '../../actions';
import { multisyncTypes, trackingTypes, routes } from '../../consts';
import { formUtils } from '../../utils';

import { GeneralMapping, SyncMapping } from '.';


const tabNames = [
  'General Settings',
  'Settings per Sync',
];

const PAGE_INDEX = 2;

const validate = (values) => {
  const errors = {
    root: {},
    leaves: {},
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

const onSubmit = async (formValues, dispatch, ownProps) => {
  const { isEdit, trackEvent } = ownProps;
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
    appHistory.push({ pathname: routes.ABSOLUTE_PATHS.DASHBOARD });
    return;
  }

  trackEvent(trackingTypes.FORM_ACTIONS.NEXT, PAGE_INDEX, { formValues });
  appHistory.push({ pathname: 'review' });
};

// todo annotation
// @reduxForm({
//   form: 'multisyncForm',
//   destroyOnUnmount: false,
//   forceUnregisterOnUnmount: true,
//   validate,
//   onSubmit,
// })
class MapFields extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    isEdit: PropTypes.bool,
    leavesProvider: PropTypes.instanceOf(Map).isRequired,
    leavesProviderIdentityId: PropTypes.string.isRequired,
    match: PropTypes.object.isRequired,
    rootContainerId: PropTypes.string.isRequired,
    rootProvider: PropTypes.instanceOf(Map).isRequired,
    rootProviderIdentityId: PropTypes.string.isRequired,
    topology: PropTypes.oneOf(Object.values(multisyncTypes.TOPOLOGIES)).isRequired,
    trackEvent: PropTypes.func.isRequired,
  };

  state = {
    activeTab: 0,
    submitHasBeenClicked: false,
  }

  setActiveTab = (index) => {
    this.setState({
      activeTab: index,
    });
  }

  shouldBeRedirected() {
    const {
      rootProviderIdentityId,
      leavesProviderIdentityId,
      rootContainerId,
    } = this.props;

    return !rootProviderIdentityId || !rootContainerId || !leavesProviderIdentityId;
  }

  render() {
    const {
      handleSubmit,
      invalid,
      isEdit,
      leavesProvider,
      leavesProviderIdentityId,
      match,
      pristine,
      rootContainerId,
      rootProvider,
      rootProviderIdentityId,
      submitting,
      topology,
      trackEvent,
    } = this.props;
    const { activeTab } = this.state;

    if (this.shouldBeRedirected()) {
      return <Redirect to={ `${match.url}/choose-projects` } />;
    }

    return (
      <div className="create-mutisync-container__map-fields">
        <form onSubmit={ handleSubmit }>
          {
            !isEdit && (
              <NavTabs
                activeTab={ activeTab }
                onTabClick={ this.setActiveTab }
                tabNames={ tabNames }
                tabStyle="underline"
              />
            )
          }

          {
            activeTab === 0 && (
              <GeneralMapping
                isEdit={ isEdit }
                leavesProvider={ leavesProvider }
                leavesProviderIdentityId={ leavesProviderIdentityId }
                rootProvider={ rootProvider }
                rootProviderIdentityId={ rootProviderIdentityId }
                topology={ topology }
              />
            )
          }

          {
            activeTab === 1 && (
              <SyncMapping
                leafProvider={ leavesProvider }
                leafProviderIdentityId={ leavesProviderIdentityId }
                rootContainerId={ rootContainerId }
                rootProvider={ rootProvider }
                rootProviderIdentityId={ rootProviderIdentityId }
                topology={ topology }
              />
            )
          }

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
              onClick={ (e) => {
                this.setState({ submitHasBeenClicked: true });
                handleSubmit(e);
              } }
              disabled={ submitting || invalid }
              pullRight
              type="button"
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
                  to="choose-projects"
                  onClick={ () => trackEvent(trackingTypes.FORM_ACTIONS.BACK, PAGE_INDEX) }
                >
                  Back
                </Button>
              )
            }
          </StickyButtonToolbar>
        </form>

        <Prompt
          message={ location => location.pathname.includes(`/dashboard/multisyncs/${ isEdit ? 'edit' : 'add'}/`) ? true : 'Discard unsaved changes?' } // eslint-disable-line
          when={ !isEdit || (!pristine && !this.state.submitHasBeenClicked) }
        />
      </div>
    );
  }
}
MapFields = reduxForm({
  form: 'multisyncForm',
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  validate,
  onSubmit,
})(MapFields);
const mapStateToProps = (state) => {
  const rootProviderIdentityId = getFieldValue(state, 'root.providerIdentityId', 'multisyncForm');
  const leavesProviderIdentityId = getFieldValue(state, 'leaves.providerIdentityId', 'multisyncForm');

  return {
    leavesProvider: getProviderByProviderIdentityId(state, leavesProviderIdentityId),
    leavesProviderIdentityId,
    rootContainerId: getFieldValue(state, 'root.containerId', 'multisyncForm'),
    rootProvider: getProviderByProviderIdentityId(state, rootProviderIdentityId),
    rootProviderIdentityId,
    topology: getFieldValue(state, 'topology', 'multisyncForm'),
  };
};

export default connect(mapStateToProps)(MapFields);



// WEBPACK FOOTER //
// ./src/containers/Multisync/MapFields.jsx