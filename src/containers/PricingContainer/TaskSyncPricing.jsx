import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Map } from 'immutable';

import appHistory from '../../app-history';
import { billingActions, trackingActions } from '../../actions';
import { PlanDetails } from '../../containers';
import {
  Button,
  Card,
  Loading,
  Section,
  Title,
} from '../../components';
import { routes } from '../../consts';
import {
  customerHasPaymentSource,
  getActiveCoupon,
  getCurrentPlan,
  getOrganizationCustomerId,
  getOrganizationSubscription,
  getPlansAreLoading,
  getTaskSyncVisiblePlans,
} from '../../reducers';
import { color } from '../../theme';

const Content = styled.div`
  background: white;
  min-height: calc(100vh - 66px);
  padding: 4em 6em;
`;

const FlexContent = styled.div`
  display: flex;
  flex-flow: wrap;
  margin-top: 16px;
`;

const FinePrint = styled.div`
  margin-left: 12px;
`;

const ProjectSyncPricingText = styled.div`
  margin-right: 2rem;
`;

class TaskSyncPricing extends Component {
  static propTypes = {
    coupon: PropTypes.instanceOf(Map),
    currentPlan: PropTypes.instanceOf(Map).isRequired,
    hasPaymentSource: PropTypes.bool.isRequired,
    getPlans: PropTypes.func.isRequired,
    getCustomer: PropTypes.func.isRequired,
    orgCustomerId: PropTypes.string.isRequired,
    organizationId: PropTypes.string.isRequired,
    plans: PropTypes.instanceOf(Map).isRequired,
    plansAreLoading: PropTypes.bool.isRequired,
    stripePublishableKey: PropTypes.string,
    trackEvent: PropTypes.func.isRequired,
    updateSubscription: PropTypes.func.isRequired,
  };

  state = {
    isSourceUpdating: false,
  };

  componentDidMount() {
    const { getPlans, getCustomer, orgCustomerId } = this.props;
    getPlans();
    getCustomer(orgCustomerId);
  }

  onChangeSubscription = async (plan, stripeToken) => {
    const { hasPaymentSource, organizationId } = this.props;
    this.setState({ isSourceUpdating: true });
    try {
      await this.props.updateSubscription(plan.get('id'), hasPaymentSource ? undefined : stripeToken);
      appHistory.replace({ pathname: `${routes.ABSOLUTE_PATHS.BILLING}/${organizationId}/billing` });
    } catch (err) {
      this.setState({ isSourceUpdating: false });
    }
  }

  render() {
    const {
      currentPlan,
      coupon,
      organizationId,
      plans,
      plansAreLoading,
      stripePublishableKey,
      trackEvent,
    } = this.props;
    const { isSourceUpdating } = this.state;

    // Show the loading screen when the plans are being retrieved or when the subscription is updating
    if (plansAreLoading || isSourceUpdating) {
      return <Loading />;
    }

    let planIdx = 0;

    return (
      <Content className="billing-container container">
        <Title type="h1">Pricing | Mirror Power-Up</Title>
        <Section className="billing-container__plans">
          <FlexContent>
            {
              plans.map((plan, planId) => {
                planIdx += 1;
                return (
                  <PlanDetails
                    {...this.props}
                    coupon={ coupon }
                    isCurrentPlan={ currentPlan.get('id') === planId }
                    key={ planId }
                    nbPlans={ plans.size }
                    onSelect={ this.onChangeSubscription }
                    plan={ plan }
                    planIdx={ planIdx }
                    stripePublishableKey={ stripePublishableKey }
                    trackEvent={ trackEvent }
                  />
                );
              }).toArray()
            }
            <FinePrint>
              All prices are in USD.
            </FinePrint>
          </FlexContent>
        </Section>
        <Section style={{ margin: '0 10px' }}>
          <Card borderColor={ color.brand.lightBlue }>
            <div className="media">
              <div className="media-body">
                <Title className="media-heading" type="h3">Project Sync</Title>
                <ProjectSyncPricingText>
                  Did you know Unito doesn’t only sync cards? With Project Sync { ' ' }
                  you can also <strong>connect your favorite project management tools to create seamlessly workflows</strong> across your teams.
                </ProjectSyncPricingText>
              </div>
              <div className="media-right media-middle">
                <Button
                  btnStyle="lightBlue"
                  to={`${routes.ABSOLUTE_PATHS.BILLING}/${organizationId}/pricing/project-sync`}
                  type="href"
                >
                  Discover Project Sync
                </Button>
              </div>
            </div>
          </Card>
        </Section>
      </Content>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  getCustomer: customerId => dispatch(billingActions.getCustomer(customerId)),
  getPlans: () => dispatch(billingActions.getPlans(ownProps.match.params.organizationId)),
  trackEvent: (...params) => {
    dispatch(trackingActions.trackEvent(...params));
  },
  updateSubscription: (planId, stripeToken) => {
    const { organizationId } = ownProps.match.params;
    return dispatch(billingActions.updateSubscription(organizationId, planId, stripeToken));
  },
});

const mapStateToProps = (state, ownProps) => {
  const { organizationId } = ownProps.match.params;
  const orgCustomerId = getOrganizationCustomerId(state, organizationId);
  const currentSubscription = getOrganizationSubscription(state, organizationId);

  return {
    coupon: getActiveCoupon(state, orgCustomerId, organizationId),
    currentPlan: getCurrentPlan(state, currentSubscription),
    hasPaymentSource: customerHasPaymentSource(state, orgCustomerId),
    orgCustomerId,
    organizationId,
    plans: getTaskSyncVisiblePlans(state),
    plansAreLoading: getPlansAreLoading(state),
    stripePublishableKey: state.app.get('stripePublishableKey'),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TaskSyncPricing);



// WEBPACK FOOTER //
// ./src/containers/PricingContainer/TaskSyncPricing.jsx