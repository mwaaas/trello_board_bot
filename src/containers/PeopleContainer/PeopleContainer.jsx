import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { List, Map } from 'immutable';
import { reset } from 'redux-form';
import moment from 'moment';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';

import { organizationActions, inviteActions } from '../../actions';
import {
  Card,
  CoworkerListItem,
  OrganizationMemberListItem,
  Section,
  Subheading,
  Title,
  PendingEmailInviteListItem,
} from '../../components';
import { inviteTypes } from '../../consts';
import {
  getInvitesGroupedByEmail,
  getInvitesGroupedByUser,
  getOrganizationName,
  getSortedOrganizationCoworkers,
  getSortedOrganizationMembers,
} from '../../reducers';
import { EditOrganizationNameForm, InviteByEmailForm } from '../../containers';
import { color } from '../../theme';


const Content = styled.div`
  background: white;
  min-height: calc(100vh - 66px);
  padding: 4em 6em;
`;


class PeopleContainer extends Component {
  static propTypes = {
    cancelInvite: PropTypes.func.isRequired,
    clearInviteForm: PropTypes.func.isRequired,
    coworkers: PropTypes.instanceOf(List).isRequired,
    inviteCoworker: PropTypes.func.isRequired,
    inviteCoworkerByEmail: PropTypes.func.isRequired,
    invitesByEmail: PropTypes.instanceOf(Map).isRequired,
    invitesByUserId: PropTypes.instanceOf(Map).isRequired,
    loadResources: PropTypes.func.isRequired,
    members: PropTypes.instanceOf(List).isRequired,
    resendInvite: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.loadResources();
  }

  /**
   * Before create an invite by email
   * If there is already one existing for this email and it's still valid: do nothing
   * Else send / resend the invite
   * */
  handleInviteByEmail = ({ email }) => {
    const {
      inviteCoworkerByEmail,
      invitesByEmail,
      clearInviteForm,
      resendInvite,
    } = this.props;

    const invite = invitesByEmail.get(email);
    if (invite) {
      const isPending = invite.get('state') === inviteTypes.STATES.PENDING;
      const isExpired = moment(invite.get('validUntil')) < moment.now();
      if (!isPending || isExpired) {
        resendInvite(invite.get('_id'));
      } else {
        clearInviteForm();
      }
    } else {
      inviteCoworkerByEmail(email);
    }
  }

  filterInvites() {
    const { invitesByEmail } = this.props;
    return invitesByEmail.filter((invite) => {
      const isPending = invite.get('state') === inviteTypes.STATES.PENDING;
      const validUntil = moment(invite.get('validUntil'));
      const isExpired = validUntil < moment.now();
      if (isPending && !isExpired) {
        return true;
      }

      return false;
    });
  }

  render() {
    const {
      cancelInvite,
      coworkers,
      inviteCoworker,
      invitesByUserId,
      members,
      orgName,
      resendInvite,
      match: { params: { organizationId } },
    } = this.props;

    const visibleInvites = this.filterInvites();

    return (
      <Content className="people-container container">
        <Section>
          <Title type="h1">
            Workspace
          </Title>
          <Subheading>
            Collaborate with other team members by inviting them to your workspace.<br />
            Members can add, edit and trigger any sync in your workspace.
          </Subheading>
        </Section>

        <Section>
          <Title type="h3">
            Workspace name
          </Title>
          <Card borderless color={ color.dark.quiet }>
            <EditOrganizationNameForm
              currentOrgName={ orgName }
              organizationId={ organizationId }
            />
          </Card>
        </Section>
        <Section className="people-container__email-invite">
          <Title type="h3">
            Invite new members to your workspace
          </Title>
          <Card borderless color={ color.dark.quiet }>
            <InviteByEmailForm onSubmit={ this.handleInviteByEmail } />
          </Card>
        </Section>

        <Section className="people-container__items">
          <Title type="h3">
            Workspace members
          </Title>
          <Card borderless color={ color.dark.quiet }>
            {
              members.map(member => (
                  <OrganizationMemberListItem
                    key={ member.get('_id') }
                    member={ member }
                  />
              )).toArray()
            }
          </Card>
        </Section>

        {
          visibleInvites.size > 0
            && <Section className="people-container__items">
              <Title type="h3">
                Pending invitations
              </Title>
              <Card borderless color={ color.dark.quiet }>
                {
                  visibleInvites.map(invite => (
                      <PendingEmailInviteListItem
                        key={ invite.get('email') }
                        resendInvite={ resendInvite }
                        cancelInvite={ cancelInvite }
                        invite={ invite }
                      />
                  )).toArray()
                }
              </Card>
            </Section>
        }
        {
          coworkers.size > 0 && (
            <Section className="people-container__items">
              <Title type="h3">People you may know</Title>
              <p>
                Here is everyone with a Unito account that you may know. You could invite them as members in your workspace too.
              </p>
              <Card borderless color={ color.dark.quiet }>
                {
                  coworkers.map((coworker) => {
                    const id = coworker.get('_id');
                    const invite = invitesByUserId.get(id);
                    return (
                      <CoworkerListItem
                        key={ id }
                        coworker={ coworker }
                        inviteCoworker={ inviteCoworker }
                        resendInvite={ resendInvite }
                        cancelInvite={ cancelInvite }
                        invite={ invite }
                      />
                    );
                  }).toArray()
                }
              </Card>
            </Section>
          )
        }
      </Content>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  orgName: getOrganizationName(state, ownProps.match.params.organizationId),
  coworkers: getSortedOrganizationCoworkers(state, ownProps.match.params.organizationId),
  invitesByEmail: getInvitesGroupedByEmail(state),
  invitesByUserId: getInvitesGroupedByUser(state),
  members: getSortedOrganizationMembers(state, ownProps.match.params.organizationId),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  loadResources: () => {
    dispatch(inviteActions.getInvites(ownProps.match.params.organizationId));
    dispatch(organizationActions.getMembers(ownProps.match.params.organizationId));
    dispatch(organizationActions.getCoworkers(ownProps.match.params.organizationId));
  },
  inviteCoworker: (userId) => {
    dispatch(inviteActions.inviteCoworker(ownProps.match.params.organizationId, userId));
  },
  inviteCoworkerByEmail: (email) => {
    dispatch(inviteActions.inviteCoworker(ownProps.match.params.organizationId, undefined, email));
  },
  resendInvite: (inviteId) => {
    dispatch(inviteActions.resendInvite(inviteId));
  },
  cancelInvite: (inviteId) => {
    dispatch(inviteActions.cancelInvite(inviteId));
  },
  clearInviteForm: () => {
    dispatch(reset(inviteTypes.INVITE_BY_EMAIL_FORM));
  },
});

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(PeopleContainer));



// WEBPACK FOOTER //
// ./src/containers/PeopleContainer/PeopleContainer.jsx