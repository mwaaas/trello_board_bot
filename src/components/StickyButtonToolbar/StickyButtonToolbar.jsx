import React from 'react';
import styled from 'styled-components';

import { color } from '../../theme';

const ButtonToolbar = styled.div`
  background: white;
  border-bottom: 1px solid ${color.dark.whisper};
  bottom: 0;
  margin: 6rem 0 0;
  position: sticky;
  z-index: 3;
  -webkit-backface-visibility: hidden;


  &::before,
  &::after {
    content: '';
    display: block;
    height: 12px;
    position: sticky;
  }

  &::before {
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.30);
    margin-left: 6px;
    margin-right: 6px;
  }

  & > div {
    background: white;
    border-top: 1px solid ${color.dark.whisper};
    padding: 1rem 0 0;
    position: -webkit-sticky;
    position: sticky;
    margin-top: -1rem;
    z-index: 4;
  }
`;

export default ({ children, ...rest }) => (
  <ButtonToolbar {...rest}>
    <div className="clearfix">{ children }</div>
  </ButtonToolbar>
);



// WEBPACK FOOTER //
// ./src/components/StickyButtonToolbar/StickyButtonToolbar.jsx