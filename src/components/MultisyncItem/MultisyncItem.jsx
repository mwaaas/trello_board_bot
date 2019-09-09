import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import { addNotification as notify } from 'reapop';

import { color, fontWeight, fontSize } from '../../theme';
import {
  Button,
  Icon,
  Label,
  LinkItem,
  ProviderIcon,
  SyncDirectionIcon,
  Modal,
} from '../../components';
import { linkActions, multisyncActions } from '../../actions';
import { multisyncTypes } from '../../consts';
import {
  getProviderById,
  areAllSyncsAutoSync,
  areAllSyncsSyncing,
  getSyncingLinkIds,
} from '../../reducers';

import SyncActions from '../LinkItem/SyncActions';
import LinkName from '../LinkItem/LinkName';

const Item = styled.div`
  margin-bottom: 1rem;

  .link-item {
    margin-top: .25rem;
    margin-bottom: 0;
  }
`;

const Multisync = styled.div`
  align-items: center;
  background-color: ${color.light.primary};
  border-radius: 4px;
  border: 1px solid ${color.dark.whisper};
  display: flex;
  min-height: 60px;
  padding: 15px 12px;
  position: relative;
`;

const MultisyncInfo = styled.div`
  margin-left: 1rem;
  flex-grow: 1;
  flex-shrink: 1;
`;

const ItemWrapper = styled.div`
  margin-left: .5rem;
  margin-right: .5rem;
`;

const SyncQty = styled.div`
  font-size: ${fontSize.small};
  font-weight: ${fontWeight.light};
  margin-left: 1rem;
  text-transform: uppercase;
`;

const SecondLine = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
`;

const LinkItemWrapper = styled.div`
  margin-left: 7rem;
