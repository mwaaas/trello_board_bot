import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Map } from 'immutable';
import Toggle from 'react-toggle';

import {
  Button,
  Dropdown,
  Tooltip,
  DropdownHeader,
  Icon,
} from '../../components';
import { LinkDiagnosticModal } from '../../containers';
import { linkTypes, routes } from '../../consts';

const labelClasses = {
  [linkTypes.LINK_STATES.DISABLED]: 'label label-warning',
  [linkTypes.LINK_STATES.DISCONNECTED]: 'label label-warning',
  [linkTypes.LINK_STATES.INACCESSIBLE]: 'label label-danger',
};

const labelTexts = {
  [linkTypes.LINK_STATES.DISABLED]: 'Disabled',
  [linkTypes.LINK_STATES.DISCONNECTED]: 'Disconnected',
  [linkTypes.LINK_STATES.INACCESSIBLE]: 'Inaccessible',
};

const Flex = styled.div`
  display: flex;
`;

const ItemWrapper = styled.div`
  margin-left: 8px;
  margin-right: 8px;
`;

const ToggleMargin = styled.div`
  display: flex;
  align-items: center;
`;

export default class SyncActions extends Component {
  static propTypes = {
    isAutoSync: PropTypes.bool.isRequired,
    isFromMultisyncItem: PropTypes.bool,
    isSavingSync: PropTypes.bool, // not required when coming from multisyncItem
    isSiteAdmin: PropTypes.bool.isRequired,
    isSyncing: PropTypes.bool,
    nbSyncs: PropTypes.number,
    onDelete: PropTypes.func.isRequired,
    onSetAutoSync: PropTypes.func.isRequired,
    onSetManualSync: PropTypes.func.isRequired,
    onSyncNow: PropTypes.func.isRequired,
    sync: PropTypes.instanceOf(Map).isRequired,
  };

  static defaultProps = {
    isFromMultisyncItem: false,
  };

  state = {
    isDiagnosisModalOpen: false,
    isToggleHovered: false,
  };

  handleOnMouseOver = () => {
    this.setState({ isToggleHovered: true });
  }

  handleOnMouseLeave = () => {
    this.setState({ isToggleHovered: false });
  }

  handleOnAutoSyncToggle = () => {
    const {
      onSetAutoSync,
      onSetManualSync,
      isAutoSync,
    } = this.props;

    if (isAutoSync) {
      onSetManualSync();
      return;
    }

    onSetAutoSync();
  }

