import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { reduxForm } from 'redux-form';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import moment from 'moment';

import Trackable from '../../components/TrackableHoC/TrackableHoC';
import {
  Button,
  Card,
  Href,
  Icon,
  Section,
  Title,
  IconHoverTooltip,
  StickyButtonToolbar,
  SyncHistoryItem,
} from '../../components';
import { ContainersSync } from '../../containers';
import { routes } from '../../consts';
import {
  isCurrentSyncGrandfathered,
  getCurrentSyncHistory,
  getProviderCapabilities,
} from '../../reducers';
import { formUtils } from '../../utils';
import { color } from '../../theme';


import './SyncStatusForm.scss';



class SyncStatusForm extends Component {
  static propTypes = {
    isGrandfathered: PropTypes.bool.isRequired,
    syncHistory: PropTypes.instanceOf(List).isRequired,
    termsA: PropTypes.instanceOf(Map),
    termsB: PropTypes.instanceOf(Map),
  };

  getLastSyncMessage = () => {
    const lastSync = this.props.syncHistory.first();

    if (!lastSync) {
      return '';
    }

    const since = moment
      .duration(lastSync.get('endTime') - Date.now())
      .humanize(true);

    return `Last sync: ${since}`;
  }

  render() {
    const {
      handleSubmit,
      isGrandfathered,
      onCancel,
      syncHistory,
      termsA,
      termsB,
    } = this.props;

    return (
      <div className="sync-status-form">
        <Section>
          <Title type="h2">
            Sync status
          </Title>
          {
            isGrandfathered && (
              <Card padding=".5em" color={ color.brand.lightBlue } lighten>
                <Icon name="info-circle" />{' '}
                This sync has been grandfathered.{' '}
                <Href href={ routes.HELP_PATHS.GRANDFATHERING }>More details</Href>
              </Card>
            )
          }
        </Section>

        <Section>
          <ContainersSync isEdit/>
        </Section>

        <Section>
          <Title type="h2">
            Sync history{' '}
            <IconHoverTooltip placement="top">
              Sync history lists every sync that happened in the past 3 days
            </IconHoverTooltip>
          </Title>
          <small>{ this.getLastSyncMessage() }</small>
          {
            syncHistory.isEmpty() ? (
              <Card className="text-center">
                <Title type="h3">There are no changes synced at the moment.</Title>
                The details of your next sync will appear here.
              </Card>
            ) : (
              <ul className="sync-status-form__history-list">
                {
                  syncHistory.map((sync, index) => (
                    <SyncHistoryItem
                      key={ index }
                      sync={ sync }
                      termsA={ termsA }
                      termsB={ termsB }
                    />
                  )).toArray()
                }
              </ul>
            )
          }
        </Section>

        <StickyButtonToolbar>
          <Button
            btnStyle="dark"
            onClick={ onCancel }
            pullLeft
            reverse
            v2
          >
            Cancel
          </Button>
          <Button
            btnStyle="primary"
            onClick={ handleSubmit }
            pullRight
            v2
          >
            Save and sync
          </Button>
        </StickyButtonToolbar>
      </div>
    );
  }
}
SyncStatusForm = reduxForm({
  form: 'syncForm',
  destroyOnUnmount: false,
  validate: (values) => {
    const errors = {};
    if (formUtils.isEmpty(values.name)) {
      errors.name = 'Required';
    }
    return errors;
  },
})(SyncStatusForm);

SyncStatusForm = Trackable(SyncStatusForm, 'customize/status');

const mapStateToProps = state => ({
  isGrandfathered: isCurrentSyncGrandfathered(state),
  syncHistory: getCurrentSyncHistory(state),
  termsA: getProviderCapabilities(state, { containerSide: 'A' }, 'terms'),
  termsB: getProviderCapabilities(state, { containerSide: 'B' }, 'terms'),
});

export default connect(mapStateToProps)(SyncStatusForm);



// WEBPACK FOOTER //
// ./src/containers/SyncStatusForm/SyncStatusForm.jsx