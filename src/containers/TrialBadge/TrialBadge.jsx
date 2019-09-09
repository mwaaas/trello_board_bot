import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import moment from 'moment';

import { Href, Label } from '../../components';
import {
  getEmbedName,
  getFirstOrganization,
  getIsAuthenticated,
  isOnFreeTrial,
  isOrganizationAccountSuspended,
  isOrganizationTrialExpired,
  isOrganizationDelinquent,
} from '../../reducers';
import { routes } from '../../consts';


class TrialBadge extends Component {
  static propTypes = {
    accountIsDelinquent: PropTypes.bool.isRequired,
    accountIsSuspended: PropTypes.bool.isRequired,
    displayTrial: PropTypes.bool.isRequired,
    isEmbed: PropTypes.bool.isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
    organization: PropTypes.instanceOf(Map).isRequired,
    trialIsExpired: PropTypes.bool.isRequired,
  };

  getRedirectionProps = () => {
    const { isEmbed } = this.props;

    // Open in new tab inside embed mode, redirect in standalone
    return isEmbed
      ? { href: `/#${routes.ABSOLUTE_PATHS.ORGANIZATIONS}` }
      : { to: routes.ABSOLUTE_PATHS.ORGANIZATIONS };
  }

  getBadgeText = () => {
    const {
      accountIsDelinquent,
      accountIsSuspended,
      displayTrial,
      trialIsExpired,
    } = this.props;

    let badgeText;

    if (displayTrial && !trialIsExpired) {
      badgeText = 'Free trial';
    }

    if (trialIsExpired) {
      badgeText = 'Trial expired';
    }

    if (accountIsSuspended) {
      badgeText = 'Account suspended';
    }

    if (accountIsDelinquent) {
      badgeText = 'Last payment failed';
    }

    return badgeText;
  }

  getIsTrialing = () => {
    const { displayTrial, trialIsExpired } = this.props;

    return displayTrial && !trialIsExpired;
  }

  render() {
    const {
      displayTrial, isAuthenticated, organization, trialIsExpired,
    } = this.props;

    const badgeText = this.getBadgeText();

    if (!isAuthenticated || !badgeText) {
      return null;
    }

    const isTrialing = displayTrial && !trialIsExpired;
    const labelType = isTrialing ? 'success' : 'error';
    const daysLeft = moment(organization.get('validUntil')).fromNow(true);

    return (
      <Href className="trial-badge" {...this.getRedirectionProps()}>
        <Label labelType={ labelType }>
          <strong>{ badgeText }</strong> { isTrialing && ` - ${daysLeft} left` }
        </Label>
      </Href>
    );
  }
}

const mapStateToProps = state => ({
  accountIsDelinquent: isOrganizationDelinquent(state),
  accountIsSuspended: isOrganizationAccountSuspended(state),
  displayTrial: isOnFreeTrial(state),
  isAuthenticated: getIsAuthenticated(state),
  isEmbed: !!getEmbedName(state),
  organization: getFirstOrganization(state),
  trialIsExpired: isOrganizationTrialExpired(state),
});

export default connect(mapStateToProps)(TrialBadge);



// WEBPACK FOOTER //
// ./src/containers/TrialBadge/TrialBadge.jsx