/**
 * @module UserDisplaySelectOption
 * A wrapper around the UserDisplay component that works with react-select
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { fromJS } from 'immutable';

import './UserDisplaySelectOption.scss';
import { UserDisplay } from '../';
import classnames from 'classnames';


export default class UserDisplaySelectOption extends Component {
  static propTypes = {
    option: PropTypes.object.isRequired,
    className: PropTypes.string,
    isDisabled: PropTypes.bool,
    isFocused: PropTypes.bool,
    isSelected: PropTypes.bool,
    onFocus: PropTypes.func,
    onSelect: PropTypes.func,
  };

  static defaultProps = {
    isDisabled: false,
    isFocused: false,
    isSelected: false,
  };

  handleMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.onSelect(this.props.option, event);
  };

  handleMouseEnter = (event) => {
    this.props.onFocus(this.props.option, event);
  };

  handleMouseMove = (event) => {
    if (this.props.isFocused) return;
    this.props.onFocus(this.props.option, event);
  };

  render() {
    const { className, option } = this.props;
    const classNames = classnames('user-display-select-option', className);

    // React-Select expects a JS Object as a options prop.
    const user = fromJS(option.user);

    return (
      <div
        role="button"
        tabIndex={ 0 }
        className={ classNames }
        onMouseDown={ this.handleMouseDown }
        onKeyPress={ this.handleMouseDown }
        onMouseEnter={ this.handleMouseEnter }
        onFocus={ this.handleMouseEnter }
        onMouseMove={ this.handleMouseMove }
      >
        <UserDisplay
          avatar={ user.get('avatar') }
          displayName={ user.get('displayName') }
          emails={ user.get('emails') }
        />
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/Select/UserDisplaySelectOption.jsx