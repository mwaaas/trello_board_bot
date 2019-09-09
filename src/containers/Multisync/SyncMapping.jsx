import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Map } from 'immutable';

import { Section, Select } from '../../components';
import { multisyncActions } from '../../actions';
import { ContainerDisplay } from '../../containers';
import { getFieldValue } from '../../reducers';
import { multisyncTypes, fieldTypes } from '../../consts';

import {
  RelativeCard,
  ContainerDisplayWrapper,
  MultisyncFieldAssociationList,
  TextWrapper,
} from '.';

const FieldWrapper = styled.div`
  display: inline-block;
  vertical-align: middle;
  width: 340px;
`;

const SpacingLeftMargin = styled.span`
  margin-left: .25rem;
`;

const SpacingRightMargin = styled.span`
  margin-right: .25rem;
`;


export class SyncMapping extends Component {
  static propTypes = {
    leafProvider: PropTypes.instanceOf(Map).isRequired,
    leafProviderIdentityId: PropTypes.string,
    rootContainerId: PropTypes.string,
    rootProvider: PropTypes.instanceOf(Map).isRequired,
    rootProviderIdentityId: PropTypes.string,
    topology: PropTypes.oneOf(Object.values(multisyncTypes.TOPOLOGIES)).isRequired,
  }

  state = {
    selectedContainerId: null,
  };

  renderOption = ({ value }) => {
    const { leafProviderIdentityId, topology } = this.props;
    return (
      <ContainerDisplay
        containerId={ value }
        containerSide={ topology === multisyncTypes.TOPOLOGIES.SPLIT ? 'B' : 'A' }
        providerIdentityId={ leafProviderIdentityId }
        type="icon"
        noUrl
      />
    );
  }

  handleOnChangeContainerId = (containerId) => {
    const { copyDefaultFieldAssociations } = this.props;
    this.setState(
      { selectedContainerId: containerId },
      () => copyDefaultFieldAssociations(containerId, this.getTarget()),
    );
  }

  getSyncDirection = () => {
    const leaf = this.props.leaves.find(l => l.containerId === this.state.selectedContainerId);
    return leaf.syncDirection;
  }


  getTarget = () => {
    const target = this.getSyncDirection(this.state.selectedContainerId) === multisyncTypes.SYNC_DIRECTION.TWO_WAY
      ? fieldTypes.TARGET.BOTH
      : fieldTypes.TARGET.B;

    return target;
  }

  getContainerOptions = () => {
    const { leaves } = this.props;
    return leaves.map(leaf => ({ value: leaf.containerId }));
  }

  render() {
    const {
      leafProvider,
      leafProviderIdentityId,
      rootContainerId,
      rootProvider,
      rootProviderIdentityId,
      topology,
    } = this.props;
    const { selectedContainerId } = this.state;
    const leavesContainersOptions = this.getContainerOptions();

    return (
      <div className="sync-mapping">
        <Section>
          <RelativeCard>
            {
              topology === multisyncTypes.TOPOLOGIES.SPLIT ? (
                <TextWrapper>
                  I want to customize the field mapping between
                  <ContainerDisplayWrapper>
                    <ContainerDisplay
                      containerId={ rootContainerId }
                      containerSide="A"
                      noUrl
                      providerIdentityId={ rootProviderIdentityId }
                      type="icon"
                    />
                  </ContainerDisplayWrapper>
                  <SpacingRightMargin>and</SpacingRightMargin>
                  <FieldWrapper>
                    <Select
                      clearable={ false }
                      onChange={ this.handleOnChangeContainerId }
                      optionRenderer={ this.renderOption }
                      options={ leavesContainersOptions }
                      placeholder='Select your project'
                      simpleValue
                      value={ selectedContainerId }
                      valueRenderer={ this.renderOption }
                    />
                  </FieldWrapper>
                </TextWrapper>
              ) : (
                <TextWrapper>
                  I want to customize the field mapping between
                  <FieldWrapper>
                    <Select
                      clearable={ false }
                      onChange={ this.handleOnChangeContainerId }
                      optionRenderer={ this.renderOption }
                      options={ leavesContainersOptions }
                      placeholder='Select your project'
                      simpleValue
                      value={ selectedContainerId }
                      valueRenderer={ this.renderOption }
                    />
                  </FieldWrapper>
                  <SpacingLeftMargin>and</SpacingLeftMargin>
                  <ContainerDisplayWrapper>
                    <ContainerDisplay
                      containerId={ rootContainerId }
                      containerSide="B"
                      noUrl
                      providerIdentityId={ rootProviderIdentityId }
                      type="icon"
                    />
                  </ContainerDisplayWrapper>
                </TextWrapper>
              )
            }
          </RelativeCard>
        </Section>

        {
          selectedContainerId && (
            <MultisyncFieldAssociationList
              defaultTarget={ this.getTarget() }
              leafContainerId={ selectedContainerId }
              leafProviderIdentityId={ leafProviderIdentityId }
              leafProvider={ leafProvider }
              rootContainerId={ rootContainerId }
              rootProvider={ rootProvider }
              rootProviderIdentityId={ rootProviderIdentityId }
              syncDirection={ this.getSyncDirection() }
              topology={ topology }
            />
          )
        }

      </div>
    );
  }
}

const mapStateToProps = state => ({
  leaves: getFieldValue(state, 'filters', 'multisyncForm'),
});

const mapDispatchToProps = dispatch => ({
  copyDefaultFieldAssociations: (containerId, target) => {
    dispatch(multisyncActions.copyDefaultFieldAssociationsByContainer(containerId, target));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SyncMapping);



// WEBPACK FOOTER //
// ./src/containers/Multisync/SyncMapping.jsx