import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';

import { color as themeColor } from '../../theme';


const HorizontalBar = styled.div`
  background-color: ${themeColor.dark.subtle};
  height: 1px;
  margin: 10px;
  min-width: 200px;
`;

const VerticalBar = styled.div`
  width: 1px;
  margin: 10px;
  min-height: 200px;
`;

const BarContent = styled.div`
  background-color: ${props => props.color};
  height: 1px;
  transition: width 1s ease;
  width: ${props => props.progression}%;
`;


export default class ProgressBar extends Component {
  static propTypes = {
    progression: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    color: PropTypes.string,
  };

  static defaultProps = {
    progression: 0,
    type: 'vertical',
    color: themeColor.brand.primary,
  };

  getProgressBar = () => {
    const { type } = this.props;
    if (type === 'vertical') {
      return VerticalBar;
    }
    if (type === 'horizontal') {
      return HorizontalBar;
    }
  }

  render() {
    const {
      color,
      progression,
    } = this.props;

    const Bar = this.getProgressBar();

    return (
      <Bar className='progress'>
        <BarContent className='progress-bar' progression={ progression } color={ color } />
      </Bar>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/ProgressBar/ProgressBar.jsx