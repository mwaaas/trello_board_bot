import styled from 'styled-components';

import {
    color,
    fontWeight
} from '../../theme';

export const UnderlinedNav = styled.ul `
  margin-bottom: 1rem;

  &&& {
    border-bottom: 2px solid ${color.dark.whisper};
  }
`;

const activeStyles = `
  border-bottom: 2px solid ${color.brand.primary};
  font-weight: ${fontWeight.bold};
  margin-bottom: -2px;
`;

export const UnderlinedNavItem = styled.li `
  a {
    color: ${color.dark.primary};
    outline: none;
  }

  &&& {
    a:active,
    a:focus,
    a:hover {
      background: none;
      border-color: transparent;
    }
  }

  display: inline-block;
  ${props => props.isActive && activeStyles}
`;

export { default as NavTabItem} from './NavTabItem';



// WEBPACK FOOTER //
// ./src/components/NavTabs/index.js