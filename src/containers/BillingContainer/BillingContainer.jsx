import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import styled from 'styled-components';

import { billingActions, organizationActions } from '../../actions';
import {
  customerHasPaymentSource,
  getActiveCoupon,
  getCollaboratorsStatsByOrgId,
  getCustomerById,
  getCustomerDefaultPaymentSource,
  getCustomerInvoices,
  getEmbedName,
  getFeatureFlagValue,
  getOrganizationBillingEmail,
  getOrganizationCustomerId,
  getOrganizationName,
  getOrganizationSubscription,
  getPlansAreLoading,
  getIsCurrentPlanTaskSync,
  getVisiblePlans,
  organizationHasActiveSubscription,
} from '../../reducers';
import {
  Button,
  Card,
  CollaboratorListItem,
  CouponInfo,
  Href,
  IconHoverTooltip,
  InvoiceListItem,
  Loading,
  Section,
  Title,
} from '../../components';
import {
  AddCouponForm,
  BillingInformation,
  EditOrganizationBillingEmailForm,
  SendEmailReceiptForm,
  UsageContainerProjectSync,
  UsageContainerTaskSync,
} from '../../containers';
import { appTypes } from '../../consts';
import { color } from '../../theme';


const Content = styled.div`
  background: white;
  min-height: calc(100vh - 66px);
  padding: 4em 6em;
`;

const Description = styled.div`
  margin-bottom: 1rem;
`;

const SendEmailCheckboxWrapper = styled.div`
  margin-top: 1rem;
`;

const MAX_COLLABORATORS_TO_SHOW = 8;


class BillingContainer extends Component {
  static propTypes = {
    collaboratorsStats: PropTypes.instanceOf(Map).isRequired,
    coupon: PropTypes.instanceOf(Map),
    currentSubscription: PropTypes.instanceOf(Map).isRequired,
    customer: PropTypes.instanceOf(Map).isRequired,
    customerPaymentSource: PropTypes.instanceOf(Map).isRequired,
    excludeCollaborator: PropTypes.func.isRequired,
    getCustomerInvoices: PropTypes.func.isRequired,
    hasActiveSubscription: PropTypes.bool.isRequired,
    hasPaymentSource: PropTypes.bool.isRequired,
    hideTaskSync: PropTypes.bool.isRequired,
    isCurrentPlanTaskSync: PropTypes.bool.isRequired,
    isProfitwellFlagOn: PropTypes.bool.isRequired,
    includeCollaborator: PropTypes.func.isRequired,
    invoices: PropTypes.instanceOf(Map).isRequired,
    match: PropTypes.object.isRequired,
    organizationId: PropTypes.string,
    orgCustomerId: PropTypes.string,
    plans: PropTypes.instanceOf(Map).isRequired,
    plansAreLoading: PropTypes.bool.isRequired,
    stripePublishableKey: PropTypes.string,
    profitwellAuthToken: PropTypes.string,
    updateSubscription: PropTypes.func.isRequired,
  };

  state = {
    isSourceUpdating: false,
    showAllCollaborators: false,
  };

  componentDidMount() {
    const { orgCustomerId } = this.props;
    this.props.getCustomer(orgCustomerId);
    this.props.getCustomerInvoices(orgCustomerId);
    this.props.getPlans();
    this.setProfitwell();
  }

  setProfitwell() {
    const { orgCustomerId, isProfitwellFlagOn, profitwellAuthToken } = this.props;

    if (window.profitwell && profitwellAuthToken && isProfitwellFlagOn) {
      window.profitwell('auth_token', profitwellAuthToken);
      window.profitwell('user_id', orgCustomerId);
    }
  }

  onChangeSubscription = (plan, stripeToken) => {
    const { hasPaymentSource } = this.props;
    this.updateSource(plan.get('id'), hasPaymentSource ? undefined : stripeToken);
  }

  updateSource = async (planId, stripeToken) => {
    this.setState({ isSourceUpdating: true });
    await this.props.updateSubscription(planId, stripeToken);
    this.setState({ isSourceUpdating: false });
  }

  updateCreditCard = async (stripeToken) => {
    const { currentSubscription } = this.props;
    this.updateSource(currentSubscription.getIn(['plan', 'id']), stripeToken);
  }

