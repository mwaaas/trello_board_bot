import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map } from 'immutable';

import { organizationTypes } from '../../consts';

import { Section } from '../../components';
import { OpenIntercomBubble } from '../../containers';
import PlanModal from './PlanModal';


export default class BlockIntervalChangePlanModal extends Component {
  static propTypes = {
    currentPlan: PropTypes.instanceOf(Map).isRequired,
    newPlan: PropTypes.instanceOf(Map).isRequired,
    onRequestClose: PropTypes.func.isRequired,
    trackEvent: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.trackEvent(
      organizationTypes.EVENTS.USER_PLAN_CHANGE_BLOCKED,
      {
        currentPlan: this.props.currentPlan.toJS(),
        newPlan: this.props.newPlan.toJS(),
        reason: 'shorterInterval',
      },
    );
  }

  render() {
    const { onRequestClose } = this.props;

    return (
      <PlanModal
        isOpen={ true }
        onRequestClose={ onRequestClose }
        title="Plan change blocked"
        type="informativeModal"
      >
        <div>
          <Section>
            You’re already on a yearly plan, we’ve blocked you from changing to a monthly plan so you don’t pay twice for the same month.
          </Section>
          <Section>
            If you meant to do this, please contact our <OpenIntercomBubble>customer support</OpenIntercomBubble> and we’ll help you out.
          </Section>
        </div>
      </PlanModal>
    );
  }
}



// WEBPACK FOOTER //
// ./src/containers/PricingContainer/BlockIntervalChangePlanModal.jsx