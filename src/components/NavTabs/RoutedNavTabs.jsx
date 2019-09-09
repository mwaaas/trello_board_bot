import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import { Route } from 'react-router-dom';

import { Href } from '../../components';
import { UnderlinedNav, NavTabItem } from '.';

export default class RoutedNavTabs extends Component {
  static propTypes = {
    className: PropTypes.string,
    isJustified: PropTypes.bool,
    routes: PropTypes.array.isRequired,
    tabStyle: PropTypes.oneOf(['tabs', 'pills', 'underline']),
  };

  static defaultProps = {
    isJustified: false,
    tabStyle: 'tabs',
  };

  render() {
    const {
      className,
      isJustified,
      tabStyle,
      routes,
    } = this.props;

    const NavElement = tabStyle === 'underline' ? UnderlinedNav : 'ul';
    const navTabsClasses = classnames(className, 'nav', `nav-${tabStyle}`, {
      'nav-justified': isJustified,
      'nav-tabs': tabStyle === 'underline',
    });

    return (
      <NavElement className={ navTabsClasses }>
        {
          routes.map((route, index) => (
            <Route
              key={ index }
              path={ route.path }
              children={({ match }) => (
                <NavTabItem isActive={ !!match } tabStyle={ tabStyle }>
                  <Href to={ route.path } linkStyle='subtleLink'>
                    { route.tabName }
                  </Href>
                </NavTabItem>
              )}
            />
          ))
        }
      </NavElement>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/NavTabs/RoutedNavTabs.jsx