  render() {
    const {
      collaboratorsStats,
      coupon,
      currentSubscription,
      customer,
      customerPaymentSource,
      excludeCollaborator,
      hasActiveSubscription,
      hasPaymentSource,
      hideTaskSync,
      isCurrentPlanTaskSync,
      includeCollaborator,
      invoices,
      organizationId,
      orgBillingEmail,
      orgCustomerId,
      plans,
      plansAreLoading,
      stripePublishableKey,
    } = this.props;
    const { showAllCollaborators, isSourceUpdating } = this.state;

    // Show the loading screen when the plans are being retrieved or when the subscription is updating
    if (plansAreLoading || isSourceUpdating) {
      return <Loading />;
    }

    const collaborators = showAllCollaborators
      ? collaboratorsStats.get('collaborators', Map())
      : collaboratorsStats.get('collaborators', Map()).take(MAX_COLLABORATORS_TO_SHOW);
    const numCollaborators = collaboratorsStats.get('numCollaborators', 0);
    const numExcludedCollaborators = collaboratorsStats.get('collaborators', Map()).size - numCollaborators;

    const showBillingInformation = !currentSubscription.get('cancelAtPeriodEnd') && (hasActiveSubscription || hasPaymentSource);

    return (
      <Content className="billing-container container">
        <Title type="h1">Billing</Title>

        {
          !isCurrentPlanTaskSync && (
            <Section>
              <UsageContainerProjectSync
                collaboratorsStats={collaboratorsStats}
                currentSubscription={currentSubscription}
                hasPaymentSource={hasPaymentSource}
                organizationId={organizationId}
              />
              <Section className="collaborator-list">
                <Title type="h3">
                  Active Users { ' ' }
                  <IconHoverTooltip placement="top">
                    An Active User is anyone who, in the last 30 days, has collaborated on a syncing task. { ' ' }
                    Individuals are only counted once no matter how many projects or tools they work with. { ' ' }
                    <Href href="https://guide.unito.io/hc/en-us/articles/232055708-How-does-the-pricing-work-">
                      Find out more
                    </Href>
                  </IconHoverTooltip>
                </Title>
                {
                  collaborators.size > 0 ? (
                    <div>
                      <Description>
                        You currently have <strong>{ numCollaborators } active { numCollaborators > 1 ? 'users' : 'user' }</strong>
                        {
                          numExcludedCollaborators > 0
                            && ` and ${numExcludedCollaborators} excluded ${numExcludedCollaborators > 1 ? 'users' : 'user'}`
                        }
                      </Description>

                      <div className="row">
                        {
                          collaborators.map(collaborator => (
                            <div className="col-md-6" key={ collaborator.get('id') }>
                              <CollaboratorListItem
                                collaborator={ collaborator }
                                onExclude={ excludeCollaborator }
                                onInclude={ includeCollaborator }
                              />
                            </div>
                          )).toArray()
                        }
                      </div>
                      {
                        collaboratorsStats.get('collaborators', Map()).size > MAX_COLLABORATORS_TO_SHOW && (
                          <div className="text-center">
                            <Button
                              btnStyle="subtleLink"
                              onClick={ () => this.setState({ showAllCollaborators: !showAllCollaborators })}
                              size="sm"
                            >
                              { showAllCollaborators ? 'See less' : 'Show all' }
                            </Button>
                          </div>
                        )
                      }
                    </div>
                  ) : (
                    <Card className="text-center">
                      <Title type="h3">No active users yet</Title>
                      Once users start { ' ' }
                      <Href href="https://guide.unito.io/hc/en-us/articles/232055708-How-does-the-pricing-work-">
                        collaborating
                      </Href>
                      { ' ' } on your synchronized projects, they will show up here.
                    </Card>
                  )
                }
              </Section>
            </Section>
          )
        }

        {
          !hideTaskSync && (
            <UsageContainerTaskSync
              collaboratorsStats={collaboratorsStats}
              currentSubscription={currentSubscription}
              hasPaymentSource={hasPaymentSource}
              organizationId={organizationId}
              isTaskSyncPlan={isCurrentPlanTaskSync}
            />
          )
        }


        {
          showBillingInformation && (
            <Section className="billing-container__billing-info">
              <Title type="h2">Billing information</Title>
              <Card borderless color={ color.dark.quiet }>
                <BillingInformation
                  isPaymentSourceLoading={ isSourceUpdating }
                  onUpdatePaymentSource={ this.updateCreditCard }
                  organizationId={ organizationId }
                  paymentSource={ customerPaymentSource }
                  stripePublishableKey={ stripePublishableKey }
                />
              </Card>
            </Section>
          )
        }

        {
          !!invoices.size && (
            <Section className="billing-container__invoices">
              <Title type="h2">Invoices</Title>
              <Card borderless color={ color.dark.quiet }>
                {
                  invoices.map(invoice => (
                    <InvoiceListItem
                      invoice={ invoice }
                      plans={ plans }
                      customer={ customer }
                      key={ invoice.get('id') }
                    />
                  )).toArray()
                }
              </Card>
            </Section>
          )
        }

        <Section>
          <Title type="h2">
            Billing Email
          </Title>
          <Card borderless color={ color.dark.quiet }>
            <EditOrganizationBillingEmailForm
              currentOrgBillingEmail={ orgBillingEmail }
              organizationId={ organizationId }
              orgCustomerId={ orgCustomerId }
            />
            <SendEmailCheckboxWrapper>
              <SendEmailReceiptForm
                organizationId={ organizationId }
              />
            </SendEmailCheckboxWrapper>
          </Card>

        </Section>

        <Section className="billing-container__coupons">
          <Title type="h2">Coupon</Title>
          <Card borderless color={ color.dark.quiet }>
            <CouponInfo couponName={ coupon.get('id') } />
            <AddCouponForm customerId={ orgCustomerId } currentCouponName={ coupon.get('id') } />
          </Card>
        </Section>
      </Content>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  excludeCollaborator: collaboratorId =>
    dispatch(organizationActions.excludeCollaborator(ownProps.match.params.organizationId, collaboratorId)),
  includeCollaborator: collaboratorId =>
    dispatch(organizationActions.includeCollaborator(ownProps.match.params.organizationId, collaboratorId)),
  getCustomerInvoices: customerId => dispatch(billingActions.getCustomerInvoices(customerId)),
  updateSubscription: (planId, stripeToken) =>
    dispatch(billingActions.updateSubscription(ownProps.match.params.organizationId, planId, stripeToken)),
  getCustomer: customerId => dispatch(billingActions.getCustomer(customerId)),
  getPlans: () => dispatch(billingActions.getPlans(ownProps.match.params.organizationId)),
});

const mapStateToProps = (state, ownProps) => {
  const { organizationId } = ownProps.match.params;
  const orgCustomerId = getOrganizationCustomerId(state, organizationId);

  return {
    organizationId,
    orgCustomerId,
    collaboratorsStats: getCollaboratorsStatsByOrgId(state, organizationId),
    coupon: getActiveCoupon(state, orgCustomerId, organizationId),
    currentSubscription: getOrganizationSubscription(state, organizationId),
    customer: getCustomerById(state, orgCustomerId),
    customerPaymentSource: getCustomerDefaultPaymentSource(state, orgCustomerId),
    hasActiveSubscription: organizationHasActiveSubscription(state, organizationId),
    hasPaymentSource: customerHasPaymentSource(state, orgCustomerId),
    hideTaskSync: getEmbedName(state) === appTypes.EMBED.WRIKE,
    invoices: getCustomerInvoices(state, orgCustomerId),
    isCurrentPlanTaskSync: getIsCurrentPlanTaskSync(state, organizationId),
    orgBillingEmail: getOrganizationBillingEmail(state, organizationId),
    orgName: getOrganizationName(state, organizationId),
    plans: getVisiblePlans(state),
    plansAreLoading: getPlansAreLoading(state),
    profitwellAuthToken: state.app.get('profitwellAuthToken'),
    isProfitwellFlagOn: getFeatureFlagValue(state, 'profitwellretain'),
    stripePublishableKey: state.app.get('stripePublishableKey'),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BillingContainer);



// WEBPACK FOOTER //
// ./src/containers/BillingContainer/BillingContainer.jsx