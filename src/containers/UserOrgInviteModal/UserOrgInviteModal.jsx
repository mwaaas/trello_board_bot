import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Map } from 'immutable';

import { inviteActions } from '../../actions';
import { Modal } from '../../components';
import { isPayingOrganizationLastUser } from '../../reducers';


import './UserOrgInviteModal.scss';

class UserOrgInviteModal extends Component {
  static propTypes = {
    acceptInvite: PropTypes.func.isRequired,
    declineInvite: PropTypes.func.isRequired,
    invite: PropTypes.instanceOf(Map),
    isLastPayingUser: PropTypes.bool.isRequired,
  };

  render() {
    const {
      acceptInvite,
      declineInvite,
      invite,
      isLastPayingUser,
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
          <p>
            If you have existing syncs, they will be transferred into the new workspace and will become visible to all of its members.
          </p>
          {
            isLastPayingUser && (
              <div className="alert alert-warning">
                Woah there! <br/>
                Your current workspace has a paid subscription to Unito. <br/>
                By accepting this invitation, this subscription will be canceled. { ' ' }
                If this is not what you intended to do, decline this invitation and { ' ' }
                <a href="mailto:support@unito.io">contact us</a> so we can help you!
              </div>
            )
          }
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = state => ({
  isLastPayingUser: isPayingOrganizationLastUser(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  acceptInvite: () => {
    dispatch(inviteActions.acceptInvite(ownProps.invite.get('id')));
  },
  declineInvite: () => {
    dispatch(inviteActions.declineInvite(ownProps.invite.get('id')));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(UserOrgInviteModal);



// WEBPACK FOOTER //
// ./src/containers/UserOrgInviteModal/UserOrgInviteModal.jsx