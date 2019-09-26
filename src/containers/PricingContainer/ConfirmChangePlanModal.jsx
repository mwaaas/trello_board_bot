import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map } from 'immutable';

import { Section } from '../../components';
import PlanModal from './PlanModal';


export default class ConfirmChangePlanModal extends Component {
  static propTypes = {
    currentPlan: PropTypes.instanceOf(Map).isRequired,
    newPlan: PropTypes.instanceOf(Map).isRequired,
    onRequestClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    trackEvent: PropTypes.func.isRequired,
  };

  render() {
    const {
      currentPlan,
      newPlan,
      onRequestClose,
      onSubmit,
    } = this.props;

    const newAmount = newPlan.get('amount');
    const currentAmount = currentPlan.get('amount');

    return (
      <PlanModal
        cancelLabel="Back"
        isOpen={ true }
        onCancel={ onRequestClose }
        onConfirm={ onSubmit }
        onRequestClose={ onRequestClose }
        title="Confirm plan change"
      >
        <Section>
          You will be {currentAmount < newAmount ? 'upgraded' : 'downgraded'} to the { ' ' }
          <strong>{ newPlan.get('nickname') || newPlan.get('name') }</strong> plan.
          <br />
          You will be charged immediately and see the price change on your next invoice.
        </Section>
      </PlanModal>
    );
  }
}



// WEBPACK FOOTER //
// ./src/containers/PricingContainer/ConfirmChangePlanModal.jsx