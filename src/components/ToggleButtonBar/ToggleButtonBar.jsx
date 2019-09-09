import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Button } from '../';
import './ToggleButtonBar.scss';


export default class ToggleButtonBar extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool,
    ]).isRequired,
    onChange: PropTypes.func.isRequired,
  };

  handleButtonClick = (value, isDisabled) => () => {
    if (!isDisabled) {
      this.props.onChange(value);
    }
  };

  render() {
    const { children, value } = this.props;

    return (
      <div className="toggle-button-bar btn-group">
        {
          React.Children.map(children, (child, index) => {
            let isDisabled = false;
            let buttonValue;

            if (child.type === Button) {
              buttonValue = child.props.value;
              isDisabled = child.props.disabled;
            } else if (child.props.children.type === Button) {
              // If a button is wrapped in a div, get the button values
              buttonValue = child.props.children.props.value;
              isDisabled = child.props.children.props.disabled;
            }
            const active = (value === buttonValue);

            return React.cloneElement(child, {
              key: index,
              active,
              btnStyle: active ? 'success' : 'default',
              onClick: this.handleButtonClick(buttonValue, isDisabled),
            });
          })
        }
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/ToggleButtonBar/ToggleButtonBar.jsx