import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Map } from 'immutable';
import moment from 'moment';
import styled from 'styled-components';

import { linkActions, organizationActions } from '../../actions';
import {
  getCurrentPlan,
  getOrganizationById,
  getProviderByName,
  isOnFreeTrial,
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
  LimitProgressBar,
  Modal,
  Section,
  Title,
} from '../../components';
import { PlanDetails } from '../../containers';
import { routes } from '../../consts';
import { color, fontSize, fontWeight } from '../../theme';
import ConfigureTaskSyncForm from './ConfigureTaskSyncForm';


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

const SuccessSteps = styled.ul`
  color: ${color.dark.primary};
  margin-top: 2rem;
  margin-bottom: 2rem;
`;

class UsageContainerTaskSync extends Component {
  static propTypes = {
    currentPlan: PropTypes.instanceOf(Map).isRequired,
    currentSubscription: PropTypes.instanceOf(Map).isRequired,
    getOrganizationTaskSyncsTaskCount: PropTypes.func.isRequired,
    hasPaymentSource: PropTypes.bool.isRequired,
    isDelinquent: PropTypes.bool.isRequired,
    isSuspended: PropTypes.bool.isRequired,
    numberOfMirrorTaskSynced: PropTypes.number,
    onCustomPlan: PropTypes.bool.isRequired,
    onFreeTrial: PropTypes.bool.isRequired,
    onLegacyPlan: PropTypes.bool.isRequired,
    organization: PropTypes.instanceOf(Map).isRequired,
    organizationId: PropTypes.string,
    patchOrganization: PropTypes.func.isRequired,
    isTaskSyncPlan: PropTypes.bool.isRequired,
    trelloProvider: PropTypes.instanceOf(Map).isRequired,
    trialIsExpired: PropTypes.bool.isRequired,
  };

  state = {
    showConfigureMirror: false,
    showConfigureMirrorSuccess: false,
    showPlanDetails: false,
    taskSyncsCount: null,
  };

  componentDidMount() {
    this.fetchTaskCount();
  }

  fetchTaskCount = async () => {
    const { linkCount } = await this.props.getOrganizationTaskSyncsTaskCount();
    this.setState({ taskSyncsCount: linkCount.all - (linkCount.closed + linkCount.filteredOut) });
  };

  getPlanDetailsModal = () => {
    const { currentPlan, hasPaymentSource, organizationId } = this.props;
    const { showPlanDetails } = this.state;

    return (
      <Modal
        displayCloseButton
        isOpen={showPlanDetails}
        onRequestClose={() => this.setState({ showPlanDetails: false })}
        type="plainModal"
        size="lg"
      >
        <PlanDetails
          hasPaymentSource={hasPaymentSource}
          interval={currentPlan.get('interval')}
          isCurrentPlan={true}
          plan={currentPlan}
        />
        <Link className="pull-right" to={`${routes.ABSOLUTE_PATHS.ORGANIZATIONS}/${organizationId}/pricing`}>
          See pricing
        </Link>
      </Modal>
    );
  };

  getPlanName = () => {
    const {
      currentPlan,
      currentSubscription,
      isSuspended,
      onCustomPlan,
      onLegacyPlan,
      onFreeTrial,
      trialIsExpired,
    } = this.props;

    if (isSuspended && !trialIsExpired) {
      return <em>Canceled</em>;
    }

    let planName = currentPlan.get('nickname') || currentPlan.get('id');

    if (onFreeTrial && trialIsExpired) {
      planName += ' - Expired';
    } else if (onCustomPlan) {
      planName = 'Custom plan';
    } else if (currentSubscription.get('cancelAtPeriodEnd')) {
      planName += ' - Canceled';
    } else if (onLegacyPlan) {
      planName += ' - Legacy';
    }

    return planName;
  };

