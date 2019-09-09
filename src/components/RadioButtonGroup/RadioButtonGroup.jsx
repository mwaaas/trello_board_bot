import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';

import { RadioButton } from '../../components';
import { color as themeColor } from '../../theme';


const InlineGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
`;


export default class RadioButtonGroup extends Component {
  static propTypes = {
    children: PropTypes.arrayOf(PropTypes.element).isRequired,
    inline: PropTypes.bool,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    selectedColor: PropTypes.string,
    value: PropTypes.any,
  };

  static defaultProps = {
    isChecked: false,
    inline: false,
    selectedColor: themeColor.brand.primary,
  };

  renderOptions = () => {
    const {
      children,
      onChange,
      value: groupValue,
      name: groupName,
    } = this.props;

    return React.Children.map(children, (option) => {
      const {
        color,
        label,
        value: radioValue,
        ...rest
      } = option.props;

      return (
        <RadioButton
          {...rest}
          color={ color || this.props.selectedColor }
          isChecked={ radioValue === groupValue }
          key={ radioValue }
          label={ label }
          name={ groupName }
          onCheck={ onChange }
          value={ radioValue }
        />
      );
    }, this);
  }

  render() {
    const Element = this.props.inline ? InlineGroup : 'div';

    return (
      <Element className="radio-button-group">
        { this.renderOptions() }
      </Element>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/RadioButtonGroup/RadioButtonGroup.jsx