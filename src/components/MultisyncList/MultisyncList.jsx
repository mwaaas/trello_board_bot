import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { List, Map } from 'immutable';
import classnames from 'classnames';

import { MultisyncItem } from '../../components';


export default class MultisyncList extends Component {
  static propTypes = {
    multisyncList: PropTypes.instanceOf(List).isRequired,
    syncsByMultisyncId: PropTypes.instanceOf(Map).isRequired,
    embedName: PropTypes.string,
    isSiteAdmin: PropTypes.bool,
    userId: PropTypes.string.isRequired,
  };

  render() {
    const {
      multisyncList,
      syncsByMultisyncId,
      isSiteAdmin,
      onDeleteLink,
      onSetAutoSyncLink,
      onSetManualSyncLink,
      onSyncNowLink,
      userId,
    } = this.props;
    const cssClasses = classnames('multisync-list', {
      'multisync-list--empty': multisyncList.isEmpty(),
    });

    if (multisyncList.isEmpty()) {
      return null;
    }

    return (
      <div className={cssClasses}>
        {
          multisyncList.valueSeq().map(multisync => (
            <MultisyncItem
              isSiteAdmin={isSiteAdmin}
              key={multisync.get('_id')}
              multisync={multisync}
              syncsByMultisyncId={syncsByMultisyncId}
              onDelete={onDeleteLink}
              onSetAuto={onSetAutoSyncLink}
              onSetManual={onSetManualSyncLink}
              onSyncNow={onSyncNowLink}
              userId={userId}
            />
          )).toArray()
        }
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/MultisyncList/MultisyncList.jsx