  getConfigureMirrorModal = () => (
    <Modal
      isOpen={this.state.showConfigureMirror}
      onCancel={() => this.setState({ showConfigureMirror: false })}
      onRequestClose={() => this.setState({ showConfigureMirror: false })}
      size="sm"
      title="Configure Mirror Account"
      type="plainModal"
    >
      <p>
        <strong>Mirror Power-Up</strong> is a team-based Power-Up, { ' ' }
        which means that you should choose a specific team for which you'll be able to use Mirror
      </p>
      <ConfigureTaskSyncForm
        provider={this.props.trelloProvider}
        onCancel={() => this.setState({ showConfigureMirror: false })}
        onSubmit={this.onTaskSyncPartnerAccountIdSetup}
      />
    </Modal>
  );

  onTaskSyncPartnerAccountIdSetup = async (formData) => {
    try {
      await this.props.patchOrganization(formData.workspaceId.value, formData.workspaceId.label);
      this.setState({
        showConfigureMirror: false,
        showConfigureMirrorSuccess: true,
        selectedWorkspaceName: formData.workspaceId.label,
      });
    } catch (err) {
      this.setState({ showConfigureMirror: false });
    }
  }

  getConfigureMirrorModalSuccess = () => (
    <Modal
      cancelLabel="Go back to my Billing Page"
      isOpen={this.state.showConfigureMirrorSuccess}
      onCancel={() => this.setState({ showConfigureMirrorSuccess: false })}
      onRequestClose={() => this.setState({ showConfigureMirrorSuccess: false })}
      size="sm"
      title="Mirror Account Configured Successfully"
      type="informativeModal"
    >
      <p>
        <strong>Congratulations!</strong> Mirror is now activated for your <strong>{ this.state.selectedWorkspaceName }</strong> Trello Team. { ' ' }
        There's just 3 more steps to follow on Trello before enjoying Mirror
      </p>

      <SuccessSteps className="fa-ul">
        <li>
          <Icon name="check" className="fa-li" color={ color.brand.green } />
          Enable the Mirror Power-Up from your Trello Board
        </li>
        <li>
          <Icon name="check" className="fa-li" color={ color.brand.green } />
          Authorize Unito
        </li>
        <li>
          <Icon name="check" className="fa-li" color={ color.brand.green } />
          Start mirroring!
        </li>
      </SuccessSteps>

      <p>
        Discover all our articles about Mirror in the { ' ' }
        <Href href="https://guide.unito.io/hc/en-us/categories/360001482973-Mirror">Knowledge Base</Href>.
      </p>
    </Modal>
  );

  getCanSeePlanDetails = () => {
    const {
      isSuspended,
      onCustomPlan,
      onFreeTrial,
    } = this.props;

    return !onFreeTrial && !isSuspended && !onCustomPlan;
  }

  showPurchaseCta = () => {
    const { isTaskSyncPlan, onFreeTrial, currentPlan } = this.props;
    const { taskSyncsCount } = this.state;
    const planMaxMirrors = Number(currentPlan.getIn(['featuresById', 'MAX_MIRROR_SYNCS', 'limit']));
    return isTaskSyncPlan && (onFreeTrial || taskSyncsCount >= planMaxMirrors);
  }

