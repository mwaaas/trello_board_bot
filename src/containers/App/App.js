import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cookie from 'react-cookie';

import { connect } from 'react-redux';
import { Map } from 'immutable';
import qs from 'qs';

import {
  Route,
  Switch,
  withRouter,
} from 'react-router-dom';

import {
  appActions,
  flagActions,
  providerActions,
} from '../../actions';

import {
  getIsLoadingFlags,
  getIsAuthenticated,
  getIsAuthenticating,
  getIsLoadingApp,
  getIsLoadedProviders,
} from '../../reducers';
import DashBoard from "../Dashboard/Dashboard";


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
  };

  loadSegment = (segmentWriteKey) => {
    if (segmentWriteKey && !this.state.segmentInitialized) {
      window.analytics.load(segmentWriteKey);
      this.setState({ segmentInitialized: true });
    }
  };
  render() {
    return (
        <div className="content">
          <Switch>
            <Route path="/dashboard" component={DashBoard}/>
            <Route path="/" component={DashBoard}/>
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
    // dispatch(flagActions.getCohortFlags());
    dispatch(providerActions.getProviders());
  },
  parseLocation: () => {
    dispatch(appActions.getIsEmbed(location.pathname));
    dispatch(appActions.getQueryParameters(qs.parse(location.search.substring(1))));
  },
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));