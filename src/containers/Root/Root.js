
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { Route, Router, Switch } from 'react-router-dom';
import NotificationsSystem from 'reapop';
import theme from 'reapop-theme-wybo';

import {App, DevTools} from '../../containers'
import {ScrollToTop} from '../../components'

export default class Root extends Component {
      static propTypes = {
          history: PropTypes.object.isRequired,
          store: PropTypes.object.isRequired,
          debug: PropTypes.bool,
      };

      static defaultProps = {
          debug: false,
      };

      renderDevTools() {
          if (!this.props.debug) {
              return null;
          }
          return <DevTools />;
  }

  render() {
    const customTheme = {
      ...theme,
      smallScreenMin: 400,
    };

    return (
      <Provider store={ this.props.store }>
        <div className="root-container">
          {/*<NotificationsSystem theme={ customTheme } />*/}
          <Router history={ this.props.history }>
            <div>
                <ScrollToTop />
                <App />
            </div>
          </Router>
          { this.renderDevTools() }
        </div>
      </Provider>
    );
  }
}