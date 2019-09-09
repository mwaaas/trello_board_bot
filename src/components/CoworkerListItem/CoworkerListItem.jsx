import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map, List } from 'immutable';

import { Button, UserDisplay } from '../../components';
import { inviteTypes } from '../../consts';
import './CoworkerListItem.scss';

export default class CoworkerListItem extends Component {
  static propTypes = {
    coworker: PropTypes.instanceOf(Map).isRequired,
    inviteCoworker: PropTypes.func.isRequired,
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
  }

  onResendInviteClick = () => {
    const { invite, resendInvite } = this.props;
    resendInvite(invite.get('_id'));
  }

  onCancelInviteClick = () => {
    const { invite, cancelInvite } = this.props;
    cancelInvite(invite.get('_id'));
  }

  onInviteClick = () => {
    const { coworker, inviteCoworker } = this.props;
    inviteCoworker(coworker.get('_id'));
  }

  render() {
    const {
      coworker,
      invite,
    } = this.props;
    const { buttonIsHovered } = this.state;
    const isPending = invite && invite.get('state') === inviteTypes.STATES.PENDING;
    const isDeclined = invite && invite.get('state') === inviteTypes.STATES.DECLINED;
    const isCanceled = invite && invite.get('state') === inviteTypes.STATES.CANCELED;

    return (
      <div className="coworker-list-item">
        <div className="coworker-list-item__user">
          <UserDisplay
            displayName={ coworker.get('fullName') }
            emails={ List([coworker.get('email')]) }
            avatar={ coworker.get('avatarUrl') }
          />
        </div>
        <div className="coworker-list-item__action">
          {
            (!invite || isCanceled) && (
              <Button
                btnStyle="dark"
                className="pull-right"
                onClick={ isCanceled ? this.onResendInviteClick : this.onInviteClick }
                reverse
                size="sm"
              >
                Invite
              </Button>
            )
          }
          {
            isPending && !buttonIsHovered && (
              <Button
                btnStyle="dark"
                onMouseOver={ this.onButtonMouseOver }
                pullRight
                reverse
                size="sm"
              >
                Pending invite
              </Button>
            )
          }
          {
            isPending && buttonIsHovered && (
              <Button
                btnStyle="error"
                size="sm"
                pullRight
                onClick={ this.onCancelInviteClick }
                onMouseOut={ this.onButtonMouseOut }
              >
                Cancel invite
              </Button>
            )
          }
          {
            isDeclined && !buttonIsHovered && (
              <Button
                btnStyle="warning"
                size="sm"
                onMouseOver={ this.onButtonMouseOver }
                pullRight
              >
                Invite declined
              </Button>
            )
          }
          {
            isDeclined && buttonIsHovered && (
              <Button
                btnStyle="dark"
                className="pull-right"
                onClick={ this.onResendInviteClick }
                onMouseOut={ this.onButtonMouseOut }
                reverse
                size="sm"
              >
                Resend invite
              </Button>
            )
          }
        </div>
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/CoworkerListItem/CoworkerListItem.jsx