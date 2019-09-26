import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Map } from 'immutable';
import moment from 'moment';
import styled from 'styled-components';

import {
  getAutoSyncLinksCount,
  getCurrentPlan,
  getExtraFeaturesAndLinks,
  getFeatureFlagValue,
  isOnFreeTrial,
  isOnFreeWithWrikePlan,
  isOrganizationDelinquent,
  isOrganizationTrialExpired,
  isOnCustomPlan,
  isOnLegacyPlan,
  organizationNeedsPayment,
} from '../../reducers';
import {
  Button,
  Card,
  Href,
  Icon,
  IconHoverTooltip,
  LimitProgressBar,
  Modal,
  Section,
  Title,
} from '../../components';
import { PlanDetails } from '../../containers';
import { routes } from '../../consts';
import { color, fontSize, fontWeight } from '../../theme';


const Block = styled.div`
  background-color: ${props => props.colored && color.brand.lightPurple};
  padding: 1.5rem 2rem;
  margin-right: ${props => props.colored && '-1rem'};

  .title {
    color: ${props => (props.colored ? color.light.primary : color.brand.purple)};
    margin-bottom: 0.5rem;
  }
`;

const BlockMoreInfo = styled.div`
  color: ${color.light.primary};
  display: inline-block;
  font-size: ${fontSize.button.sm};
  margin-top: 1.5rem;

  .href {
    color: ${color.light.primary};
  }
`;

const Col = styled.div`
  border-right: ${props => (props.noBorder ? 0 : `1px solid ${color.dark.quiet}`)};
`;

const BlockInfo = styled.div`
  font-weight: ${fontWeight.medium};
`;

const ExtraFeature = styled.div`
  border-bottom: 1px solid ${color.dark.quiet};
  padding: 0.75rem 0;
`;

const FeatureBlock = styled.div`
  border-top: 1px solid ${color.dark.quiet};
  padding: 2rem 2rem 0;

  .subtitle2 {
    margin-bottom: 2rem;
  }
`;

const FeatureName = styled.div`
  color: ${color.brand.purple};
  .fa {
    margin-right: .5rem;
  }
`;

const LinkBadge = styled.span`
  background-color: ${color.light.primary};
  border: 1px solid ${color.dark.quiet};
  border-radius: 20px;
  margin-bottom: .5%;
  overflow: hidden;
  padding: 0 1rem;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: ${fontSize.small};
  line-height: 2.25;

  a {
    color: ${color.dark.primary};
  };
`;

const PurchaseBlock = styled.div`
  background-color: ${color.brand.purple};
  bottom: -2rem;
  color: ${color.light.primary};
  left: 2rem;
  line-height: 2.5;
  margin-bottom: 5rem;
  position: relative;
  padding: 1rem 2rem;
  width: 70%;
`;


class UsageContainerProjectSync extends Component {
  static propTypes = {
    currentPlan: PropTypes.instanceOf(Map).isRequired,
    currentSubscription: PropTypes.instanceOf(Map).isRequired,
    isDelinquent: PropTypes.bool.isRequired,
    hasPaymentSource: PropTypes.bool.isRequired,
    numberOfAutoSyncs: PropTypes.number,
    onCustomPlan: PropTypes.bool.isRequired,
    onFreeTrial: PropTypes.bool.isRequired,
    onFreeWithWrikePlan: PropTypes.bool.isRequired,
    onLegacyPlan: PropTypes.bool.isRequired,
    organizationId: PropTypes.string,
    isSuspended: PropTypes.bool.isRequired,
    syncInterval: PropTypes.number.isRequired,
    trialIsExpired: PropTypes.bool.isRequired,
  };

  state = {
    showPlanDetails: false,
  };

  getPlanDetailsModal = () => {
    const { currentPlan, hasPaymentSource, organizationId } = this.props;
    const { showPlanDetails } = this.state;

    return (
      <Modal
        displayCloseButton
        isOpen={ showPlanDetails }
        onRequestClose={() => this.setState({ showPlanDetails: false }) }
        type="plainModal"
        size="lg"
      >
        <PlanDetails
          hasPaymentSource={ hasPaymentSource }
          interval={ currentPlan.get('interval') }
          isCurrentPlan={ true }
          plan={ currentPlan }
        />
        <Link
          className="pull-right"
          to={ `${routes.ABSOLUTE_PATHS.ORGANIZATIONS}/${organizationId}/pricing` }
        >
          See pricing
        </Link>
      </Modal>
    );
  }

