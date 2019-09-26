import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map } from 'immutable';

import { organizationTypes } from '../../consts';
import { Section } from '../../components';
import { OpenIntercomBubble } from '../../containers';
import PlanModal from './PlanModal';


export default class BlockChangePlanModal extends Component {
  static propTypes = {
    currentPlan: PropTypes.instanceOf(Map).isRequired,
    newPlan: PropTypes.instanceOf(Map).isRequired,
    onRequestClose: PropTypes.func.isRequired,
    trackEvent: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { currentPlan, newPlan } = this.props;

    this.props.trackEvent(
      organizationTypes.EVENTS.USER_PLAN_CHANGE_BLOCKED,
      {
        currentPlan: currentPlan.toJS(),
        newPlan: newPlan.toJS(),
      },
    );
  }

  render() {
    const {
      newPlan,
      onRequestClose,
    } = this.props;
    const rejectionReasons = newPlan.get('rejectionReasons');

    return (
      <PlanModal
        isOpen={ true }
        onRequestClose={ onRequestClose }
        title={ <span>Sorry, you can’t pick the <em>{ newPlan.get('nickname') || newPlan.get('name') }</em> plan</span> }
        type="informativeModal"
      >
        <div>
          <Section>
            You're using Unito beyond the limits of that plan. Here's how: <br/>
            {
              rejectionReasons.map((reason, index) => (
                <li key={index}>
                  { reason }
                </li>
              )).toArray()
            }
          </Section>

          <Section>
            Please choose a plan better suited for your usage or reconfigure your syncs to address the list above.
            Have questions about usage or pricing? <OpenIntercomBubble>Get in touch with our team</OpenIntercomBubble>.
          </Section>
        </div>
      </PlanModal>
    );
  }
}



// WEBPACK FOOTER //
// ./src/containers/PricingContainer/BlockChangePlanModal.jsx