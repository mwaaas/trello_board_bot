import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import StripeCheckout from 'react-stripe-checkout';
import { Map } from 'immutable';

import {
  Button,
  Icon,
  Modal,
  RadioButton,
  RadioButtonGroup,
  Section,
  Title,
} from '../../components';
import { trackingActions, billingActions } from '../../actions';
import { organizationTypes, routes } from '../../consts';
import './BillingInformation.scss';

class BillingInformation extends Component {
  static propTypes = {
    isPaymentSourceLoading: PropTypes.bool.isRequired,
    paymentSource: PropTypes.instanceOf(Map).isRequired,
    organizationId: PropTypes.string.isRequired,
    onUpdatePaymentSource: PropTypes.func.isRequired,
    stripePublishableKey: PropTypes.string,
  };

  state = {
    isModalOpen: false,
    cancelationFeedback: '',
    willBeBack: null,
  };

  closeModal = () => {
    this.setState({
      isModalOpen: false,
    });
  }

  openModal = () => {
    this.props.trackEvent(
      organizationTypes.EVENTS.USER_CLICKED_CANCEL_SUBSCRIPTION,
    );

    this.setState({
      isModalOpen: true,
      cancelationFeedback: '',
      willBeBack: null,
    });
  }

  changeCard = () => {
    this.props.trackEvent(
      organizationTypes.EVENTS.USER_CLICKED_CHANGE_CARD,
    );
  }

  handleSubmit = () => {
    if (this.state.cancelationFeedback) {
      this.closeModal();
      this.props.cancelSubscription(this.state.cancelationFeedback, this.state.willBeBack);
    }
  }

  onChangeCancelationReason = (event) => {
    this.setState({ cancelationFeedback: event });
  }

  onChangeWillBeBack = (event) => {
    this.setState({ willBeBack: event });
  }

  render() {
    const {
      isPaymentSourceLoading,
      paymentSource,
      onUpdatePaymentSource,
      stripePublishableKey,
    } = this.props;
    const hasPaymentSource = !paymentSource.isEmpty();
    // TODO: Show the billing cycle to the user
    // const planPricePerInterval = currentPlan.get('amount') / 100;
    // const cycleEnd = moment.unix(currentSubscription.get('currentPeriodEnd')).format('MMM Do, YYYY');

    return (
      <div className="billing-information clearfix">
        <Modal
          className="billing-information__cancelation-modal"
          isOpen={ this.state.isModalOpen }
          onRequestClose={ this.closeModal }
          title="We're sorry to see you go!"
          type="plainModal"
        >
          <div>
            <Section>
              <Title type="h4">
                Please let us know why you are canceling your account:
              </Title>
              <RadioButtonGroup
                id="cancelationReason"
                name="cancelationReason"
                value={ this.state.cancelationFeedback }
                onChange={ this.onChangeCancelationReason }
              >
                <RadioButton value="cost" label="Too expensive for value" />
                <RadioButton value="too_difficult" label="Too complicated/time-consuming to use" />
                <RadioButton value="alternative_solution" label="Found an alternative solution" />
                <RadioButton value="champion_leaving" label="Admin left the company" />
                <RadioButton value="missing_functionality" label="Missing functionality" />
                <RadioButton value="dropped_tool" label="No longer using one of the tools" />
                <RadioButton value="project_ended" label="Project ended" />
                <RadioButton value="just_testing" label="I was just testing" />
                <RadioButton value="no_longer_needed" label="My workflow changed, so I no longer need Unito" />
                <RadioButton value="migration" label="Was only using Unito for a migration" />
                <RadioButton value="other" label="I have different feedback" />
              </RadioButtonGroup>
            </Section>

            <Section>
              <Title type="h4">
                Would you like us to save your settings for the future ?
              </Title>
              <RadioButtonGroup
                id="cancelationReason"
                name="cancelationReason"
                value={ this.state.willBeBack }
                onChange={ this.onChangeWillBeBack }
              >
                <RadioButton value={ true } label="Yes, I might come back" />
                <RadioButton value={ false } label="No, I'm done with Unito" />
              </RadioButtonGroup>
            </Section>

            <div className="clearfix">
              <Button
                btnStyle="link"
                disabled={ !this.state.cancelationFeedback || this.state.willBeBack === null }
                onClick={ this.handleSubmit }
                pullRight
                type="submit"
              >
                Confirm Cancelation
              </Button>
              <Button btnStyle="link" onClick={ this.closeModal } pullRight>
                Back
              </Button>
            </div>
          </div>
        </Modal>


        {
          isPaymentSourceLoading && (
            <span>
              <Icon name="circle-o-notch" className="fa-spin" /> Updating card
            </span>
          )
        }
        {
          !isPaymentSourceLoading && hasPaymentSource && (
            <span>
              Card ending with { ' ' }
              <span className="billing-information__card-ending">
                { paymentSource.get('last4') }
              </span>
            </span>
          )
        }
        {
          !isPaymentSourceLoading && !hasPaymentSource && (
            <span className="text-muted">
              No card
            </span>
          )
        }
        <div className="pull-right btn-toolbar">
          <Button
            className="billing-information__cancel"
            btnStyle="subtleLink"
            size="sm"
            onClick={ this.openModal }
          >
            Cancel subscription
          </Button>

          <StripeCheckout
            color="black"
            name="Unito Sync"
            billingAddress
            description="Update credit card"
            image={ routes.IMAGE_PATHS.UNITO_LOGO_COLOR }
            stripeKey={ stripePublishableKey }
            token={ onUpdatePaymentSource }
            panelLabel="Update"
            zipCode
          >
            <Button
              btnStyle="dark"
              size="sm"
              reverse
              onClick={ this.changeCard }
            >
              { hasPaymentSource ? 'Change card' : 'Add card' }
            </Button>
          </StripeCheckout>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  cancelSubscription: (feedback, willBeBack) => {
    dispatch(billingActions.cancelSubscription(ownProps.organizationId, feedback, willBeBack));
  },
  trackEvent: (...params) => {
    dispatch(trackingActions.trackEvent(...params));
  },
});

export default connect(null, mapDispatchToProps)(BillingInformation);



// WEBPACK FOOTER //
// ./src/containers/BillingInformation/BillingInformation.jsx