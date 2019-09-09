import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { addNotification as notify } from 'reapop';

import { linkActions, multisyncActions } from '../../actions';
import {
  ContainerIcon,
  Href,
  Label,
  SyncDirectionIcon,
  Modal,
} from '../';
import { linkTypes, routes } from '../../consts';
import {
  getEmbedName,
  isSavingSync as getIsSavingSync,
  getProviderById,
  getSyncingLinkIds,
} from '../../reducers';
import { color } from '../../theme';

import Indicator from './Indicator';
import LinkName from './LinkName';
import SyncActions from './SyncActions';

import './LinkItem.scss';


const Item = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  min-height: 60px;
  background-color: ${props => (props.isDisabled ? color.dark.whisper : color.light.primary)};
  border: 1px solid ${color.dark.whisper};
  border-radius: 4px;
  margin-bottom: 16px;
  padding: 6px 12px;

  .dropdown-menu {
    border-top: 0;
    margin-right: -13px;
    margin-top: 18px;
  }
`;

const ItemWrapper = styled.div`
  margin-left: 8px;
  margin-right: 8px;
`;

const LinkInfo = styled.div`
  margin-left: 1rem;
  flex-grow: 1;
  flex-shrink: 1;
`;

const SecondLine = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
`;

const MirrorIcon = styled.span`
  height: 20px;
`;


class LinkItem extends Component {
  static propTypes = {
    containerA: PropTypes.instanceOf(Map).isRequired,
    containerB: PropTypes.instanceOf(Map).isRequired,
    getSyncingStates: PropTypes.func.isRequired,
    isEmbed: PropTypes.bool,
    isSavingSync: PropTypes.bool,
    isSiteAdmin: PropTypes.bool,
    multisyncName: PropTypes.string,
    nbSyncs: PropTypes.number,
    onSyncNow: PropTypes.func.isRequired,
    providerA: PropTypes.instanceOf(Map).isRequired,
    providerB: PropTypes.instanceOf(Map).isRequired,
    providerIdA: PropTypes.string.isRequired,
    providerIdB: PropTypes.string.isRequired,
    readOnlyA: PropTypes.bool,
    readOnlyB: PropTypes.bool,
    showActions: PropTypes.bool,
    sync: PropTypes.instanceOf(Map),
    syncingIds: PropTypes.instanceOf(Map).isRequired,
    syncName: PropTypes.string.isRequired,
  }

  static defaultProps = {
    isSiteAdmin: false,
    readOnlyA: false,
    readOnlyB: false,
    showActions: false,
    sync: Map(),
    nbSyncs: null, // meaning this sync is not from a multisync
  };

  state = {
    isSyncDeleteModalOpen: false,
  };

  componentWillUnmount() {
    this.clearPolling();
  }

