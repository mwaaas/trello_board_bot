import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Toggle from 'react-toggle';
import styled from 'styled-components';

import { Map } from 'immutable';

import { color } from '../../theme';
import appHistory from '../../app-history';
import { billingActions, trackingActions } from '../../actions';
import { organizationTypes, routes } from '../../consts';
import { PlanDetails } from '../../containers';
import {
  Icon,
  Loading,
  Section,
  Title,
} from '../../components';
import {
  customerHasPaymentSource,
  getActiveCoupon,
  getCurrentPlan,
  getOrganizationCustomerId,
  getOrganizationSubscription,
  getPlansAreLoading,
  getProjectSyncVisiblePlans,
} from '../../reducers';

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

const IntervalContent = styled.div`
  text-align: center;
  margin-top: 16px;
  height: 42px;
`;

const ToggleContainer = styled.div`
  display: inline-flex;
  vertical-align: middle;
`;

const Interval = styled.span`
  font-weight: bold;
  padding: 0 8px;
  vertical-align: middle;
`;

const IntervalInfo = styled.p`
  text-align: center;
`;

const Free = styled.span`
  border-radius: 5px;
  margin: 2px 2px;
  padding: 2px 8px;
  font-size: 11px;
  background-color: ${color.brand.accent};
  color: ${color.light.primary};
  vertical-align: middle;
`;

const FinePrint = styled.div`
  margin-left: 12px;
`;

const INTERVALS = {
  YEAR: 'year',
  MONTH: 'month',
};

class ProjectSyncPricing extends Component {
  static propTypes = {
    coupon: PropTypes.instanceOf(Map),
    currentPlan: PropTypes.instanceOf(Map).isRequired,
    hasPaymentSource: PropTypes.bool.isRequired,
    getPlans: PropTypes.func.isRequired,
    getCustomer: PropTypes.func.isRequired,
    trackEvent: PropTypes.func.isRequired,
    organizationId: PropTypes.string.isRequired,
    orgCustomerId: PropTypes.string.isRequired,
    plans: PropTypes.instanceOf(Map).isRequired,
    plansAreLoading: PropTypes.bool.isRequired,
    stripePublishableKey: PropTypes.string,
    updateSubscription: PropTypes.func.isRequired,
  };

  state = {
    interval: INTERVALS.YEAR,
    isSourceUpdating: false,
  };

  componentDidMount() {
    const { getCustomer, getPlans, orgCustomerId } = this.props;
    getPlans();
    getCustomer(orgCustomerId);
  }

  componentWillReceiveProps(nextProps) {
    const currentPlanIsVisible = !!nextProps.plans.get(nextProps.currentPlan.get('id'));
    if (currentPlanIsVisible) {
      this.setState({ interval: nextProps.currentPlan.get('interval') || INTERVALS.YEAR });
    }
  }

  handleChangeInterval = (event) => {
    const interval = event.target.checked ? INTERVALS.YEAR : INTERVALS.MONTH;

    this.props.trackEvent(
      organizationTypes.EVENTS.USER_CLICKED_BILLING_INTERVAL,
      { interval },
    );
    this.setState({ interval });
  };

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
      coupon,
      currentPlan,
      plans,
      plansAreLoading,
      stripePublishableKey,
      trackEvent,
    } = this.props;
    const { interval, isSourceUpdating } = this.state;

    // Show the loading screen when the plans are being retrieved or when the subscription is updating
    if (plansAreLoading || isSourceUpdating) {
      return <Loading />;
    }

    const intervalPlans = plans.filter(plan => plan.get('interval') === interval);
    let planIdx = 0;

    const warning = interval === 'month'
      ? <span><strong>Monthly plans will be charged automatically every month.</strong></span>
      : <span><strong>Yearly plans are paid upfront once per year,</strong> and cover you for 12 months of syncing.</span>;


    return (
      <Content className="billing-container container">
        <Title type="h1">Pricing | Project Sync</Title>
        <Section className="billing-container__plans">
          <IntervalContent>
            <Interval>
              Pay Monthly
            </Interval>
            <ToggleContainer>
              <Toggle
                checked={ interval === INTERVALS.YEAR }
                icons={ false }
                onChange={ this.handleChangeInterval }
              />
            </ToggleContainer>
            <Interval>
              Pay Yearly
            </Interval>
            <Free>
              2 months free
            </Free>
          </IntervalContent>

          <IntervalInfo>
            <Icon name="credit-card" /> { warning }
          </IntervalInfo>

          <FlexContent>
            {
              intervalPlans.map((plan, planId) => {
                planIdx += 1;
                return (
                  <PlanDetails
                    {...this.props}
                    coupon={ coupon }
                    interval={ interval }
                    isCurrentPlan={ currentPlan.get('id') === planId }
                    key={ planId }
                    nbPlans={ intervalPlans.size }
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
              All prices are in USD. Please note that yearly plans are non-refundable
            </FinePrint>

          </FlexContent>
        </Section>
      </Content>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  trackEvent: (...params) => {
    dispatch(trackingActions.trackEvent(...params));
  },
  updateSubscription: (planId, stripeToken) => {
    const { organizationId } = ownProps.match.params;
    return dispatch(billingActions.updateSubscription(organizationId, planId, stripeToken));
  },
  getCustomer: customerId => dispatch(billingActions.getCustomer(customerId)),
  getPlans: () => dispatch(billingActions.getPlans(ownProps.match.params.organizationId)),
});

const mapStateToProps = (state, ownProps) => {
  const { organizationId } = ownProps.match.params;
  const orgCustomerId = getOrganizationCustomerId(state, organizationId);
  const currentSubscription = getOrganizationSubscription(state, organizationId);

  return {
    currentPlan: getCurrentPlan(state, currentSubscription),
    coupon: getActiveCoupon(state, orgCustomerId, organizationId),
    hasPaymentSource: customerHasPaymentSource(state, orgCustomerId),
    organizationId,
    orgCustomerId,
    plans: getProjectSyncVisiblePlans(state),
    plansAreLoading: getPlansAreLoading(state),
    stripePublishableKey: state.app.get('stripePublishableKey'),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectSyncPricing);



// WEBPACK FOOTER //
// ./src/containers/PricingContainer/ProjectSyncPricing.jsx