`;


class MultisyncItem extends Component {
  static propTypes = {
    getSyncingStates: PropTypes.func.isRequired,
    isMultisyncAutoSync: PropTypes.bool.isRequired,
    isMultisyncSyncing: PropTypes.bool.isRequired,
    isSiteAdmin: PropTypes.bool.isRequired,
    multisync: PropTypes.instanceOf(Map).isRequired,
    onDeleteMultisync: PropTypes.func.isRequired,
    onSetAutoMultisync: PropTypes.func.isRequired,
    onSetManualMultisync: PropTypes.func.isRequired,
    onSyncNow: PropTypes.func.isRequired,
    providerLeaves: PropTypes.instanceOf(Map).isRequired,
    providerRoot: PropTypes.instanceOf(Map).isRequired,
    syncingIds: PropTypes.instanceOf(Map).isRequired,
    syncsByMultisyncId: PropTypes.instanceOf(Map).isRequired,
  };

  state = {
    showSyncs: true,
    isMultisyncDeleteModalOpen: false,
  };

  static defaultProps = {
    isSiteAdmin: false,
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
    this.props.onSyncNow();
    this.startPolling();
  }

  openModal = () => {
    this.setState({ isMultisyncDeleteModalOpen: true });
  }

  closeModal = () => {
    this.setState({ isMultisyncDeleteModalOpen: false });
  }

  getDeleteMultisyncModal = () => {
    const {
      onDeleteMultisync,
      providerRoot,
      providerLeaves,
    } = this.props;

    const rootTerms = providerRoot.getIn(['capabilities', 'terms']);
    const leavesTerms = providerLeaves.getIn(['capabilities', 'terms']);

    const rootPluralContainerTerm = rootTerms.getIn(['container', 'plural']);
    const leavesPluralContainerTerm = leavesTerms.getIn(['container', 'plural']);

    const containerTerm = rootPluralContainerTerm === leavesPluralContainerTerm ? rootPluralContainerTerm : 'projects';

    const rootPluralTaskTerm = rootTerms.getIn(['task', 'plural']);
    const leavesPluralTaskTerm = leavesTerms.getIn(['task', 'plural']);

    const taskTerm = rootPluralTaskTerm === leavesPluralTaskTerm ? rootPluralTaskTerm : 'tasks';

    return (
      <Modal
        confirmLabel="Confirm delete"
        isOpen={ this.state.isMultisyncDeleteModalOpen }
        onCancel={ this.closeModal }
        onConfirm={ onDeleteMultisync }
        onRequestClose={ this.closeModal }
        title="Delete Multi-sync?"
      >
        All { containerTerm } in this Multi-sync will stop syncing.
        This <strong>will not </strong> revert any changes or delete any { taskTerm }.
      </Modal>
    );
  }

  render() {
    const {
      isMultisyncAutoSync,
      isMultisyncSyncing,
      isSiteAdmin,
      multisync,
      onSetAutoMultisync,
      onSetManualMultisync,
      providerLeaves,
      providerRoot,
      syncsByMultisyncId,
    } = this.props;
    const { showSyncs } = this.state;
    const topology = multisync.get('topology');
    const nbSyncs = syncsByMultisyncId.get(multisync.get('_id')) ? syncsByMultisyncId.get(multisync.get('_id')).size : 0;

    return (
      <Item className="multisync-item">
        { this.getDeleteMultisyncModal() }
        <Multisync>
          <ItemWrapper>
            <ProviderIcon
              provider={ topology === multisyncTypes.TOPOLOGIES.SPLIT ? providerRoot : providerLeaves }
              size="sm"
            />
          </ItemWrapper>

          <SyncDirectionIcon
            color={color.dark.secondary}
            multisync
            readOnlyA
            readOnlyB
          />

          <ItemWrapper>
            <ProviderIcon
              provider={ topology === multisyncTypes.TOPOLOGIES.SPLIT ? providerLeaves : providerRoot }
              size="sm"
            />
          </ItemWrapper>

          <MultisyncInfo className="multisync-item__multisync-info">
            <LinkName
              isSiteAdmin={ isSiteAdmin }
              syncId={ multisync.get('_id') }
              name={ multisync.get('name') }
              restricted={ !!multisync.get('restricted') }
              user={ multisync.get('user') }
              isSuspended={ multisync.get('isSuspended') }
              isMultisync
            />
            <SecondLine>
              <Label labelType="hint">
                MULTI-SYNC
              </Label>
              <SyncQty>
                { `${nbSyncs} ${nbSyncs > 1 ? 'syncs' : 'sync'}` }
              </SyncQty>
              {
                nbSyncs > 0 && (
                  <Button
                    type="button"
                    size="xs"
                    btnStyle="link"
                    className="dropdown__btn"
                    onClick={ () => this.setState({ showSyncs: !showSyncs }) }
                  >
                    <Icon name={ showSyncs ? 'chevron-up' : 'chevron-down' } />
                  </Button>
                )
              }
            </SecondLine>
          </MultisyncInfo>
          <SyncActions
            isSiteAdmin={ isSiteAdmin }
            onSetAutoSync={ onSetAutoMultisync }
            onSetManualSync={ onSetManualMultisync }
            onSyncNow={ this.handleOnSyncNow }
            sync={ multisync }
            isAutoSync={ isMultisyncAutoSync }
            isSyncing={ isMultisyncSyncing }
            onDelete={ this.openModal }
            isFromMultisyncItem
          />
        </Multisync>

        {
          showSyncs && syncsByMultisyncId.get(`${multisync.get('_id')}`, Map()).valueSeq().map(sync => (
            <LinkItemWrapper key={ sync.get('_id') }>
              <LinkItem
                isSiteAdmin={ isSiteAdmin }
                sync={ sync }
                showActions
                containerA={ sync.getIn(['A', 'container']) }
                containerB={ sync.getIn(['B', 'container']) }
                providerIdA={ sync.getIn(['A', 'providerIdentity', 'providerId']) }
                providerIdB={ sync.getIn(['B', 'providerIdentity', 'providerId']) }
                readOnlyA={ !!sync.getIn(['syncSettings', 'A', 'readOnly']) }
                readOnlyB={ !!sync.getIn(['syncSettings', 'B', 'readOnly']) }
                syncName={ sync.get('name') || sync.getIn(['A', 'container', 'displayName']) }
                nbSyncs={ nbSyncs }
                multisyncName={ multisync.get('name') }
              />
            </LinkItemWrapper>
          )).toArray()
        }
      </Item>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const providerIdRoot = ownProps.multisync.getIn(['root', 'providerIdentity', 'providerId']);
  const providerIdLeaves = ownProps.multisync.getIn(['leaves', 'providerIdentity', 'providerId']);

  return {
    syncingIds: getSyncingLinkIds(state),
    isMultisyncAutoSync: areAllSyncsAutoSync(state, ownProps.multisync.get('_id')),
    isMultisyncSyncing: areAllSyncsSyncing(state, ownProps.multisync.get('_id')),
    providerRoot: getProviderById(state, { providerId: providerIdRoot }),
    providerLeaves: getProviderById(state, { providerId: providerIdLeaves }),
  };
};

const notifyCommonProps = {
  closeButton: true,
  dismissible: true,
  position: 'tr',
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const multisyncId = ownProps.multisync.get('_id');
  const syncsOfMultisync = ownProps.syncsByMultisyncId.get(multisyncId, List());
  const syncIds = syncsOfMultisync.map(sync => sync.get('_id'));

  return {
    onDeleteMultisync: async () => {
      await dispatch(multisyncActions.deleteMultisync(multisyncId));
      dispatch(notify({
        ...notifyCommonProps,
        message: 'Multi-sync deleted',
        status: 'success',
      }));
    },
    onSetAutoMultisync: async () => {
      const responses = await dispatch(linkActions.setAutoSyncMultisyncLinks(syncIds));
      responses.forEach(({ rejectionReasons }) => {
        if (rejectionReasons.length) {
          dispatch(linkActions.notifyAboutFeatureEnforcement(rejectionReasons));
        }
      });

      dispatch(notify({
        ...notifyCommonProps,
        title: 'Auto sync turned on',
        message: 'Your changes will now automatically be synced at the speed indicated on your subscribed plan',
        status: 'info',
      }));
    },
    onSetManualMultisync: () => {
      syncIds.forEach(syncId => dispatch(linkActions.setManualSyncLink(syncId)));
      dispatch(notify({
        ...notifyCommonProps,
        title: 'Auto sync turned off',
        message: 'New changes will no longer be automatically synced. You still can force a refresh on your sync by clicking "Sync now"',
        status: 'info',
      }));
    },
    onSyncNow: () => {
      syncIds.forEach(syncId => dispatch(linkActions.syncLink(syncId)));
      dispatch(notify({
        ...notifyCommonProps,
        title: 'Syncing...',
        message: 'Hang tight while your multi-sync refreshes. This may take a couple of minutes',
        status: 'success',
      }));
    },
    getSyncingStates: () => dispatch(linkActions.getSyncingStates()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MultisyncItem);



// WEBPACK FOOTER //
// ./src/components/MultisyncItem/MultisyncItem.jsx