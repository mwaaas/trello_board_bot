import PropTypes from 'prop-types';
import React, { Component } from 'react';
import moment from 'moment';
import { Map } from 'immutable';

import { Icon, Button, SyncHistoryDetails } from '../';
import { color } from '../../theme';
import './SyncHistoryItem.scss';


export default class SyncHistoryItem extends Component {
  static propTypes = {
    sync: PropTypes.instanceOf(Map).isRequired,
    termsA: PropTypes.instanceOf(Map).isRequired,
    termsB: PropTypes.instanceOf(Map).isRequired,
  };

  state = {
    isDetailsOpen: false,
  };

  getNoChangesMessage = () => {
    const { sync } = this.props;
    const duration = sync.get('endTime') - sync.get('startTime');

    // Round to nearest 5 minutes
    const roundedDuration = Math.round(duration / (1000 * 60 * 5)) * 1000 * 60 * 5;

    return `No changes detected for ${moment.duration(roundedDuration).humanize()}`;
  };

  getEntrySummary = () => {
    const { sync } = this.props;
    const operationsCount = sync.get('operationsCount');
    const errorsCount = sync.get('errorsCount');
    const isResync = sync.get('resync');

    const errorsSummary = errorsCount === 1
      ? `${errorsCount} error`
      : `${errorsCount} errors`;

    if (isResync) {
      return `Applied your sync setting changes. ${errorsSummary}`;
    }

    const operationsSummary = operationsCount === 1
      ? `${operationsCount} operation`
      : `${operationsCount} operations`;

    return `${operationsSummary}, ${errorsSummary}`;
  };

  toggleDetails = () => {
    this.setState({ isDetailsOpen: !this.state.isDetailsOpen });
  };

  render() {
    const { sync, termsA, termsB } = this.props;

    const hasError = !!sync.get('errorsCount');
    const isEmptyEntry = !(sync.get('operationsCount') + sync.get('errorsCount'));
    const timeStamp = moment(sync.get('endTime')).format('MMM Do, HH:mm:ss');

    return (
      <li className="sync-history-item">
        <div className="sync-history-item__header">
          <div className="sync-history-item__state">
            {
              hasError ? (
                <Icon
                  color={ color.brand.error }
                  name="times-circle"
                />
              ) : (
                <Icon
                  color={ color.brand.success }
                  name="check-circle"
                />
              )
            }
            {
              isEmptyEntry ? (
                <span className="sync-history-item__no-changes">
                  { this.getNoChangesMessage() }
                </span>
              ) : (
                <span className="sync-history-item__datetime">
                  { timeStamp }
                </span>
              )
            }
          </div>

          {
            !isEmptyEntry
            && <div className="sync-history-item__operations">
              { this.getEntrySummary() }
            </div>
          }

          <div className="sync-history-item__action">
            <Button
              size="xs"
              btnStyle="link"
              title="View sync history details"
              onClick={ this.toggleDetails }
            >
              <Icon name="chevron-down" />
            </Button>
          </div>
        </div>

        {
          this.state.isDetailsOpen
          && <SyncHistoryDetails
            sync={ sync }
            termsA={ termsA }
            termsB={ termsB }
          />
        }

      </li>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/SyncHistoryItem/SyncHistoryItem.jsx