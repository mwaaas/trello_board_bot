import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { List } from 'immutable';
import classnames from 'classnames';

import { LinkItem } from '../';
import './LinkList.scss';

export default class LinkList extends Component {
  static propTypes = {
    isSiteAdmin: PropTypes.bool,
    linkList: PropTypes.instanceOf(List).isRequired,
    userId: PropTypes.string.isRequired,
  };

  static defaultProps = {
    isSiteAdmin: false,
  };

  render() {
    const {
      isSiteAdmin,
      linkList,
    } = this.props;
    const linkListClasses = classnames('link-list', {
      'link-list--empty': linkList.isEmpty(),
    });

    return (
      <div className={ linkListClasses }>
        {
          linkList.valueSeq().map(sync => (
            <LinkItem
              key={ sync.get('_id') }
              containerA={ sync.getIn(['A', 'container']) }
              containerB={ sync.getIn(['B', 'container']) }
              sync={ sync }
              isSiteAdmin={ isSiteAdmin }
              providerIdA={ sync.getIn(['A', 'providerIdentity', 'providerId']) }
              providerIdB={ sync.getIn(['B', 'providerIdentity', 'providerId']) }
              readOnlyA={ !!sync.getIn(['syncSettings', 'A', 'readOnly']) }
              readOnlyB={ !!sync.getIn(['syncSettings', 'B', 'readOnly']) }
              showActions
              syncName={ sync.get('name') || sync.getIn(['A', 'container', 'displayName']) }
            />
          )).toArray()
        }
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/LinkList/LinkList.jsx