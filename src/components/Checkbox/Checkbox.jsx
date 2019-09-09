import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';

import { color as themeColor } from '../../theme';


const Box = styled.div`
  background-color: ${props => (props.checked ? props.color : props.contrastColor)};
  border: 2px solid ${props => props.color};
  width: 18px;
  height: 18px;
  cursor: pointer;
  position: relative;
  border-radius: 2px;
  display: inline-block;
  margin: 2px;
`;

const Checkmark = styled.span`
  position: absolute;
  border: solid ${props => props.color};
  height: 11px;
  width: 5px;
  left: 5px;
  border-width: 0 2px 2px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
`;

export default class Checkbox extends Component {
  static propTypes = {
    checked: PropTypes.bool.isRequired,
    color: PropTypes.string,
    contrastColor: PropTypes.string,
  };

  static defaultProps = {
    contrastColor: themeColor.light.primary,
    color: themeColor.brand.primary,
  };

  render() {
    const {
      checked,
      color,
      contrastColor,
    } = this.props;

    return (
      <Box
        checked={ checked }
        color={ color }
        contrastColor={ contrastColor }
      >
        <Checkmark color={ contrastColor } />
      </Box>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/Checkbox/Checkbox.jsx