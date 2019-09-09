import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';

import { UnderlinedNav, NavTabItem } from '.';


export default class NavTabs extends Component {
  static propTypes = {
    tabNames: PropTypes.array.isRequired,
    tabIcons: PropTypes.array,
    activeTab: PropTypes.number.isRequired,
    className: PropTypes.string,
    isJustified: PropTypes.bool,
    tabStyle: PropTypes.oneOf(['tabs', 'pills', 'underline']),
    onTabClick: PropTypes.func,
  };

  static defaultProps = {
    isJustified: false,
    tabIcons: [],
    tabStyle: 'tabs',
  };

  render() {
    const {
      className,
      activeTab,
      isJustified,
      onTabClick,
      tabIcons,
      tabNames,
      tabStyle,
    } = this.props;

    const NavElement = tabStyle === 'underline' ? UnderlinedNav : 'ul';
    const navTabsClasses = classnames(className, 'nav', `nav-${tabStyle}`, {
      'nav-justified': isJustified,
      'nav-tabs': tabStyle === 'underline',
    });

    return (
      <NavElement className={ navTabsClasses }>
        {
          tabNames.map((tabName, index) => (
            <NavTabItem
              onClick={ onTabClick }
              name={ tabName }
              iconName={ tabIcons[index] }
              isActive={ index === activeTab }
              tabIndex={ index }
              tabStyle={ tabStyle }
              key={ index }
            />
          ))
        }
      </NavElement>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/NavTabs/NavTabs.jsx