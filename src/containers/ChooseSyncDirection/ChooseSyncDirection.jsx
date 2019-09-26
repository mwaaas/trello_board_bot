import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { addNotification as notify } from 'reapop';

import { fieldTypes } from '../../consts';
import { ContainerIcon, Title, SyncDirectionPicker } from '../../components';
import { linkActions } from '../../actions';
import {
  getContainer,
  getProvider,
  getProviderCapabilities,
  getCurrentSyncDirection,
} from '../../reducers';

class ChooseSyncDirection extends Component {
  static propTypes = {
    A: PropTypes.object.isRequired,
    B: PropTypes.object.isRequired,
    containerA: PropTypes.instanceOf(Map).isRequired,
    containerB: PropTypes.instanceOf(Map).isRequired,
    changeAllFieldAssociationTarget: PropTypes.func.isRequired,
    currentDirection: PropTypes.oneOf(Object.values(fieldTypes.TARGET)).isRequired,
    isEdit: PropTypes.bool.isRequired,
    providerA: PropTypes.instanceOf(Map).isRequired,
    providerB: PropTypes.instanceOf(Map).isRequired,
    termsA: PropTypes.instanceOf(Map).isRequired,
    termsB: PropTypes.instanceOf(Map).isRequired,
  };

  state = {
    showedWarning: false,
  };

  componentWillMount() {
    const { A, B } = this.props;

    const readOnlyA = A.readOnly.input.value;
    const readOnlyB = B.readOnly.input.value;
    let initialDirection = fieldTypes.TARGET.BOTH;
    if (readOnlyA) {
      initialDirection = fieldTypes.TARGET.B;
    }

    if (readOnlyB) {
      initialDirection = fieldTypes.TARGET.A;
    }

    this.setState({ initialDirection });
  }

  onChangeDirection = (newTarget) => {
    const {
      A,
      B,
      changeAllFieldAssociationTarget,
      isEdit,
      warnUser,
    } = this.props;
    const { initialDirection, showedWarning } = this.state;
    A.readOnly.input.onChange(newTarget === fieldTypes.TARGET.B);
    B.readOnly.input.onChange(newTarget === fieldTypes.TARGET.A);

    // Only show the warning message once.
    const showWarning = !showedWarning
      && (isEdit)
      && newTarget !== fieldTypes.TARGET.BOTH
      && newTarget !== initialDirection;

    if (showWarning) {
      warnUser();
      this.setState({ showedWarning: true });
    }

    changeAllFieldAssociationTarget(newTarget);
  }

  getHelpText = (target) => {
    const {
      containerA, containerB, providerA, providerB, termsA, termsB,
    } = this.props;

    const taskTermA = termsA.getIn(['task', 'plural'], 'tasks');
    const taskTermB = termsB.getIn(['task', 'plural'], 'tasks');
    const providerNameA = providerA.get('displayName', '1st tool');
    const providerNameB = providerB.get('displayName', '2nd tool');
    const containerNameA = <strong>{ containerA.get('displayName', '1st project') }</strong>;
    const containerNameB = <strong>{ containerB.get('displayName', '2nd project') }</strong>;
    let fullNameA = <strong>{ providerNameA } { containerA.get('displayName') }</strong>;
    let fullNameB = <strong>{ providerNameB } { containerB.get('displayName') }</strong>;

    if (providerNameA === providerNameB) {
      fullNameA = containerNameA;
      fullNameB = containerNameB;
    }

    if (target === fieldTypes.TARGET.B) {
      return (
        <span>
          { fullNameA } { taskTermA } are copied to { ' ' } { fullNameB } { taskTermB }.
          Nothing syncs from { containerNameB } to { containerNameA }.
        </span>
      );
    }

    if (target === fieldTypes.TARGET.A) {
      return (
        <span>
          { fullNameB } { taskTermB } are copied to { fullNameA } { taskTermA }.
          Nothing syncs from { containerNameA } to { containerNameB }.
        </span>
      );
    }

    return (
      <span>
        { fullNameA } { taskTermA } and { fullNameB } { taskTermB } { ' ' }
        sync in both directions. Changes made in either project copy to the other.
      </span>
    );
  }

  render() {
    const {
      containerA,
      containerB,
      currentDirection,
      providerA,
      providerB,
    } = this.props;

    return (
      <div className="choose-sync-direction text-center">
        <Title type="h3">
          Sync direction
        </Title>

        <div className="row">
          <div className="col-xs-4">
            {
              !containerA.isEmpty()
              && <ContainerIcon
                container={ containerA }
                iconSize="sm"
                linkStyle="subtleLink"
                maxNameLength={ 20 }
                provider={ providerA }
                showName
              />
            }
          </div>

          <div className="col-xs-4">
            <SyncDirectionPicker
              size="md"
              btnStyle="dark"
              onClick={ this.onChangeDirection }
              selectedTarget={ currentDirection }
              displayToolTip={ this.getHelpText }
            />
          </div>

          <div className="col-xs-4">
            {
              !containerB.isEmpty()
              && <ContainerIcon
                container={ containerB }
                iconSize="sm"
                linkStyle="subtleLink"
                maxNameLength={ 20 }
                provider={ providerB }
                showName
              />
            }
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  containerA: getContainer(state, { containerSide: 'A' }),
  containerB: getContainer(state, { containerSide: 'B' }),
  currentDirection: getCurrentSyncDirection(state),
  providerA: getProvider(state, { containerSide: 'A' }),
  providerB: getProvider(state, { containerSide: 'B' }),
  termsA: getProviderCapabilities(state, { containerSide: 'A' }, 'terms'),
  termsB: getProviderCapabilities(state, { containerSide: 'B' }, 'terms'),
});

const mapDispatchToProps = dispatch => ({
  warnUser: () => {
    dispatch(notify({
      closeButton: true,
      title: 'Heads up !',
      message: 'Changing sync direction may disable mapped fields. Look at the “Map fields” tab for more info',
      status: 'warning',
      position: 'tr',
      dismissible: true,
      dismissAfter: 0,
    }));
  },
  changeAllFieldAssociationTarget: (target) => {
    dispatch(linkActions.changeAllFieldAssociationTarget(target));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ChooseSyncDirection);



// WEBPACK FOOTER //
// ./src/containers/ChooseSyncDirection/ChooseSyncDirection.jsx