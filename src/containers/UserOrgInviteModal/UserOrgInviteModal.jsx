import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Map } from 'immutable';

import { inviteActions } from '../../actions';
import { Modal } from '../../components';

import './UserOrgInviteModal.scss';

class UserOrgInviteModal extends Component {
  static propTypes = {
    acceptInvite: PropTypes.func.isRequired,
    declineInvite: PropTypes.func.isRequired,
    invite: PropTypes.instanceOf(Map),
  };

  render() {
    const {
      acceptInvite,
      declineInvite,
      invite,
    } = this.props;

    const invitedBy = invite.getIn(['invitedBy', 'fullName']);
    const organizationName = invite.getIn(['organization', 'name']);

    return (
      <Modal
        cancelLabel="Decline"
        className="user-org-invite-modal"
        confirmLabel="Accept"
        isOpen
        onCancel={ declineInvite }
        onConfirm={ acceptInvite }
        title="Accept Invitation?"
      >
        <div>
          <p>
            You have been invited to join <span className="user-org-invite-modal__organization-name">{ organizationName }</span> { ' ' }
            by <span className="user-org-invite-modal__invited-by">{ invitedBy }</span>.
          </p>
        </div>
      </Modal>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  acceptInvite: () => {
    dispatch(inviteActions.acceptInvite(ownProps.invite.get('id')));
  },
  declineInvite: () => {
    dispatch(inviteActions.declineInvite(ownProps.invite.get('id')));
  },
});

export default connect(null, mapDispatchToProps)(UserOrgInviteModal);



// WEBPACK FOOTER //
// ./src/containers/UserOrgInviteModal/UserOrgInviteModal.jsx