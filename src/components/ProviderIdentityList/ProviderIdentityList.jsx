import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map } from 'immutable';

import ProviderIdentityItem from '../../containers/ProviderIdentityItem/ProviderIdentityItem';

import './ProviderIdentityList.scss';


export default class ProviderIdentityList extends Component {
  static propTypes = {
    providerIdentityList: PropTypes.instanceOf(Map).isRequired,
    onClickProviderIdentity: PropTypes.func.isRequired,
  };

  render() {
    const { providerIdentityList, onClickProviderIdentity } = this.props;

    return (
      <ul className="provider-identity-list">
        {
          providerIdentityList.valueSeq().map((providerIdentity, idx) => (
            <li
              data-test={ `provider-identity__icon-${providerIdentity.get('providerName')}-${idx}` }
              className="provider-identity-list__item"
              key={ providerIdentity.get('_id') }
            >
              <ProviderIdentityItem
                providerIdentity={ providerIdentity }
                onClick={ onClickProviderIdentity }
                avatarOnly
              />
            </li>
          )).toArray()
        }
      </ul>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/ProviderIdentityList/ProviderIdentityList.jsx