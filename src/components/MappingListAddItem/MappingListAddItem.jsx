import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactSelect from 'react-select';
import { List } from 'immutable';
import styled from 'styled-components';

import {
  Button, Card, Icon, UserDisplay, UserDisplaySelectOption, UserDisplaySelectValue,
} from '../';
import './MappingListAddItem.scss';


const Flex = styled.div`
  flex: 15;
`;


export default class MappingListAddItem extends Component {
  static propTypes = {
    userA: PropTypes.object.isRequired,
    unmappedB: PropTypes.instanceOf(List).isRequired,
    onMapItems: PropTypes.func.isRequired,
    mappingIndex: PropTypes.number,
    className: PropTypes.string,
  };

  onChangeB = (userB) => {
    const { userA, onMapItems } = this.props;
    onMapItems(userA.get('id'), userB.value);
  };

  getOptions = (o, searchString) => {
    const { unmappedB, filterFunction } = this.props;

    return unmappedB
      .filter(user => filterFunction(user, searchString))
      .map(user => ({
        label: user.get('displayName'),
        value: user.get('id'),
        user,
      }))
      .toJS();
  };

  render() {
    const { userA } = this.props;

    return (
      <div className="mapping-list-add-item">
        <Flex>
          <Card padding=".5em .75em">
            <UserDisplay
              avatar={ userA.get('avatar') }
              displayName={ userA.get('displayName') }
              emails={ userA.get('emails') }
            />
          </Card>
        </Flex>

        <Button btnStyle="subtleLink" size="xs" disabled>
          <Icon name="arrows-h" />
        </Button>

        <Flex>
          <ReactSelect
            className="select-lg"
            filterOptions={ this.getOptions }
            onChange={ this.onChangeB }
            optionComponent={ UserDisplaySelectOption }
            placeholder="Type or select a user..."
            valueComponent={ UserDisplaySelectValue }
          />
        </Flex>
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/MappingListAddItem/MappingListAddItem.jsx