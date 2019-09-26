import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Map, List } from 'immutable';
import styled from 'styled-components';

import { containerActions } from '../../actions';
import { ContainerIcon, SyncDirectionIcon, IconHoverTooltip } from '../../components';
import {
  getContainer,
  getContainerFieldValue,
  getProvider,
  getProviderCapabilities,
} from '../../reducers';


const Flex = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Side = styled.div`
  flex: 10;
  text-align: center;
`;

const Arrow = styled.div`
  flex: 2;
  text-align: center;
`;

const MarginLeft = styled.span`
  margin-left: 8px;
`;

class ContainersSync extends Component {
  static propTypes = {
    containerA: PropTypes.instanceOf(Map).isRequired,
    containerB: PropTypes.instanceOf(Map).isRequired,
    isEdit: PropTypes.bool,
    providerA: PropTypes.instanceOf(Map).isRequired,
    providerB: PropTypes.instanceOf(Map).isRequired,
    termsA: PropTypes.instanceOf(Map).isRequired,
    termsB: PropTypes.instanceOf(Map).isRequired,
  };

  componentDidMount() {
    const { dispatch, containerA, containerB } = this.props;
    const containers = { A: containerA, B: containerB };
    if (containerA.get('isLoading') || containerB.get('isLoading')) {
      return;
    }

    ['A', 'B'].forEach((containerSide) => {
      const container = containers[containerSide];
      if (container.get('syncedIn') === undefined) {
        dispatch(containerActions.getContainerById(container.get('providerIdentityId'), container.get('id'), containerSide));
      }
    });
  }

  render() {
    const {
      containerA,
      containerB,
      isEdit,
      providerA,
      providerB,
      readOnlyA,
      readOnlyB,
      termsA,
      termsB,
    } = this.props;

    const minSize = isEdit ? 1 : 0;
    const displayMultiSyncIconA = containerA.get('syncedIn', List()).size > minSize;
    const displayMultiSyncIconB = containerB.get('syncedIn', List()).size > minSize;

    return (
      <Flex>
        <Side>
          <ContainerIcon
            container={ containerA }
            provider={ providerA }
            showName
            terms={ termsA }
          />
          {
            displayMultiSyncIconA && (
              <MarginLeft>
                <IconHoverTooltip
                  iconClassName="fa-rotate-270"
                  iconName="random"
                  placement="top"
                >
                  { containerA.get('displayName') } is synced to other projects.
                  Multi-way sync projects share tasks to many projects automatically based on filtering rules.
                </IconHoverTooltip>
              </MarginLeft>
            )
          }
        </Side>

        <Arrow>
          <SyncDirectionIcon readOnlyA={ readOnlyA } readOnlyB={ readOnlyB } size="lg" />
        </Arrow>

        <Side>
          <ContainerIcon
            container={ containerB }
            provider={ providerB }
            showName
            terms={ termsB }
          />
          {
            displayMultiSyncIconB
            && <MarginLeft>
              <IconHoverTooltip
                iconName="random"
                placement="top"
                iconClassName="fa-rotate-270"
              >
                { containerB.get('displayName') } is synced to other projects.
                Multi-way sync projects share tasks to many projects automatically based on filtering rules.
              </IconHoverTooltip>
            </MarginLeft>
          }
        </Side>
      </Flex>
    );
  }
}


const mapStateToProps = state => ({
  containerA: getContainer(state, { containerSide: 'A' }),
  containerB: getContainer(state, { containerSide: 'B' }),
  providerA: getProvider(state, { containerSide: 'A' }),
  providerB: getProvider(state, { containerSide: 'B' }),
  termsA: getProviderCapabilities(state, { containerSide: 'A' }, 'terms'),
  termsB: getProviderCapabilities(state, { containerSide: 'B' }, 'terms'),
  readOnlyA: !!getContainerFieldValue(state, { containerSide: 'A' }, 'readOnly'),
  readOnlyB: !!getContainerFieldValue(state, { containerSide: 'B' }, 'readOnly'),
});

export default connect(mapStateToProps)(ContainersSync);



// WEBPACK FOOTER //
// ./src/containers/ContainersSync/ContainersSync.jsx