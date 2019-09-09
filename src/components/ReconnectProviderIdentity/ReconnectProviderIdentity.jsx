import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map, List } from 'immutable';

import { ProviderIdentitiesSelect } from '../../containers';


export default class ReconnectProviderIdentity extends Component {
  static propTypes = {
    containerSide: PropTypes.string.isRequired,
    input: PropTypes.object.isRequired,
    linkOwner: PropTypes.instanceOf(Map).isRequired,
    meta: PropTypes.object.isRequired,
    provider: PropTypes.instanceOf(Map).isRequired,
    providerIdentity: PropTypes.instanceOf(Map).isRequired,
    userId: PropTypes.string.isRequired,
  };

  render() {
    const {
      containerSide,
      linkOwner,
      provider,
      providerIdentity,
      input,
      meta,
      userId,
    } = this.props;

    const providerIdentityId = providerIdentity.get('_id');
    const providerDisplayName = provider.get('displayName');
    const belongsToUser = providerIdentity.get('users', List()).includes(userId);

    return (
      <div className="reconnect-provider-identity">
        {
          !belongsToUser ? (
            <div key={ providerIdentityId }>
              <span className="form-label">{ providerDisplayName } user </span>
              <div className="help-block">
                The user no longer has access to { providerDisplayName }.
                You will need to ask { ' ' }
                <a href={ `mailto:${linkOwner.get('email')}` }>
                  { linkOwner.get('fullName') }
                </a> { ' ' }
                the manager of this sync to reconnect it.
              </div>
            </div>
          ) : (
            <ProviderIdentitiesSelect
              containerSide={ containerSide }
              input={ input }
              label={ `${provider.get('displayName')} connector` }
              meta={ meta }
              showReconnectButton
              isEdit
            />
          )
        }
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/ReconnectProviderIdentity/ReconnectProviderIdentity.jsx