import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { Link } from 'react-router-dom';
import copy from 'copy-to-clipboard';
import styled from 'styled-components';

import { routes } from '../../consts';
import { fontWeight, color } from '../../theme';


const Wrapper = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
`;

const Grid = styled.div`
  display: grid;
  grid-template-areas:
    "link-name"
    "manager"
    "link-id"
    "user-id"
  ;
`;

const StyledLinkName = styled.div`
  grid-area: link-name;
  font-weight: ${fontWeight.medium};

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  a {
    color: ${color.dark.primary};

    &:hover {
      color: ${color.brand.secondary};
    };
  }
`;

const Manager = styled.small`
  grid-area: manager;
`;

const LinkId = styled.small`
  cursor: copy;
  font-family: monospace;
  grid-area: link-id;
  margin-top: 8px;

  &:hover {
    color: ${color.brand.secondary};
  };
`;

const UserId = styled.small`
  cursor: copy;
  font-family: monospace;
  grid-area: user-id;

  &:hover {
    color: ${color.brand.secondary};
  };
`;


export default class LinkName extends Component {
  static propTypes = {
    isSiteAdmin: PropTypes.bool.isRequired,
    isSuspended: PropTypes.bool,
    syncId: PropTypes.string,
    name: PropTypes.string,
    restricted: PropTypes.bool.isRequired,
    user: PropTypes.instanceOf(Map),
    isMultisync: PropTypes.bool,
  }

  static defaultProps = {
    isSuspended: false,
    user: Map(),
    isMultisync: false,
  };

  copyToClipboard = string => () => copy(string);

  render() {
    const {
      isSiteAdmin,
      isSuspended,
      syncId,
      name,
      restricted,
      user,
      isMultisync,
    } = this.props;

    const editSyncUrl = `${isMultisync ? routes.ABSOLUTE_PATHS.EDIT_MULTISYNC : routes.ABSOLUTE_PATHS.EDIT_LINK}/${syncId}`;
    const userId = user.get('_id');
    const mailToUrl = `mailto:${user.get('email')}`;
    const managerName = user.get('fullName');
    const canEditLink = isSiteAdmin || (!restricted && !isSuspended);

    return (
      <Wrapper>
        <Grid>
          <StyledLinkName className="link-name" isLink={ !restricted }>
            {
              syncId && canEditLink ? (
                <Link to={ editSyncUrl } title={ `Edit the sync: ${name}` }>
                  { name }
                </Link>
              ) : (
                name
              )
            }
          </StyledLinkName>

          {
            restricted && (
              <Manager className="manager">
                Managed by <a href={ mailToUrl }>{ managerName }</a>
              </Manager>
            )
          }

          {
            isSiteAdmin && (
              <LinkId className="link-id" onClick={ this.copyToClipboard(syncId) }>
                <div>{ `syncId: ${syncId}` }</div>
              </LinkId>
            )
          }

          {
            isSiteAdmin && (
              <UserId className="user-id" onClick={ this.copyToClipboard(userId) }>
                <div>{ `userId: ${userId}` }</div>
              </UserId>
            )
          }
        </Grid>
      </Wrapper>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/LinkItem/LinkName.jsx