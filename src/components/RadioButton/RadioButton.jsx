import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';
import classnames from 'classnames';

import { color as themeColor } from '../../theme';


const Children = styled.div`
  margin-left: 40px;
`;


const Element = styled.div`
  ${props => (props.inline ? 'margin-right: 40px;' : '')}
  opacity: ${props => (props.disabled ? '0.5' : '1')};
`;


const ButtonWrapper = styled.div`
  cursor: inherit;
`;


const Svg = styled.svg`
  display: inline-block;
  fill: ${props => props.color || themeColor.dark.primary};
  height: 24px;
  opacity: 1;
  top: 50%;
  transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;
  user-select: none;
  width: 24px;
`;


const Input = styled.input`
  &&& {
    margin: 0;
  }

  box-sizing: border-box;
  cursor: pointer;
  height: 100%;
  left: 0;
  opacity: 0;
  padding: 0;
  pointer-events: all;
  position: absolute;
  width: 100%;
`;


const Label = styled.label`
  color: ${themeColor.dark.primary};
  font-family: Roboto, sans-serif;
  padding-top: ${props => (props.hasSubLabel ? '3px' : 0)};
`;


const RadioButtonChecked = () => (
  <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0-5C6.48 2 2 6.48 2 12s4.48 10
  10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
);

const RadioButtonUnchecked = () => (
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
);

const RadioButtonWrapper = styled.div`
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')} ;
  margin-right: 16px;
  transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;
  width: 24px;
`;

export default class RadioButton extends Component {
  static propTypes = {
    color: PropTypes.string,
    disabled: PropTypes.bool,
    inline: PropTypes.bool,
    isChecked: PropTypes.bool,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    name: PropTypes.string,
    onCheck: PropTypes.func,
    value: PropTypes.any.isRequired,
  };

  static defaultProps = {
    disabled: false,
    inline: false,
    isChecked: false,
  };

  handleOnClick = () => {
    const { onCheck, value } = this.props;
    onCheck && onCheck(value);
  }

  render() {
    const {
      children,
      color,
      disabled,
      inline,
      isChecked,
      label,
      name,
      subLabel,
      value,
      ...rest
    } = this.props;
    const RadioElement = isChecked ? RadioButtonChecked : RadioButtonUnchecked;

    return (
      <Element
        {...rest}
        className={ classnames('radio-button', { 'radio-button--is-checked': isChecked }) }
        inline={ inline }
        disabled={ disabled }
      >
        <div style={{ position: 'relative' }}>
          <Input
            id={ `${name}-${value}` }
            checked={ isChecked }
            type="radio"
            name={ name }
            value={ value }
            onChange={ this.handleOnClick }
            disabled={ disabled }
          />

          <ButtonWrapper onClick={ this.handleOnClick } className="media">
            <RadioButtonWrapper
              disabled={disabled}
              className={classnames('media-left', { 'media-middle': !subLabel })}
            >
              <Svg viewBox="0 0 24 24" color={ isChecked && color }>
                <RadioElement />
              </Svg>
            </RadioButtonWrapper>
            <Label
              className="media-body radio-button__label"
              htmlFor={`${name}-${value}`}
              hasSubLabel={ !!subLabel }
            >
              { label }
              {subLabel && <div>{subLabel}</div> }
            </Label>
          </ButtonWrapper>

        </div>
        { isChecked && children && <Children>{ children }</Children> }
      </Element>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/RadioButton/RadioButton.jsx