import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map } from 'immutable';
import styled from 'styled-components';

import { ProviderIcon, ContainerIcon, SyncDirectionIcon } from '../../components';


const Flex = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Side = styled.div`
  flex: 4;
  text-align: center;

  .provider-icon {
    display: inline-block;
  }
`;

const Icon = styled.div`
  flex: 2;
  text-align: center;
`;


export default class MultisyncContainersSync extends Component {
  static propTypes = {
    containerA: PropTypes.instanceOf(Map),
    containerB: PropTypes.instanceOf(Map),
    providerA: PropTypes.instanceOf(Map).isRequired,
    providerB: PropTypes.instanceOf(Map).isRequired,
    syncDirection: PropTypes.string,
  };

  renderSide = (displayContainerIcon, containerSide) => {
    if (displayContainerIcon) {
      return (
        <ContainerIcon
          container={ this.props[`container${containerSide}`] }
          provider={ this.props[`provider${containerSide}`] }
          showName
        />
      );
    }

    return (
      <ProviderIcon
        provider={ this.props[`provider${containerSide}`] }
        size="md"
        showName
      />
    );
  }

  render() {
    const {
      containerA,
      containerB,
      syncDirection,
    } = this.props;

    const displayContainerIcon = containerA && containerB;

    return (
      <Flex>
        <Side>
          { this.renderSide(displayContainerIcon, 'A') }
        </Side>

        <Icon>
          { displayContainerIcon && <SyncDirectionIcon readOnlyA={ syncDirection === 'oneWay' } readOnlyB={ false } size="md" /> }
        </Icon>

        <Side>
          { this.renderSide(displayContainerIcon, 'B') }
        </Side>
      </Flex>
    );
  }
}



// WEBPACK FOOTER //
// ./src/containers/Multisync/MultisyncContainersSync.jsx