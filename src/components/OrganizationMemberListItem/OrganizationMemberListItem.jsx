import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map, List } from 'immutable';

import { UserDisplay } from '../';
import './OrganizationMemberListItem.scss';


export default class OrganizationMemberListItem extends Component {
  static propTypes = {
    member: PropTypes.instanceOf(Map).isRequired,
  };

  render() {
    const { member } = this.props;
    const user = member.get('user') || Map();

    return (
      <div className="organization-member-list-item">
        <div className="organization-member-list-item__user">
          <UserDisplay
            displayName={ user.get('fullName') }
            emails={ List([user.get('email')]) }
            avatar={ user.get('avatarUrl') }
          />
        </div>
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/OrganizationMemberListItem/OrganizationMemberListItem.jsx