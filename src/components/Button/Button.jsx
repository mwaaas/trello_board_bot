import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';
import Color from 'color';

import { Href } from '../../components';
import {
  color, fontWeight, fontSize, lineHeight,
} from '../../theme';


const paddingButton = {
  xs: '4px 12px',
  sm: '5px 16px',
  md: '8px 24px',
  lg: '12px 32px',
};

const StyledButton = styled.button`
  background-color: ${props => props['data-mainColor']};
  border-style: solid;
  border-color: ${props => props['data-mainColor']};
  border-width: ${props => (props['data-noPadding'] ? 0 : '2px')};
  border-radius: 2px;
  color: ${color.light.primary};
  font-weight: ${fontWeight.regular};
  font-size: ${props => fontSize.button[props['data-btnSize']]};
  padding: ${props => (props['data-noPadding'] ? 0 : paddingButton[props['data-btnSize']])};
  text-transform: none;
  line-height: ${props => lineHeight.button[props['data-btnSize']]};
  opacity: ${props => (props.disabled ? '0.65' : '1')};
  text-decoration: none;

  &[disabled]:active,
  &[disabled]:focus,
  &[disabled]:hover {
    color: ${color.light.primary};
  }

  &:not([disabled]):active,
  &:not([disabled]):focus,
  &:not([disabled]):hover {
    border-color: ${props => props['data-hoverColor']};
    background-color: ${props => props['data-hoverColor']};
    color: ${color.light.primary};
    opacity: ${props => (props.disabled ? '0.65' : '1')};
  };
`;

const ReverseButton = StyledButton.extend`
  background-color: ${color.light.primary};
  color: ${props => props['data-mainColor']};

  &[disabled]:active,
  &[disabled]:focus,
  &[disabled]:hover {
    color: ${props => props['data-mainColor']};
  }
`;

const LinkButton = ReverseButton.extend`
  border-color: transparent;
  background: transparent;

  &:not([disabled]):active,
  &:not([disabled]):focus,
  &:not([disabled]):hover {
    background: transparent;
    border-color: ${props => (props['data-btnStyle'] === 'linkHoverWithBorder' ? props['data-mainColor'] : 'transparent')}
    box-shadow: none;
    color: ${props => props['data-hoverColor']};
    text-decoration: underline;
  }
`;

const SubtleLinkButton = LinkButton.extend`
  &:not([disabled]):active,
  &:not([disabled]):focus,
  &:not([disabled]):hover {
    color: ${props => props['data-mainColor']};
  }
`;


export default class Button extends Component {
  static propTypes = {
    active: PropTypes.bool,
    backgroundColor: PropTypes.string,
    block: PropTypes.bool,
    btnStyle: PropTypes.oneOf([
      ...Object.keys(color.brand),
      'linkHoverWithBorder',
      'subtleLink',
    ]),
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    color: PropTypes.string,
    disabled: PropTypes.bool,
    dropdown: PropTypes.element,
    noPadding: PropTypes.bool,
    onClick: PropTypes.func,
    pullLeft: PropTypes.bool,
    pullRight: PropTypes.bool,
    regularCase: PropTypes.bool,
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
    type: PropTypes.oneOf(['button', 'submit', 'reset', 'menu', 'href']),
  }

  static defaultProps = {
    active: false,
    block: false,
    btnStyle: 'primary',
    className: '',
    disabled: false,
    noPadding: false,
    onClick: () => null,
    regularCase: false,
    size: 'md',
    type: 'button',
  };

  getButton = () => {
    const { btnStyle, reverse } = this.props;
    let ButtonComponent;

    if (reverse) {
      ButtonComponent = ReverseButton;
    } else if (['link', 'linkHoverWithBorder'].includes(btnStyle)) {
      ButtonComponent = LinkButton;
    } else if (btnStyle === 'subtleLink') {
      ButtonComponent = SubtleLinkButton;
    } else {
      ButtonComponent = StyledButton;
    }

    if (this.props.type === 'href') {
      ButtonComponent = ButtonComponent.withComponent(Href);
    }

    return ButtonComponent;
  }

  render() {
    const {
      active,
      backgroundColor,
      block,
      btnStyle,
      children,
      className,
      disabled,
      dropdown,
      noPadding,
      onBlur,
      onClick,
      onFocus,
      onMouseOut,
      onMouseOver,
      pullLeft,
      pullRight,
      regularCase,
      reverse,
      size,
      type,
      ...rest
    } = this.props;

    const buttonClasses = classnames('btn', {
      [`btn-${size}`]: !!size,
      'btn-block': block,
      'btn-regular-case': regularCase,
      active,
      disabled,
    }, className);
    const caretClasses = classnames(buttonClasses, 'dropdown-toggle');

    const ButtonComponent = this.getButton();
    const mainColor = backgroundColor || this.props.color || color.brand[btnStyle];
    const hoverColor = Color(mainColor).darken(0.18).string();

    if (!dropdown) {
      return (
        <ButtonComponent
          {...rest}
          className={ classnames(buttonClasses, { 'pull-right': pullRight, 'pull-left': pullLeft }) }
          data-btnSize={ size }
          data-btnStyle={ btnStyle }
          data-hoverColor={ hoverColor }
          data-mainColor={ mainColor }
          data-noPadding={ noPadding }
          disabled={ disabled }
          onBlur={ onBlur || onMouseOut }
          onClick={ onClick }
          onFocus={ onFocus || onMouseOver }
          onMouseOut={ onMouseOut }
          onMouseOver={ onMouseOver }
          type={ type }
        >
          { children }
        </ButtonComponent>
      );
    }

    const CaretButton = ButtonComponent.withComponent('a');
    const caret = (
      <CaretButton
        {...rest}
        style={{ borderLeft: `1px solid ${hoverColor}`, paddingLeft: '12px', paddingRight: '12px' }}
        className={ caretClasses }
        data-btnSize={ size }
        data-btnStyle={ btnStyle }
        data-hoverColor={ hoverColor }
        data-mainColor={ mainColor }
        data-noPadding={ noPadding }
      >
        <span className="caret" />
        <span className="sr-only">Toggle Dropdown</span>
      </CaretButton>
    );

    return (
      <div className={ classnames('btn-group', { 'pull-right': pullRight, 'pull-left': pullLeft }) }>
        <ButtonComponent
          {...rest}
          className={ buttonClasses }
          data-btnSize={ size }
          data-btnStyle={ btnStyle }
          data-hoverColor={ hoverColor }
          data-mainColor={ mainColor }
          disabled={ disabled }
          onBlur={ onBlur || onMouseOut }
          onClick={ onClick }
          onFocus={ onFocus || onMouseOver }
          onMouseOut={ onMouseOut }
          onMouseOver={ onMouseOver }
          type={ type }
        >
          { children }
        </ButtonComponent>
        { React.cloneElement(dropdown, { button: caret }) }
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/Button/Button.jsx