  getPlanName = () => {
    const {
      currentPlan,
      currentSubscription,
      isSuspended,
      onCustomPlan,
      onLegacyPlan,
      onFreeTrial,
      onFreeWithWrikePlan,
      trialIsExpired,
    } = this.props;

    if (isSuspended && !trialIsExpired) {
      return <em>Canceled</em>;
    }

    let planName = currentPlan.getIn(['metadata', 'displayName']) || currentPlan.get('nickname') || currentPlan.get('name') || currentPlan.get('id');

    if (onFreeTrial && trialIsExpired) {
      planName += ' - Expired';
    } else if (onFreeWithWrikePlan) {
      planName = 'Wrike Limited Edition';
    } else if (onCustomPlan) {
      planName = 'Custom plan';
    } else if (currentSubscription.get('cancelAtPeriodEnd')) {
      planName += ' - Canceled';
    } else if (onLegacyPlan) {
      planName += ' - Legacy';
    }

    return planName;
  }

  getSyncFrequency = () => {
    const { isSuspended, syncInterval, trialIsExpired } = this.props;

    if (isSuspended || trialIsExpired) {
      return 'Suspended';
    }

    const syncFreq = syncInterval > 5 ? `${syncInterval / 60} minutes` : 'Live sync';
    return syncFreq;
  }

  getCanSeePlanDetails = () => {
    const {
      isSuspended,
      onCustomPlan,
      onFreeTrial,
      onFreeWithWrikePlan,
    } = this.props;

    return !onFreeTrial && !onFreeWithWrikePlan && !isSuspended && !onCustomPlan;
  }

  getFeaturesBlockData = () => {
    const {
      extraFeatures,
      isSuspended,
      onCustomPlan,
      onFreeTrial,
      onFreeWithWrikePlan,
    } = this.props;

    const isAnUpgrade = extraFeatures.size > 0 && (!isSuspended && !onFreeTrial);
    const showExtraFeatures = !onFreeWithWrikePlan && !onCustomPlan;

    return {
      isAnUpgrade,
      showExtraFeatures,
    };
  }

  getPurchaseBlockData = () => {
    const {
      currentPlan,
      extraFeatures,
      numberOfCollaborators,
      numberOfAutoSyncs,
      onLegacyPlan,
      onFreeWithWrikePlan,
      onCustomPlan,
      onFreeTrial,
    } = this.props;

    if (onFreeWithWrikePlan || onCustomPlan) {
      return {
        showSelectPlan: false,
      };
    }

    let ctaButton;
    let ctaDescription;
    let showSelectPlan = false;

    const planMaxUsers = Number(currentPlan.getIn(['featuresById', 'MAX_USERS', 'limit']));
    const planMaxAutoSyncs = Number(currentPlan.getIn(['featuresById', 'MAX_AUTO_SYNCS', 'limit']));
    const isOverPlanLimits = !onFreeTrial && (
      extraFeatures.size > 0
      || numberOfCollaborators >= planMaxUsers
      || numberOfAutoSyncs >= planMaxAutoSyncs
    );

    if (onFreeTrial) {
      ctaButton = 'Choose a plan';
      ctaDescription = "Unlock Unito's potential";
      showSelectPlan = true;
    } else if (onLegacyPlan) {
      ctaButton = 'Change your plan';
      ctaDescription = "You are missing out on Unito's new features";
      showSelectPlan = true;
    } else if (isOverPlanLimits) {
      ctaButton = 'Change your plan';
      ctaDescription = 'Enjoy Unito at its full power';
      showSelectPlan = true;
    }
    // TODO: Add a specific CTA for Mirror clients to let then know about the advantages of the full product

    return {
      ctaButton,
      ctaDescription,
      showSelectPlan,
    };
  }


