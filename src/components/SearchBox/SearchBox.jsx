import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import { Icon } from '../';
import './SearchBox.scss';


export default class SearchBox extends Component {
  static propTypes = {
    className: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    children: PropTypes.node,
    onPressEnter: PropTypes.func,
    placeholder: PropTypes.string,
    size: PropTypes.oneOf(['sm', 'lg']),
    value: PropTypes.string,
  };

  static defaultProps = {
    placeholder: 'Search',
    onPressEnter: () => null,
  };

  handleKeyDown = (event) => {
    const { onPressEnter } = this.props;
    // ENTER KEY
    if (event.keyCode === 13) {
      onPressEnter();
    }
  };

  render() {
    const {
      onChange,
      className,
      size,
      placeholder,
      value,
      children,
    } = this.props;

    const searchClasses = classnames({
      'input-group': true,
      'search-box': true,
    }, className);

    const searchInputClasses = classnames(
      'form-control', 'search-box__input', {
        [`input-${size}`]: !!size,
      },
    );

    return (
      <div className={ searchClasses }>
        <span className="input-group-addon search-box__icon"><Icon name="search"/></span>
        <input
          className={ searchInputClasses }
          type="text"
          placeholder={ placeholder }
          onChange={ onChange }
          onKeyDown={ this.handleKeyDown }
          value={ value }
        />
        {
          children
          && <div className="input-group-btn">
            { children }
          </div>
        }
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/SearchBox/SearchBox.jsx