  render() {
    const {
      currentPlan,
      currentSubscription,
      isTaskSyncPlan,
      organization,
      organizationId,
    } = this.props;

    const { taskSyncsCount } = this.state;
    const planName = this.getPlanName();
    const planMaxMirrors = Number(currentPlan.getIn(['featuresById', 'MAX_MIRROR_SYNCS', 'limit']));
    const hasTrelloTeamSetup = !organization.getIn(['partnerInfos', 'trello'], Map()).isEmpty();

    if (!hasTrelloTeamSetup) {
      return (
        <Section className="row">
          <div className="col-md-6">
            <Title type="h2">Mirror Power-Up</Title>
            {this.getConfigureMirrorModal()}
            <Card borderless color={color.dark.quiet}>
              <p>
                Activate the <strong>Mirror Power-Up</strong> for one of your Trello Teams and start syncing the cards you want { ' ' }
                without leaving your boards. { ' ' }
                <Href href="https://guide.unito.io/hc/en-us/categories/360001482973-Mirror">Learn more about Mirror</Href>
              </p>
              <Button btnStyle="purple" reverse onClick={() => this.setState({ showConfigureMirror: true })}>
                Activate Mirror
              </Button>
            </Card>
          </div>
        </Section>
      );
    }

    const firstTeam = organization.getIn(['partnerInfos', 'trello'], Map()).first();
    const workspaceName = firstTeam.get('workspaceName') || <span>Team id <small>{firstTeam.get('accountId', 'unknown')}</small></span>;

    return (
      <Section className="billing-container__plans">
        {this.getConfigureMirrorModalSuccess()}
        {this.getPlanDetailsModal()}

        <Title type="h2">Mirror Power-Up</Title>

        <Card borderless color={color.dark.quiet} padding="0">
          <div className="row row-equal">
            <Col className="col-md-3">
              <Block colored>
                <Title type="h5">{ !isTaskSyncPlan ? 'Included in Plan' : 'Plan Name' }</Title>
                <BlockInfo>{planName}</BlockInfo>
                <BlockMoreInfo>
                  <div>
                    {currentSubscription.get('cancelAtPeriodEnd') && (
                      <div>Sync until {moment.unix(currentSubscription.get('cancelAt')).format('YYYY-MM-DD')}</div>
                    )}
                  </div>
                  {
                    this.getCanSeePlanDetails() && (
                      <Href onClick={() => this.setState({ showPlanDetails: true })} size="sm">
                        See details
                      </Href>
                    )
                  }
                </BlockMoreInfo>
              </Block>
            </Col>
            <Col className="col-md-3">
              <Block>
                <Title type="h5">Active on Trello Team</Title>
                <BlockInfo>{ workspaceName }</BlockInfo>
              </Block>
            </Col>

            <Col className="col-md-3">
              <Block>
                <LimitProgressBar
                  currentValue={taskSyncsCount}
                  helpText={currentPlan.getIn(['featuresById', 'MAX_USERS', 'helpText'])}
                  limitName="Number of Mirrors"
                  limitValue={planMaxMirrors}
                />
              </Block>
            </Col>
          </div>
          {
            (isTaskSyncPlan || isOnFreeTrial) && (
              <PurchaseBlock>
                Sync more tasks
                <Button
                  btnStyle="dark"
                  reverse
                  pullRight
                  to={`${routes.ABSOLUTE_PATHS.ORGANIZATIONS}/${organizationId}/pricing/task-sync`}
                  type="href"
                >
                  Choose a plan
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
  isDelinquent: isOrganizationDelinquent(state),
  isSuspended: organizationNeedsPayment(state),
  onCustomPlan: isOnCustomPlan(state),
  onFreeTrial: isOnFreeTrial(state, ownProps),
  onLegacyPlan: isOnLegacyPlan(state, ownProps.currentSubscription),
  organization: getOrganizationById(state, ownProps.organizationId),
  trelloProvider: getProviderByName(state, 'trello'),
  trialIsExpired: isOrganizationTrialExpired(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  getOrganizationTaskSyncsTaskCount: () =>
    dispatch(linkActions.getOrganizationTaskSyncsTaskCount(ownProps.organizationId)),
  patchOrganization: (accountId, workspaceName) =>
    dispatch(organizationActions.patchOrganization(ownProps.organizationId, {
      partnerInfo: {
        providerName: 'trello',
        workspaceName,
        accountId,
      },
    })),
});

export default connect(mapStateToProps, mapDispatchToProps)(UsageContainerTaskSync);



// WEBPACK FOOTER //
// ./src/containers/UsageContainer/UsageContainerTaskSync.jsx