  clearPolling = () => {
    window.clearInterval(this.interval);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.syncingIds.isEmpty() && nextProps.syncingIds.isEmpty()) {
      this.clearPolling();
    }
  }

  startPolling = () => {
    this.interval = window.setInterval(this.props.getSyncingStates, 20000);
  }

  handleOnSyncNow = () => {
    this.props.onSyncNow(this.props.sync.get('_id'));
    this.startPolling();
  }

  getRedirectionProps = () => {
    const { isEmbed } = this.props;

    // Open in new tab inside embed mode, redirect in standalone
    return isEmbed
      ? { href: `/#${routes.ABSOLUTE_PATHS.ORGANIZATIONS}` }
      : { to: routes.ABSOLUTE_PATHS.ORGANIZATIONS };
  }

  openModal = () => {
    this.setState({ isSyncDeleteModalOpen: true });
  }

  closeModal = () => {
    this.setState({ isSyncDeleteModalOpen: false });
  }

  getPluralTaskTerm = () => {
    const { providerA, providerB } = this.props;

    const termsA = providerA.getIn(['capabilities', 'terms'], Map());
    const termsB = providerB.getIn(['capabilities', 'terms'], Map());

    const pluralTaskTermA = termsA.getIn(['task', 'plural']);
    const pluralTaskTermB = termsB.getIn(['task', 'plural']);

    return pluralTaskTermA === pluralTaskTermB ? pluralTaskTermA : 'tasks';
  }

  getDeleteSyncModal = () => {
    const {
      sync,
      onDeleteSync,
      containerA,
      containerB,
    } = this.props;
    const projectAName = containerA.get('displayName');
    const projectBName = containerB.get('displayName');
    const pluralTaskTerm = this.getPluralTaskTerm();

    return (
      <Modal
        className="link-list__delete-modal"
        confirmLabel="Confirm Delete"
        isOpen={ this.state.isSyncDeleteModalOpen }
        onCancel={ this.closeModal }
        onConfirm={ () => onDeleteSync(sync) }
        onRequestClose={ this.closeModal }
        title="Delete Mirror-sync?"
      >
        <div>
          <i>{ projectAName }</i> will stop syncing with <i>{ projectBName }</i>. This <strong>will not</strong> revert any changes
          or delete any { pluralTaskTerm }.
        </div>
      </Modal>
    );
  }

  render() {
    const {
      containerA,
      containerB,
      isSavingSync,
      isSiteAdmin,
      onSetAutoSync,
      onSetManualSync,
      providerA,
      providerB,
      readOnlyA,
      readOnlyB,
      showActions,
      sync,
      syncName,
    } = this.props;

    const mirrorIconSrc = `${process.env.PUBLIC_URL}/images/mirror_white.svg`;

    return (
      <Item className="link-item">
        { this.getDeleteSyncModal() }
        {
          !sync.isEmpty() && (
            <Indicator
              isAutoSync={ sync.get('isAutoSync') }
              isSuspended={ sync.get('isSuspended') }
              syncId={ sync.get('_id') }
            />
          )
        }

        <ItemWrapper>
          <ContainerIcon
            container={ containerA }
            iconSize="sm"
            provider={ providerA }
            tooltipPlacement="right"
          />
        </ItemWrapper>

        <SyncDirectionIcon
          color={color.dark.secondary}
          readOnlyA={readOnlyA}
          readOnlyB={readOnlyB}
        />

        <ItemWrapper>
          <ContainerIcon
            container={ containerB }
            iconSize="sm"
            provider={ providerB }
            tooltipPlacement="right"
          />
        </ItemWrapper>

        <LinkInfo>
          <LinkName
            isSiteAdmin={ isSiteAdmin }
            syncId={ sync.get('_id') }
            name={ syncName }
            restricted={ !!sync.get('restricted') }
            user={ sync.get('user') }
            isSuspended={ sync.get('isSuspended') }
          />
          {
            sync.get('kind') === linkTypes.KIND.TASK_SYNC && (
              <SecondLine>
                <Label labelType="hint">
                  <MirrorIcon>
                    <img
                      alt="Mirror logo"
                      height="16"
                      width="auto"
                      src={ mirrorIconSrc }
                    />
                  </MirrorIcon>
                </Label>
              </SecondLine>
            )
          }
        </LinkInfo>

        {
          !sync.isEmpty() && showActions && (
            <SyncActions
              isAutoSync={ sync.get('isAutoSync') }
              isSavingSync={ isSavingSync }
              isSiteAdmin={ isSiteAdmin }
              isSyncing={ sync.get('syncState') === linkTypes.LINK_SYNC_STATES.SYNCING }
              onDelete={ this.openModal }
              onSetAutoSync={ () => onSetAutoSync(sync.get('_id')) }
              onSetManualSync={ () => onSetManualSync(sync.get('_id')) }
              onSyncNow={ this.handleOnSyncNow }
              sync={ sync }
            />
          )
        }

        {
          sync.get('isSuspended') && (
            <ItemWrapper>
              <Href {...this.getRedirectionProps()}>
                <small>Disabled because your Unito account is suspended </small>
              </Href>
            </ItemWrapper>
          )
        }
      </Item>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  isEmbed: !!getEmbedName(state),
  isSavingSync: getIsSavingSync(state),
  providerA: getProviderById(state, { providerId: ownProps.providerIdA }),
  providerB: getProviderById(state, { providerId: ownProps.providerIdB }),
  syncingIds: getSyncingLinkIds(state),
});

const notifyCommonProps = {
  closeButton: true,
  dismissible: true,
  position: 'tr',
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  onDeleteSync: async (sync) => {
    await dispatch(linkActions.deleteLink(sync.get('_id')));
    const isLastSync = ownProps.nbSyncs === 1;
    dispatch(notify({
      ...notifyCommonProps,
      title: isLastSync ? 'Sync deleted' : '',
      message: isLastSync
        ? `You just deleted the last Mirror-sync within your <i>${ownProps.multisyncName}</i> Multi-sync. Do you want to delete the <strong>entire</strong> Multi-sync?` // eslint-disable-line
        : 'Sync deleted',
      status: 'success',
      dismissAfter: isLastSync ? 0 : 5000,
      dismissible: !isLastSync,
      closeButton: !isLastSync,
      allowHTML: true,
      buttons: isLastSync ? [
        {
          name: 'Keep Multi-sync',
        },
        {
          name: 'Delete Multi-sync',
          onClick: () => dispatch(multisyncActions.deleteMultisync(sync.get('multisync'))),
        },
      ] : [],
    }));
  },
  onSetAutoSync: async (syncId) => {
    const { rejectionReasons } = await dispatch(linkActions.setAutoSyncLink(syncId));

    if (rejectionReasons.length) {
      dispatch(linkActions.notifyAboutFeatureEnforcement(rejectionReasons));
      return;
    }

    dispatch(notify({
      ...notifyCommonProps,
      title: 'Auto sync turned on',
      message: 'Your changes will now automatically be synced at the speed indicated on your subscribed plan',
      status: 'info',
    }));
  },
  onSetManualSync: (syncId) => {
    dispatch(linkActions.setManualSyncLink(syncId));

    dispatch(notify({
      ...notifyCommonProps,
      title: 'Auto sync turned off',
      message: 'New changes will no longer be automatically synced. You still can force a refresh on your sync by clicking "Sync now"',
      status: 'info',
    }));
  },
  onSyncNow: (syncId) => {
    dispatch(linkActions.syncLink(syncId));
    dispatch(notify({
      ...notifyCommonProps,
      title: 'Syncing...',
      message: 'Hang tight while your sync refreshes. This may take a couple of minutes',
      status: 'success',
    }));
  },
  getSyncingStates: () => dispatch(linkActions.getSyncingStates()),
});

export default connect(mapStateToProps, mapDispatchToProps)(LinkItem);



// WEBPACK FOOTER //
// ./src/components/LinkItem/LinkItem.jsx