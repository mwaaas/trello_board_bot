import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import StripeCheckout from 'react-stripe-checkout';
import { List, Map } from 'immutable';

import { trackingActions } from '../../actions';
import { organizationTypes } from '../../consts';
import {
  Button,
} from '../../components';

import BlockIntervalChangePlanModal from './BlockIntervalChangePlanModal';
import BlockSelectPlanModal from './BlockSelectPlanModal';
import BlockChangePlanModal from './BlockChangePlanModal';
import ConfirmChangePlanModal from './ConfirmChangePlanModal';


class SelectPlanButton extends Component {
  static propTypes = {
    coupon: PropTypes.instanceOf(Map),
    currentPlan: PropTypes.instanceOf(Map).isRequired,
    hasPaymentSource: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired,
    plan: PropTypes.instanceOf(Map).isRequired,
    stripePublishableKey: PropTypes.string,
  };

  state = {
    showModal: false,
  };

  closeConfirmationModal = () => {
    this.setState({ showModal: false });
  }

  onClickSelectPlan = (event) => {
    // The blur has to be forced manually else the button will stay focused once the modal is closed
    event.target.blur();
    this.setState({ showModal: true });
    this.props.trackEvent(
      organizationTypes.EVENTS.USER_CLICKED_SELECT_PLAN,
      { plan: this.props.plan.toJS() },
    );
  }

  handleSelectPlan= (token) => {
    const { plan, onSelect } = this.props;
    onSelect(plan, token);

    this.props.trackEvent(
      organizationTypes.EVENTS.USER_PURCHASED_PLAN,
      { newPlan: plan.toJS() },
    );
  }

  handleChangePlan = () => {
    const { currentPlan, plan, onSelect } = this.props;
    onSelect(plan);

    this.props.trackEvent(
      organizationTypes.EVENTS.USER_CHANGED_PLAN,
      {
        currentPlan: currentPlan.toJS(),
        newPlan: plan.toJS(),
      },
    );
  }

  getConfirmationModal() {
    const {
      currentPlan,
      hasPaymentSource,
      plan,
      trackEvent,
    } = this.props;

    const blockShorterInterval = plan.get('interval') < currentPlan.get('interval');
    const planIsSelectable = plan.get('rejectionReasons', List()).isEmpty();


    // Block on the number of active users only if the user is picking a yearly plan
    if (!hasPaymentSource) {
      if (!planIsSelectable) {
        return (
          <BlockSelectPlanModal
            newPlan={ plan }
            onRequestClose={ this.closeConfirmationModal }
            trackEvent={ trackEvent }
          />
        );
      }

      return null;
    }

    if (blockShorterInterval) {
      return (
        <BlockIntervalChangePlanModal
          currentPlan={ currentPlan }
          newPlan={ plan }
          onRequestClose={ this.closeConfirmationModal }
          trackEvent={ trackEvent }
        />
      );
    }

    if (!planIsSelectable) {
      return (
        <BlockChangePlanModal
          currentPlan={ currentPlan }
          newPlan={ plan }
          onRequestClose={ this.closeConfirmationModal }
          trackEvent={ trackEvent }
        />
      );
    }

    return (
      <ConfirmChangePlanModal
        currentPlan={ currentPlan }
        newPlan={ plan }
        onRequestClose={ this.closeConfirmationModal }
        onSubmit={ this.handleChangePlan }
        trackEvent={ trackEvent }
      />
    );
  }

  getPriceWithDiscount() {
    const { coupon, plan } = this.props;
    const amount = plan.get('amount');

    if (coupon.get('percentOff')) {
      return amount * coupon.get('percentOff') / 100;
    }
    if (coupon.get('amountOff')) {
      return amount - coupon.get('amountOff');
    }
    return amount;
  }

  getDescription() {
    const { coupon } = this.props;
    if (coupon.get('percentOff')) {
      return `${coupon.get('percentOff')}% off coupon applied!`;
    }

    if (coupon.get('amountOff')) {
      return `$${coupon.get('amountOff') / 100} off coupon applied!`;
    }

    return 'Happy Syncing!';
  }

  render() {
    const { plan, hasPaymentSource, stripePublishableKey } = this.props;
    const planIsSelectable = plan.get('rejectionReasons', List()).isEmpty();
    const { showModal } = this.state;
    const showCheckout = !hasPaymentSource && planIsSelectable;

    return (
      <div>
        { showModal && this.getConfirmationModal() }

        <StripeCheckout
          amount={ this.getPriceWithDiscount() }
          billingAddress
          currency={ plan.get('currency', 'usd').toUpperCase() }
          description={ this.getDescription() }
          image="https://unito.io/img/logo-img-322x322-color.png"
          name={ `${(plan.get('nickname') || plan.get('name'))} - ${plan.get('interval')}` }
          panelLabel="Subscribe"
          stripeKey={ stripePublishableKey }
          token={ this.handleSelectPlan }
          zipCode
          disabled={ !showCheckout }
        >
          <Button
            reverse
            onClick={ this.onClickSelectPlan }
          >
            Select Plan
          </Button>
        </StripeCheckout>

      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  trackEvent: (...params) => {
    dispatch(trackingActions.trackEvent(...params));
  },
});

export default connect(null, mapDispatchToProps)(SelectPlanButton);



// WEBPACK FOOTER //
// ./src/containers/PricingContainer/SelectPlanButton.jsx