import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map } from 'immutable';

import ChangesDetails from './ChangesDetails';
import NoChangesDetails from './NoChangesDetails';


export default class SyncHistoryDetails extends Component {
  static propTypes = {
    sync: PropTypes.instanceOf(Map).isRequired,
    termsA: PropTypes.instanceOf(Map).isRequired,
    termsB: PropTypes.instanceOf(Map).isRequired,
  };

  render() {
    const { sync, ...rest } = this.props;
    const isNoChangesEntry = !!sync.get('syncs');

    return (
      <div className="sync-history-details">
        {
          isNoChangesEntry ? (
            <NoChangesDetails syncs={ sync.get('syncs') } />
          ) : (
            <ChangesDetails sync={ sync } {...rest} />
          )
        }
        { !isNoChangesEntry && <small>Sync Id: { sync.get('id') }</small> }
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/SyncHistoryDetails/SyncHistoryDetails.jsx