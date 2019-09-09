import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';

import { Icon } from '../../components';
import { color } from '../../theme';


const levelToColor = {
  info: color.dark.whisper,
};

const levelToIconName = {
  info: 'info-circle',
};

const StyledAlert = styled.div`
  background: ${props => levelToColor[props.level]};
`;


export default class Alert extends Component {
  static propTypes = {
    level: PropTypes.oneOf(['info']),
  };

  static defaultProps = {
    level: 'info',
  };

  render() {
    const { children, level } = this.props;

    return (
      <StyledAlert className="alert" level={ level }>
        <div className="media">
          <div className="media-left">
            <Icon name={levelToIconName[level]} />
          </div>
          <div className="media-body">
            { children }
          </div>
        </div>
      </StyledAlert>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/Alert/Alert.jsx