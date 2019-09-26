import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { reduxForm } from 'redux-form';

import { trackingTypes } from '../../consts';
import { linkActions } from '../../actions';
import {
  Button,
  Card,
  Section,
  StickyButtonToolbar,
  Title,
} from '../../components';
import { ContainersSync } from '../../containers';
import Trackable from '../../components/TrackableHoC/TrackableHoC';
import {
  getContainerFieldValue,
  getProviderCapabilities,
  getProvider,
  isSavingSync,
} from '../../reducers';
import { color, fontWeight } from '../../theme';
import './ReviewSyncForm.scss';


const ExistingContainerLabel = styled.small`
  font-weight: ${fontWeight.medium};
  text-transform: uppercase;
`;


class ReviewSyncForm extends Component {
  static propTypes = {
    createLinkSessionId: PropTypes.string.isRequired,
    existingContainerA: PropTypes.bool.isRequired,
    existingContainerB: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    savingSync: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onPrevious: PropTypes.func.isRequired,
    providerA: PropTypes.instanceOf(Map).isRequired,
    providerB: PropTypes.instanceOf(Map).isRequired,
    termsA: PropTypes.instanceOf(Map).isRequired,
    termsB: PropTypes.instanceOf(Map).isRequired,
  };

  componentWillMount() {
    window.scrollTo(0, 0);
  }

  handleCustomize = (forceCustomize = false) => (values) => {
    const { addSync, createLinkSessionId, trackAddSyncSteps } = this.props;
    const formData = { ...values, customizing: forceCustomize };
    trackAddSyncSteps(trackingTypes.FORM_ACTIONS.SUBMIT, 3, createLinkSessionId);
    addSync(formData);
  }

  getContainerLabel = (containerSide) => {
    const isNewContainer = !this.props[`existingContainer${containerSide}`];
    const terms = this.props[`terms${containerSide}`];
    const containerType = terms.getIn(['container', 'singular']);

    return (
      <ExistingContainerLabel>
        { isNewContainer ? `A new ${containerType} named` : `An existing ${containerType}` }
      </ExistingContainerLabel>
    );
  }

  render() {
    const {
      handleSubmit,
      savingSync,
      onCancel,
      onPrevious,
      providerA,
      providerB,
    } = this.props;

    if (providerA.isEmpty() || providerB.isEmpty()) {
      return null;
    }

    return (
      <div className="review-sync-container">
        <Title type="h2">Review your sync</Title>

        <form onSubmit={ handleSubmit } className="review-sync-form">
          <Section className="text-center">
            <Title type="h3">
              You are about to create a sync between
            </Title>
            <Card borderless color={ color.dark.quiet }>
              <div className="row" style={{ marginBottom: '8px' }}>
                <div className="col-xs-6">
                  { this.getContainerLabel('A') }
                </div>
                <div className="col-xs-6">
                  { this.getContainerLabel('B') }
                </div>
              </div>
              <ContainersSync />
            </Card>
          </Section>

          <Section className="row text-center">
            <div className="col-xs-8 col-xs-offset-2">
              <Title type="h3">
                Do you want to review which fields are syncing?
              </Title>
              <Card borderless color={ color.dark.quiet }>
                Most common fields are automatically matched up and synchronized.{ ' ' }
                You can customize these default settings now or at a later time.
                <div className="review-sync-form__customize-sync-btn">
                  <Button
                    btnStyle="dark"
                    onClick={ handleSubmit(this.handleCustomize(true)) }
                    disabled={ savingSync }
                  >
                    { savingSync ? 'Setting up your sync...' : 'Customize sync' }
                  </Button>
                </div>
              </Card>
            </div>
          </Section>


          <Section className="row text-center">
            <div className="col-xs-8 col-xs-offset-2">
              <Title type="h3">
                About the first sync
              </Title>
              <Card borderless color={ color.dark.quiet }>
                A first sync will start automatically and might take up to an hour for large projects.{ ' ' }
                Thereafter, we'll sync up at the speed indicated on your subscribed plan.
              </Card>
            </div>
          </Section>

          <StickyButtonToolbar>
            <Button
              btnStyle="primary"
              pullRight
              disabled={ savingSync }
              onClick={ handleSubmit(this.handleCustomize(false)) }
            >
              { savingSync ? 'Creating your sync...' : 'Create sync' }
            </Button>

            <Button
              btnStyle="dark"
              pullLeft
              reverse
              onClick={ onCancel }
            >
              Cancel
            </Button>

            <Button
              btnStyle="link"
              pullRight
              onClick={ onPrevious }
            >
              Back
            </Button>
          </StickyButtonToolbar>
        </form>
      </div>
    );
  }
}

ReviewSyncForm = reduxForm({
  form: 'syncForm',
  destroyOnUnmount: false,
})(ReviewSyncForm);

ReviewSyncForm = Trackable(ReviewSyncForm, 'review');

const mapStateToProps = state => ({
  existingContainerA: !!getContainerFieldValue(state, { containerSide: 'A' }, 'existingContainer'),
  existingContainerB: !!getContainerFieldValue(state, { containerSide: 'B' }, 'existingContainer'),
  savingSync: isSavingSync(state),
  providerA: getProvider(state, { containerSide: 'A' }),
  providerB: getProvider(state, { containerSide: 'B' }),
  termsA: getProviderCapabilities(state, { containerSide: 'A' }, 'terms'),
  termsB: getProviderCapabilities(state, { containerSide: 'B' }, 'terms'),
});

const mapDispatchToProps = dispatch => ({
  addSync: (formData) => {
    dispatch(linkActions.addLink(formData));
  },
  trackAddSyncSteps: (tabIndex, action, createLinkSessionId) => {
    dispatch(linkActions.trackAddSyncSteps(tabIndex, action, createLinkSessionId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ReviewSyncForm);



// WEBPACK FOOTER //
// ./src/containers/ReviewSyncForm/ReviewSyncForm.jsx