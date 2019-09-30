import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';
import { Router, Route, Switch } from 'react-router-dom';
import NotificationsSystem from 'reapop';
import theme from 'reapop-theme-wybo';

import {
  App,
  AuthSetup,
  Canvas,
  EmbedLoginContainer,
  LoginContainer,
  SignupContainer,
} from '../../containers';
import { Header, NotFound, ScrollToTop } from '../../components';
import { getIsAuthenticated } from '../../reducers';
import { routes } from '../../consts';
import DevTools from '../DevTools/DevTools';

class Root extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
    debug: PropTypes.bool,
  }

  static defaultProps = {
    debug: false,
  }

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
          <NotificationsSystem theme={ customTheme } />
          <Router history={ this.props.history }>
            <div>
              <ScrollToTop />
              <Switch>
                <Route exact path="/embed/:embedName/login" component={ EmbedLoginContainer } />
                <Route
                  path="/:method(login|signup)"
                  render={({ match, ...rest }) => (
                    <div>
                      <Switch>
                        <Route
                          {...rest}
                          exact
                          path={[match.path, `${match.path}/`]}
                          component={ match.params.method === 'login' ? LoginContainer : SignupContainer }
                        />
                        <Route
                          {...rest}
                          path={[`${match.path}/:connectorName`, `${match.path}/:connectorName/`]}
                          component={AuthSetup}
                        />
                      </Switch>
                    </div>
                  )}
                />
                <Route exact path="/canvas" component={ Canvas } />
                {
                  !this.props.isAuthenticated && (
                    <Route render={() => (
                      <div>
                        <Header />
                        <NotFound
                          goBackLink={ routes.ABSOLUTE_PATHS.LOGIN }
                          goBackText="Go back to the Login page"
                        />
                      </div>
                    )} />
                  )
                }
              </Switch>
              <App />
            </div>
          </Router>
      { this.renderDevTools() }
    </div>
  </Provider>
    );
  }
}

const mapStateToProps = state => ({
  isAuthenticated: getIsAuthenticated(state),
});

export default connect(mapStateToProps)(Root);



// WEBPACK FOOTER //
// ./src/containers/Root/Root.jsx