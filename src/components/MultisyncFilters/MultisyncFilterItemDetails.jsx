import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Map } from 'immutable';
import { connect } from 'react-redux';

import {
  Icon,
  Label,
  RadioButtonGroup,
  RadioButton,
  Section,
  Title,
  ToggleFormInput,
} from '../../components';
import { multisyncActions } from '../../actions';
import { multisyncTypes } from '../../consts';
import { ContainerDisplay } from '../../containers';
import { getProviderCapabilitiesByProviderIdentityId } from '../../reducers';

const TwoWaySync = (
  <span>
    <Icon name="exchange" /> Two-way
  </span>
);

const OneWaySync = (
  <span>
    <Icon name="long-arrow-right" /> One-way
  </span>
);

const MarginTop = styled.div`
  .radio-button {
    margin-top: 1rem;
  }
`;


const SyncDirection = ({ input, onChangeSyncDirection }) => (
  <div className="sync-direction">
    <Title type="h3">
      Sync direction
    </Title>

    Sync every task and its related information

    <MarginTop>
      <RadioButtonGroup {...input} onChange={ onChangeSyncDirection }>
        <RadioButton
          label={ TwoWaySync }
          value={ multisyncTypes.SYNC_DIRECTION.TWO_WAY }
        />
        <RadioButton
          value={ multisyncTypes.SYNC_DIRECTION.ONE_WAY }
          label={ OneWaySync }
        />
      </RadioButtonGroup>
    </MarginTop>
  </div>
);

class MultisyncFilterItemDetails extends Component {
  static propTypes = {
    changeAllFieldAssociationTarget: PropTypes.func.isRequired,
    filters: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired,
    leafContainerId: PropTypes.string.isRequired,
    leafProviderIdentityId: PropTypes.string.isRequired,
    pcdFields: PropTypes.instanceOf(Map).isRequired,
    rootContainerId: PropTypes.string.isRequired,
    rootProviderIdentityId: PropTypes.string.isRequired,
    topology: PropTypes.oneOf(Object.values(multisyncTypes.TOPOLOGIES)).isRequired,
  };

  onChangeSyncDirection = (newSyncDirection) => {
    const {
      changeAllFieldAssociationTarget,
      filters,
      index,
      topology,
    } = this.props;

    const oneWayTarget = topology === multisyncTypes.TOPOLOGIES.SPLIT ? 'B' : 'A';
    const target = newSyncDirection === multisyncTypes.SYNC_DIRECTION.TWO_WAY ? 'both' : oneWayTarget;
    const containerId = filters[index].containerId.input.value;

    changeAllFieldAssociationTarget(containerId, target);
    filters[index].syncDirection.input.onChange(newSyncDirection);
  }

  render() {
    const {
      filters,
      index,
      leafContainerId,
      leafProviderIdentityId,
      pcdFields,
      rootContainerId,
      rootProviderIdentityId,
      terms,
      topology,
    } = this.props;

    return (
      <div className="row">
        <div className="col-md-6">
          <Section>
            <SyncDirection
              {...filters[index].syncDirection}
              onChangeSyncDirection={ this.onChangeSyncDirection }
            />
          </Section>
        </div>
        <div className="col-md-6">
          {
            pcdFields.has('labels') && topology === multisyncTypes.TOPOLOGIES.SPLIT && (
              <Section>
                <ToggleFormInput {...filters[index].applyIncomingTag}>
                  <Title type="h3">
                    Turn on auto { pcdFields.getIn(['labels', 'displayName', 'singular']) }
                  </Title>
                </ToggleFormInput>
                All { terms.getIn(['task', 'plural']) } coming in { ' ' }

                <ContainerDisplay
                  containerId={ leafContainerId }
                  containerSide={ topology === multisyncTypes.TOPOLOGIES.SPLIT ? 'B' : 'A' }
                  providerIdentityId={ leafProviderIdentityId }
                  type="name"
                  shortenLength={ 40 }
                />

                { ' ' } will be { pcdFields.getIn(['labels', 'displayName', 'singular']) }ed with { ' ' }
                <Label labelType="hint">
                  <ContainerDisplay
                    containerId={rootContainerId}
                    containerSide={ topology === multisyncTypes.TOPOLOGIES.SPLIT ? 'A' : 'B' }
                    providerIdentityId={rootProviderIdentityId}
                    type="name"
                    shortenLength={ 40 }
                  />
                </Label>
                { '. ' }
                Know that every { terms.getIn(['task', 'singular']) } with that label will be synced to { ' ' }
                <ContainerDisplay
                  containerId={rootContainerId}
                  containerSide={ topology === multisyncTypes.TOPOLOGIES.SPLIT ? 'A' : 'B' }
                  providerIdentityId={rootProviderIdentityId}
                  type="name"
                  shortenLength={ 40 }
                />.
              </Section>
            )
          }

          <Section>
            <ToggleFormInput {...filters[index].isAutoSync}>
              <Title type="h3">
                Turn on auto sync
              </Title>
            </ToggleFormInput>
            Information will be automatically synced
          </Section>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  pcdFields: getProviderCapabilitiesByProviderIdentityId(state, { providerIdentityId: ownProps.leafProviderIdentityId }, 'fields'),
  terms: getProviderCapabilitiesByProviderIdentityId(state, { providerIdentityId: ownProps.leafProviderIdentityId }, 'terms'),
});

const mapDispatchToProps = dispatch => ({
  changeAllFieldAssociationTarget: (containerId, syncDirection, topology) => {
    dispatch(multisyncActions.changeAllFieldAssociationTarget(containerId, syncDirection, topology));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MultisyncFilterItemDetails);



// WEBPACK FOOTER //
// ./src/components/MultisyncFilters/MultisyncFilterItemDetails.jsx