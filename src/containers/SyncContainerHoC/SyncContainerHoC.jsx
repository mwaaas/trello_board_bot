import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { trackingActions } from '../../actions';
import { OrgNeedsPayment, BlockSyncActiveUsersOverLimit } from '../../components';
import { organizationTypes, routes } from '../../consts';
import {
  getEmbedName,
  getFeatureFlagValue,
  isOrganizationOverUserLimit,
  organizationNeedsPayment,
} from '../../reducers';
import appHistory from '../../app-history';
import './SyncContainerHoC.scss';


const mapStateToProps = state => ({
  orgNeedsPayment: organizationNeedsPayment(state),
  isEmbed: !!getEmbedName(state),
  isOrgOverUserLimit: isOrganizationOverUserLimit(state),
  overLimitFlagValue: getFeatureFlagValue(state, 'billing-experiment-1-over-user-limit'),
});

const mapDispatchToProps = dispatch => ({
  trackEvent: (...params) => {
    dispatch(trackingActions.trackEvent(...params));
  },
});

export default (WrappedComponent) => {
  class SyncContainer extends Component {
    onCancel = () => {
      window.analytics.page(`${this.props.location.pathname}/cancel`);
      appHistory.push({ pathname: routes.ABSOLUTE_PATHS.DASHBOARD });
    }

    shouldBlockSyncAccess = () => {
      const { addSync, isOrgOverUserLimit, overLimitFlagValue } = this.props;
      const isAddSync = !!addSync;
      if (!isOrgOverUserLimit) {
        return false;
      }

      if (isAddSync && ['block-add-sync', 'block-add-edit-sync'].includes(overLimitFlagValue)) {
        return true;
      }

      if (!isAddSync && overLimitFlagValue === 'block-add-edit-sync') {
        return true;
      }

      return false;
    }

    render() {
      const {
        addSync,
        isEmbed,
        orgNeedsPayment,
        overLimitFlagValue,
        trackEvent,
      } = this.props;

      if (this.shouldBlockSyncAccess()) {
        const eventName = overLimitFlagValue === 'block-add-sync'
          ? organizationTypes.EVENTS.USER_CLICKED_UPGRADE_NOW_ADD_SYNC_BLOCKED
          : organizationTypes.EVENTS.USER_CLICKED_UPGRADE_NOW_ADD_EDIT_SYNC_BLOCKED;

        const loadEventName = overLimitFlagValue === 'block-add-sync'
          ? organizationTypes.EVENTS.USER_SAW_ADD_SYNC_BLOCKED
          : organizationTypes.EVENTS.USER_SAW_ADD_EDIT_SYNC_BLOCKED;

        return (
          <BlockSyncActiveUsersOverLimit
            isEmbed={ isEmbed }
            trackLoadEvent={ () => trackEvent(loadEventName) }
            trackUpgradeEvent={ () => trackEvent(eventName) }
            trackCancelEvent={ () => trackEvent(organizationTypes.EVENTS.USER_CLICKED_BACK_SYNC_BLOCKED) }
          >
            To unlock the ability to { addSync ? 'create a sync' : 'edit your syncs' }, upgrade your plan
          </BlockSyncActiveUsersOverLimit>
        );
      }

      if (orgNeedsPayment) {
        return <OrgNeedsPayment isEmbed={ isEmbed } />;
      }

      return <WrappedComponent {...this.props} onCancel={ this.onCancel } />;
    }
  }

  SyncContainer.propTypes = {
    isEmbed: PropTypes.bool.isRequired,
    isOrgOverUserLimit: PropTypes.bool.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    name: PropTypes.string,
    orgNeedsPayment: PropTypes.bool.isRequired,
    trackEvent: PropTypes.func.isRequired,
  };

  SyncContainer.defaultProps = {
    name: '',
  };

  return connect(mapStateToProps, mapDispatchToProps)(SyncContainer);
};



// WEBPACK FOOTER //
// ./src/containers/SyncContainerHoC/SyncContainerHoC.jsx