  render() {
    const {
      isSiteAdmin,
      sync,
      isAutoSync,
      isSavingSync,
      isSyncing,
      onSyncNow,
      onDelete,
      isFromMultisyncItem,
      onSetAutoSync,
      onSetManualSync,
    } = this.props;

    const { isToggleHovered } = this.state;
    const linkState = sync.get('state');
    const isRestricted = sync.get('restricted', false);

    return (
      <Flex className="sync-actions">
        {
          this.state.isDiagnosisModalOpen && (
            <LinkDiagnosticModal
              isOpen={ this.state.isDiagnosisModalOpen }
              sync={ sync }
              onRequestClose={ () => this.setState({ isDiagnosisModalOpen: false }) }
            />
          )
        }

        {
          isSiteAdmin && !isFromMultisyncItem && (
            <ItemWrapper>
              <Button
                btnStyle="error"
                className="diagnose-button"
                onClick={ () => this.setState({ isDiagnosisModalOpen: true }) }
                reverse
                size="xs"
              >
                <Icon name="heartbeat" size="lg" /> Diagnose
              </Button>
            </ItemWrapper>
          )
        }

        {
          linkState !== linkTypes.LINK_STATES.ACTIVE && (
            <div className="link-item__status">
              <span className={ labelClasses[linkState] }>
                { labelTexts[linkState] }
              </span>
            </div>
          )
        }

        {
          !sync.get('isSuspended') && !isFromMultisyncItem && sync.get('kind') !== linkTypes.KIND.TASK_SYNC && (
            <ItemWrapper>
              <Button
                btnStyle="dark"
                className="sync-now-button"
                data-test="dashboard__btn--syncnow"
                disabled={ isSyncing }
                size="xs"
                title="Sync Now"
                reverse
                type="button"
                onClick={ onSyncNow }
              >
                { isSyncing && <Icon name="refresh" className="fa-spin" /> }
                { isSyncing ? ' Syncing' : 'Sync now' }
              </Button>
            </ItemWrapper>
          )
        }

        {
          !isRestricted && !isFromMultisyncItem && sync.get('kind') !== linkTypes.KIND.TASK_SYNC && (
            <ItemWrapper
              onMouseOver={ this.handleOnMouseOver }
              onMouseLeave={ this.handleOnMouseLeave }
            >
              <ToggleMargin
                className="autosync-toggle"
                onMouseOver={ this.handleOnMouseOver }
                onMouseLeave={ this.handleOnMouseLeave }
              >
                <Toggle
                  checked={ isAutoSync }
                  disabled={ isSavingSync }
                  onChange={ this.handleOnAutoSyncToggle }
                  ref='autosync'
                  data-test='dashboard__btn--autosync'
                />
                <Tooltip
                  show={ isToggleHovered }
                  target={ this.refs.autosync }
                >
                  Activating auto-sync will allow Unito to sync changes based on your plan speed.
                  By deactivating auto-sync, changes will no longer sync automatically.
                </Tooltip>
              </ToggleMargin>
            </ItemWrapper>
          )
        }

        <Dropdown
          alignRight
          btnContent={ <Icon name="ellipsis-v" size="lg" /> }
          className="dropdown link-item__more-options"
          data-test="link-item__options-dropdown"
        >
          {
            isRestricted && (
              <li className="disabled">
                <a className="dropdown__item--message">
                  <Icon name="lock" className="fa-fw" />
                  <small>
                    You will need to contact the manager to make changes to this sync.
                  </small>
                </a>
              </li>
            )
          }

          {
            !sync.get('isSuspended') && !isRestricted && (
              <li>
                <Link
                  to={ `${isFromMultisyncItem ? routes.ABSOLUTE_PATHS.EDIT_MULTISYNC : routes.ABSOLUTE_PATHS.EDIT_LINK}/${sync.get('_id')}` }
                  className="btn"
                  title="Edit this sync"
                >
                  <Icon name="edit" className="fa-fw" />
                  Edit
                </Link>
              </li>
            )
          }

          {
            !sync.get('isSuspended') && !isRestricted && (
              <li>
                <a
                  className="btn"
                  data-test="link-item__delete"
                  onClick={ onDelete }
                  onKeyPress={ onDelete }
                  role="button"
                  tabIndex={ 0 }
                >
                  <Icon name="trash" className="fa-fw" />
                  Delete
                </a>
              </li>
            )
          }

          <li className="divider" />

          {
            isFromMultisyncItem && (
              <li className="dropdown-header">
                Grouped Actions
              </li>
            )
          }

          {
            isFromMultisyncItem && (
              <li>
                <a
                  data-test="link-item__syncNow"
                  onClick={ onSyncNow }
                  onKeyPress={ onSyncNow }
                  role="button"
                  tabIndex={ 0 }
                >
                  Sync all
                </a>
              </li>
            )
          }

          {
            isFromMultisyncItem && false && (
              <li>
                <a
                  data-test="link-item__turnOnAutoSync"
                  onClick={ onSetAutoSync }
                  onKeyPress={ onSetAutoSync }
                  role="button"
                  tabIndex={ 0 }
                >
                  Turn on auto sync
                </a>
              </li>
            )
          }

          {
            isFromMultisyncItem && false && (
              <li>
                <a
                  data-test="link-item__turnOnAutoSync"
                  onClick={ onSetManualSync }
                  onKeyPress={ onSetManualSync }
                  role="button"
                  tabIndex={ 0 }
                >
                  Turn off auto sync
                </a>
              </li>
            )
          }

          {
            !isFromMultisyncItem && (
              <DropdownHeader
                subtitle={(
                  <span>
                    <Icon name="history" className="fa-fw" />
                    Last sync: { sync.get('lastSyncRequest') ? moment(sync.get('lastSyncRequest')).fromNow() : ' Never' }
                  </span>
                )}
              />
            )
          }
        </Dropdown>
      </Flex>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/LinkItem/SyncActions.jsx