import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';

import { Icon } from '../';
import './NavTabItem.scss';
import { UnderlinedNavItem } from '.';


export default class NavTabItem extends Component {
  static propTypes = {
    iconName: PropTypes.string,
    isActive: PropTypes.bool,
    isDisabled: PropTypes.bool,
    name: PropTypes.string,
    onClick: PropTypes.func,
    tabIndex: PropTypes.number,
  };

  static defaultProps = {
    isActive: false,
    isDisabled: false,
  };

  onClick = (event) => {
    const { onClick, tabIndex } = this.props;
    event.preventDefault();
    onClick && onClick(tabIndex);
  };

  render() {
    const {
      children,
      name,
      iconName,
      isActive,
      isDisabled,
      tabIndex,
      tabStyle,
    } = this.props;
    const classNames = classnames('nav-tab-item', {
      active: isActive,
      disabled: isDisabled,
      'nav-tab-item--no-click': !this.props.onClick,
    });

    if (tabStyle === 'underline') {
      return (
        <UnderlinedNavItem isActive={ isActive }>
          {
            children || (
              <a
                role="button"
                tabIndex={ 0 }
                onClick={ this.onClick }
                onKeyPress={ this.onClick }
                data-test={ `nav__tab--${tabIndex}` }
              >
                { name }
              </a>
            )
          }
        </UnderlinedNavItem>
      );
    }

    return (
      <li className={ classNames }>
        {
          children || (
            <a
              role="button"
              tabIndex={ 0 }
              onClick={ this.onClick }
              onKeyPress={ this.onClick }
              data-test={ `nav__tab--${tabIndex}` }
            >
              { iconName && <Icon name={iconName} /> }
              { name }
            </a>
          )
        }
      </li>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/NavTabs/NavTabItem.jsx