  render() {
    const {
      collaboratorsStats,
      currentPlan,
      currentSubscription,
      extraFeatures,
      numberOfAutoSyncs,
      organizationId,
    } = this.props;

    const featuresData = this.getFeaturesBlockData();
    const purchaseData = this.getPurchaseBlockData();
    const planName = this.getPlanName();
    const syncFreq = this.getSyncFrequency();
    const canSeePlanDetails = this.getCanSeePlanDetails();

    const numberOfCollaborators = collaboratorsStats.get('numCollaborators', 0);
    const planMaxUsers = Number(currentPlan.getIn(['featuresById', 'MAX_USERS', 'limit']));
    const planMaxAutoSyncs = Number(currentPlan.getIn(['featuresById', 'MAX_AUTO_SYNCS', 'limit']));

    return (
      <Section className="billing-container__plans">
        { this.getPlanDetailsModal() }

        <Title type="h2">Project Sync</Title>

        <Card borderless color={ color.dark.quiet } padding="0">
          <div className="row row-equal">
            <Col className="col-md-3">
              <Block colored>
                <Title type="h5">Plan Name</Title>
                <BlockInfo>
                  { planName }
                </BlockInfo>
                <BlockMoreInfo>
                  {currentSubscription.get('cancelAtPeriodEnd') && (
                    <div>Sync until { moment.unix(currentSubscription.get('cancelAt')).format('YYYY-MM-DD') }</div>
                  )}
                  {
                    canSeePlanDetails && (
                      <Href
                        onClick={ () => this.setState({ showPlanDetails: true }) }
                        size="sm"
                      >
                        See details
                      </Href>
                    )
                  }
                </BlockMoreInfo>
              </Block>
            </Col>
            <Col className="col-md-3">
              <Block>
                <Title type="h5">Sync Frequency</Title>
                <BlockInfo>
                  <Icon name="hourglass-start" /> { syncFreq }
                </BlockInfo>
              </Block>
            </Col>

            <Col className="col-md-3">
              <Block>
                <LimitProgressBar
                  currentValue={ numberOfCollaborators }
                  helpText={ currentPlan.getIn(['featuresById', 'MAX_USERS', 'helpText']) }
                  limitName="Active Users"
                  limitValue={ planMaxUsers }
                />
              </Block>
            </Col>
            <Col className="col-md-3" noBorder>
              <Block>
                <LimitProgressBar
                  currentValue={ numberOfAutoSyncs }
                  helpText={ currentPlan.getIn(['featuresById', 'MAX_AUTO_SYNCS', 'helpText']) }
                  limitName="Auto Syncs"
                  limitValue={ planMaxAutoSyncs }
                />
              </Block>
            </Col>
          </div>

          {
            featuresData.showExtraFeatures && extraFeatures.size > 0 && (
              <FeatureBlock>
                <Title type="h4">Advanced features</Title>
                <Title type="subtitle2">
                  You are currently using <strong>{ extraFeatures.size } advanced { extraFeatures.size > 1 ? 'features' : 'feature'}</strong>.
                  { featuresData.isAnUpgrade && 'The syncs using them are forced in manual mode.' }
                </Title>
                {
                  extraFeatures.map(feature => (
                    <ExtraFeature key={ feature.get('id') }>
                      <div className="row">
                        <FeatureName className="col-md-4">
                          { featuresData.isAnUpgrade && <Icon color={color.brand.lightRed} name="exclamation-triangle" /> }
                          { feature.get('label') } { ' ' }
                          <IconHoverTooltip placement="top">{ feature.get('helpText') }</IconHoverTooltip>
                        </FeatureName>
                        <div className="col-md-8">
                          {
                            feature.get('links').take(9).map((link) => {
                              const editSyncUrl = `${routes.ABSOLUTE_PATHS.EDIT_LINK}/${link.get('_id')}`;
                              return (
                                <LinkBadge key={ link.get('_id') } className="col-md-4">
                                  <Link to={ editSyncUrl }>
                                    { link.get('name') }
                                  </Link>
                                </LinkBadge>);
                            }).toArray()
                          }
                          {
                            feature.get('links').size > 9 && (
                              <LinkBadge className="col-md-4">
                                And {feature.get('links').size - 9 } more...
                              </LinkBadge>
                            )
                          }
                        </div>
                      </div>
                    </ExtraFeature>
                  )).toArray()
                }
              </FeatureBlock>
            )
          }
          {
            purchaseData.showSelectPlan && (
              <PurchaseBlock>
                { purchaseData.ctaDescription }
                <Button
                  btnStyle="dark"
                  reverse
                  pullRight
                  to={ `${routes.ABSOLUTE_PATHS.ORGANIZATIONS}/${organizationId}/pricing` }
                  type="href"
                >
                  { purchaseData.ctaButton }
                </Button>
              </PurchaseBlock>
            )
          }
        </Card>
      </Section>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  currentPlan: getCurrentPlan(state, ownProps.currentSubscription),
  extraFeatures: getExtraFeaturesAndLinks(state, ownProps.currentSubscription),
  isDelinquent: isOrganizationDelinquent(state),
  isSuspended: organizationNeedsPayment(state),
  numberOfAutoSyncs: getAutoSyncLinksCount(state),
  onCustomPlan: isOnCustomPlan(state),
  onFreeTrial: isOnFreeTrial(state, ownProps),
  onFreeWithWrikePlan: isOnFreeWithWrikePlan(state),
  onLegacyPlan: isOnLegacyPlan(state, ownProps.currentSubscription),
  syncInterval: getFeatureFlagValue(state, 'sync-interval'),
  trialIsExpired: isOrganizationTrialExpired(state),
});

export default connect(mapStateToProps)(UsageContainerProjectSync);



// WEBPACK FOOTER //
// ./src/containers/UsageContainer/UsageContainerProjectSync.jsx