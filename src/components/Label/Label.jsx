import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';
import {
  borderRadius,
  color,
  fontWeight,
  fontSize,
} from '../../theme';


const Element = styled.span`
  background-color: ${props => color.brand[props.labelType] || color.dark[props.labelType]};
  border-radius: ${borderRadius.default};
  color: ${color.light.primary};
  display: inline-block;
  font-weight: ${fontWeight.regular};
  font-size: ${fontSize.small};
  padding: 6px 12px;

  strong {
    font-weight: ${fontWeight.medium};
  }
`;


export default class Label extends Component {
  static propTypes = {
    labelType: PropTypes.oneOf([
      ...Object.keys(color.brand),
      ...Object.keys(color.dark),
    ]),
    children: PropTypes.node.isRequired,
  };

  static defaultProps = {
    labelType: 'primary',
  };

  render() {
    const { children, labelType } = this.props;

    return (
      <Element className="label" labelType={ labelType }>
        { children }
      </Element>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/Label/Label.jsx