import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';

import {
  Button, Card, Icon, UserDisplay, UserDisplayLoading,
} from '../../components';
import './MappingListItem.scss';


const Flex = styled.div`
  flex: 15;
`;


export default class MappingListItem extends Component {
  static propTypes = {
    userA: PropTypes.object.isRequired,
    userB: PropTypes.object.isRequired,
    mappingIndex: PropTypes.number,
    onUnmapItems: PropTypes.func.isRequired,
  };

  state = {
    hovered: false,
  };

  onMouseOver = () => {
    this.setState({ hovered: true });
  }

  onMouseLeave = () => {
    this.setState({ hovered: false });
  }

  onUnmapItemClick = () => {
    const { mappingIndex, onUnmapItems } = this.props;
    onUnmapItems(mappingIndex);
  }

  render() {
    const { userA, userB } = this.props;
    const { hovered } = this.state;

    return (
      <div
        className="mapping-list-item"
        onFocus={ this.onMouseOver }
        onMouseOver={ this.onMouseOver }
        onBlur={ this.onMouseLeave }
        onMouseLeave={ this.onMouseLeave }
      >
        <Flex>
          <Card padding=".5em .75em">
            {
              userA.isEmpty() ? (
                <UserDisplayLoading />
              ) : (
                <UserDisplay
                  avatar={ userA.get('avatar') }
                  emails={ userA.get('emails') }
                  displayName={ userA.get('displayName') }
                />
              )
            }
          </Card>
        </Flex>

        {
          !hovered ? (
            <Button btnStyle="subtleLink" size="xs">
              <Icon name="arrows-h" />
            </Button>
          ) : (
            <Button btnStyle="error" size="xs" onClick={ this.onUnmapItemClick } title="Unmap">
              <Icon name="chain-broken" />
            </Button>
          )
        }

        <Flex>
          <Card padding=".5em .75em">
            {
              userB.isEmpty() ? (
                <UserDisplayLoading />
              ) : (
                <UserDisplay
                  avatar={ userB.get('avatar') }
                  emails={ userB.get('emails') }
                  displayName={ userB.get('displayName') }
                />
              )
            }
          </Card>
        </Flex>
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/MappingListItem/MappingListItem.jsx