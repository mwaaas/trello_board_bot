import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map, List } from 'immutable';
import moment from 'moment';

import { Button, UserDisplay } from '../';
import { inviteTypes } from '../../consts';
import './PendingEmailInviteListItem.scss';


export default class PendingEmailInviteListItem extends Component {
  static propTypes = {
    cancelInvite: PropTypes.func.isRequired,
    resendInvite: PropTypes.func.isRequired,
    invite: PropTypes.instanceOf(Map),
  };

  state = {
    buttonIsHovered: false,
  };

  onButtonMouseOut = () => {
    this.setState({ buttonIsHovered: false });
  }

  onButtonMouseOver = () => {
    this.setState({ buttonIsHovered: true });
  };

  onResendInviteClick = () => {
    const { invite, resendInvite } = this.props;
    resendInvite(invite.get('_id'));
  };

  onCancelInviteClick = () => {
    const { invite, cancelInvite } = this.props;
    cancelInvite(invite.get('_id'));
  };


  render() {
    const { invite } = this.props;
    const { buttonIsHovered } = this.state;
    const isPending = invite.get('state') === inviteTypes.STATES.PENDING;

    const validUntil = moment(invite.get('validUntil'));
    const fromNow = validUntil.fromNow();

    return (
      <div className="pending-invite-list-item">
        <div className="pending-invite-list-item__user">
          { /* Kind of a hack to reuse the UserDisplayComponent */ }
          <UserDisplay
            displayName={ invite.get('email') }
            emails={ List([`expires ${fromNow}`]) }
          />
        </div>
        <div className="pending-invite-list-item__action">
          {
            isPending && !buttonIsHovered && (
              <Button
                btnStyle="dark"
                onMouseOver={ this.onButtonMouseOver }
                pullRight
                reverse
              >
                Pending invite
              </Button>
            )
          }
          {
            isPending && buttonIsHovered && (
              <Button
                btnStyle="error"
                pullRight
                onClick={ this.onCancelInviteClick }
                onMouseOut={ this.onButtonMouseOut }
              >
                Cancel invite
              </Button>
            )
          }
        </div>
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/PendingEmailInviteListItem/PendingEmailInviteListItem.jsx