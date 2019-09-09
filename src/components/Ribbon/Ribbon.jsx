import React from 'react';
import styled from 'styled-components';
import { color } from '../../theme';

const Ribbon = styled.div`
  position: absolute;
  right: -5px;
  top: -5px;
  z-index: 1;
  overflow: hidden;
  width: 75px;
  height: 75px;
  text-align: right;

  span {
    font-size: 10px;
    font-weight: bold;
    color: ${color.light.primary};
    text-transform: uppercase;
    text-align: center;
    line-height: 20px;
    transform: rotate(45deg);
    -webkit-transform: rotate(45deg);
    width: 100px;
    display: block;
    background: ${color.brand.primary};
    box-shadow: 0 3px 10px -5px rgba(0, 0, 0, 1);
    position: absolute;
    top: 19px;
    right: -21px;
  }

  span::before {
    content: "";
    position: absolute; left: 0px; top: 100%;
    z-index: -1;
    border-left: 3px solid ${color.brand.primary};
    border-right: 3px solid transparent;
    border-bottom: 3px solid transparent;
    border-top: 3px solid ${color.brand.primary};
  }

  span::after {
    content: "";
    position: absolute; right: 0px; top: 100%;
    z-index: -1;
    border-left: 3px solid transparent;
    border-right: 3px solid ${color.brand.primary};
    border-bottom: 3px solid transparent;
    border-top: 3px solid ${color.brand.primary};
  }
`;


export default ({ children }) => (
  <Ribbon>
    <span>
      { children }
    </span>
  </Ribbon>
);



// WEBPACK FOOTER //
// ./src/components/Ribbon/Ribbon.jsx