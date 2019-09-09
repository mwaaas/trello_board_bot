import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { List } from 'immutable';

import {
  DeleteButtonWithConfirm,
  Button,
  Card,
  Icon,
} from '../../components';
import {
  ContainerDisplay,
  ContainersSelect,
  FieldValuesSelect,
  OpenIntercomBubble,
} from '../../containers';
import { multisyncTypes } from '../../consts';
import { color } from '../../theme';

import { MultisyncFilterItemDetails } from '.';


const Actions = styled.div`
  flex: 3;
`;

const FieldWrapperFieldValue = styled.div`
  flex: 3;
`;

const JoinText = styled.div`
  flex: 2;
  padding-left: .5rem;
  padding-right: .5rem;
  text-align: center;
`;

const FieldWrapperContainer = styled.div`
  flex: 5;
`;

const Flex = styled.div`
  display: flex;
  align-items: center;

  .form-group {
    margin-bottom: 0;
  }
`;

const Item = styled.div`
  margin-bottom: 0.5rem;

  .multisync-item {
    position: relative;
  }
`;

const ButtonsWrapper = styled.div`
  bottom: 0;
  position: absolute;
  right: 0;
  top: 0;

  .btn {
    height: 100%;
  }
`;

const ErrorMessage = styled.div`
  color: ${color.brand.error};
  margin-bottom: 1rem;
`;


export default class MultisyncFilterItem extends Component {
  static propTypes = {
    displayDetail: PropTypes.bool.isRequired,
    filters: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired,
    leaves: PropTypes.object.isRequired,
    onDeleteFilterItem: PropTypes.func.isRequired,
    onDisplayDetail: PropTypes.func.isRequired,
    root: PropTypes.object.isRequired,
    selectedFilters: PropTypes.array.isRequired,
    topology: PropTypes.oneOf(Object.values(multisyncTypes.TOPOLOGIES)).isRequired,
  };

  handleChangeContainerValue = (...props) => {
    const { filters, index } = this.props;
    filters[index].containerId.input.onChange(...props);
  }

  handleClickDelete = () => {
    const { onDeleteFilterItem } = this.props;
    this.setState({
      displayDetail: false,
    });
    onDeleteFilterItem();
  }

  getFieldValueIdsToExclude = () => {
    const { selectedFilters } = this.props;
    return selectedFilters.map(entry => entry.fieldValueId.id);
  }

  getContainerIdsToExclude = () => {
    const { root, selectedFilters } = this.props;
    return selectedFilters
      .map(entry => entry.containerId)
      .concat(root.containerId.input.value);
  }

  render() {
    const {
      displayDetail,
      filters,
      index,
      leaves,
      onDeleteFilterItem,
      onDisplayDetail,
      root,
      topology,
    } = this.props;
    const { meta } = filters[index].containerId;
    const existingSync = filters[index].existingSync.input.value;
    const hasError = meta.touched && (meta.error || meta.asyncError);

    return (
      <Item className="multisync-filter-item">
        <Card
          className="multisync-item"
          padding="1rem"
          borderless
          color={ color.dark.quiet }
        >
          <Flex>
            <FieldWrapperFieldValue>
              <FieldValuesSelect
                {...filters[index].fieldValueId}
                containerId={ root.containerId.input.value }
                containerSide={ topology === multisyncTypes.TOPOLOGIES.SPLIT ? 'A' : 'B' }
                disabled={ existingSync }
                disabledText="Already selected"
                fieldId={ root.filter.input.value.fieldId }
                fieldValueIdsToExclude={ List(this.getFieldValueIdsToExclude()) }
                kind={ root.filter.input.value.kind }
                providerIdentityId={ root.providerIdentityId.input.value }
              />
            </FieldWrapperFieldValue>

            <JoinText>
              { topology === multisyncTypes.TOPOLOGIES.SPLIT ? ' will be sent to ' : ' when coming from ' }
            </JoinText>

            <FieldWrapperContainer>
              {
                existingSync ? (
                  <ContainerDisplay
                    containerId={filters[index].containerId.input.value}
                    containerSide={ topology === multisyncTypes.TOPOLOGIES.SPLIT ? 'B' : 'A' }
                    providerIdentityId={leaves.providerIdentityId.input.value}
                    type="inputNoLabel"
                  />
                ) : (
                  <ContainersSelect
                    {...filters[index].containerId}
                    allowCreate
                    containerSide={ topology === multisyncTypes.TOPOLOGIES.SPLIT ? 'B' : 'A' }
                    clearable={false}
                    disabledText="Already selected"
                    fieldIndex={index}
                    onChange={this.handleChangeContainerValue}
                    providerIdentityId={leaves.providerIdentityId.input.value}
                    showError={false}
                    valuesToExclude={this.getContainerIdsToExclude()}
                  />
                )
              }
            </FieldWrapperContainer>

            <Actions>
              <ButtonsWrapper>
                <DeleteButtonWithConfirm
                  onDelete={ onDeleteFilterItem }
                  pullRight
                  btnStyle="link"
                />
                {
                  !existingSync && (
                    <Button
                      btnStyle="link"
                      onClick={ onDisplayDetail }
                      pullRight
                    >
                      <Icon name="cog" className="fa-cog" />
                    </Button>
                  )
                }
              </ButtonsWrapper>
            </Actions>
          </Flex>
        </Card>

        {
          hasError && (
            <ErrorMessage className="help-block">
              { meta.error } Change your project and try again or { ' ' }
              <OpenIntercomBubble>get in touch with our team</OpenIntercomBubble>.
            </ErrorMessage>
          )
        }

        {
          displayDetail && (
            <Card borderless>
              <MultisyncFilterItemDetails
                filters={ filters }
                index={ index }
                leafContainerId={ filters[index].containerId.input.value }
                leafProviderIdentityId={ leaves.providerIdentityId.input.value }
                rootContainerId={ root.containerId.input.value }
                rootProviderIdentityId={ root.providerIdentityId.input.value }
                topology={ topology }
              />
            </Card>
          )
        }
      </Item>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/MultisyncFilters/MultisyncFilterItem.jsx