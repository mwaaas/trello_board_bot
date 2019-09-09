import styled from 'styled-components';
import Color from 'color';

import { color as themeColor, borderRadius } from '../../theme';


const darkenColor = color => Color(color).darken(0.15).string();
const lightenColor = color => Color(color).lighten(0.85).string();

const Card = styled.div`
  background-color: ${(props) => {
    if (props.lighten && props.color) {
      return lightenColor(props.color);
    }
    return props.color || 'transparent';
  }};
  ${(props) => {
    if (props.borderless) {
      return;
    }

    const colorChangeFn = props.lighten ? lightenColor : darkenColor;
    return `border: 1px solid ${props.borderColor || colorChangeFn(props.color || themeColor.dark.whisper)}`;
  }};
  ${props => props.boxShadow && `box-shadow: 0px 0px 12px 0px ${themeColor.dark.whisper}`};
  border-radius: ${borderRadius.double};
  padding: ${props => props.padding || '2em'};
`;

export default Card;



// WEBPACK FOOTER //
// ./src/components/Card/Card.jsx