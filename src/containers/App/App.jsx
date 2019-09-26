import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import cookie from 'react-cookie';
import { Map } from 'immutable';
import qs from 'qs';

import {
  Redirect,
  Route,
  Switch,
  withRouter,
} from 'react-router-dom';

import {
  appActions,
  flagActions,
  providerActions,
} from '../../actions';
import { Dashboard, HeaderContainer } from '../../containers';
import { Loading, NotFound } from '../../components';
import {
  getIsLoadingFlags,
  getIsAuthenticated,
  getIsAuthenticating,
  getIsLoadingApp,
  getIsLoadedProviders,
} from '../../reducers';


class App extends Component {
  static propTypes = {
    children: PropTypes.node,
    initialFetch: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    location: PropTypes.object.isRequired,
    parseLocation: PropTypes.func.isRequired,
    segmentWriteKey: PropTypes.string,
    userPendingInvite: PropTypes.instanceOf(Map),
  };

  state = {
    displayParamErrorMsg: true,
  };

  componentDidMount() {
    const { initialFetch, location, parseLocation } = this.props;
    const [, embed, providerName] = location.pathname.split('/');
    const isEmbed = embed === 'embed';

    initialFetch();
    parseLocation();

    // Clear cookie to avoid issue #1401
    if (isEmbed && providerName === 'wrike') {
      window.addEventListener('beforeunload', this.clearCookie);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.loadSegment(nextProps.segmentWriteKey);
  }

  clearCookie = () => {
    cookie.remove('token');
    window.removeEventListener('beforeunload', this.clearCookie);
  }

  loadSegment = (segmentWriteKey) => {
    if (segmentWriteKey && !this.state.segmentInitialized) {
      window.analytics.load(segmentWriteKey);
      this.setState({ segmentInitialized: true });
    }
  }

  render() {
    const { history, isLoading, isAuthenticated } = this.props;

    return (
      <div className="content">
        { isLoading && <Loading /> }

        <Switch>
          <Route path="/embed/:embedName/dashboard" component={ Dashboard } />
          <Route path="/dashboard" component={ Dashboard } />
          <Redirect exact from="/" to={`/dashboard${history.location.search || ''}`} />
          {
            isAuthenticated && (
              <Route render={() => (
                <div>
                  <HeaderContainer />
                  <NotFound />
                </div>
              )} />
            )
          }
        </Switch>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isAuthenticated: getIsAuthenticated(state),
  isLoading: getIsLoadingApp(state) || getIsAuthenticating(state) || getIsLoadingFlags(state) || !getIsLoadedProviders(state),
  segmentWriteKey: state.app.get('segmentWriteKey'),
});

const mapDispatchToProps = (dispatch, { location }) => ({
  initialFetch: () => {
    dispatch(appActions.getAppConfig());
    dispatch(flagActions.getCohortFlags());
    dispatch(providerActions.getProviders());
  },
  parseLocation: () => {
    dispatch(appActions.getIsEmbed(location.pathname));
    dispatch(appActions.getQueryParameters(qs.parse(location.search.substring(1))));
  },
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));



// WEBPACK FOOTER //
// ./src/containers/App/App.jsx