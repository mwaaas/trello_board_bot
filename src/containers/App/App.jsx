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
import { Dashboard } from '../../containers';
import { NotFound, Header, Loading } from '../../components';
import { routes } from '../../consts';
import {
  getIsAuthenticated,
  getSegmentWriteKey,
  getSematextExperienceToken,
  getUserId,
} from '../../reducers';


class App extends Component {
  static propTypes = {
    children: PropTypes.node,
    initialFetch: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
    location: PropTypes.object.isRequired,
    parseLocation: PropTypes.func.isRequired,
    segmentWriteKey: PropTypes.string,
    sematextExperienceToken: PropTypes.string,
    userId: PropTypes.string,
    userPendingInvite: PropTypes.instanceOf(Map),
  };

  state = {
    displayParamErrorMsg: true,
    isLoading: true,
  };

  async componentDidMount() {
    const { initialFetch, location, parseLocation } = this.props;
    const [, embed, providerName] = location.pathname.split('/');
    const isEmbed = embed === 'embed';

    await initialFetch();
    this.setState({ isLoading: false });
    parseLocation();

    // Clear cookie to avoid issue #1401
    if (isEmbed && providerName === 'wrike') {
      window.addEventListener('beforeunload', this.clearCookie);
    }

    this.setupSnippets();
  }

  setupSnippets = async () => {
    this.loadSegment();
    this.setupSematextExperience();
  }

  clearCookie = () => {
    cookie.remove('token');
    window.removeEventListener('beforeunload', this.clearCookie);
  }

  loadSegment = () => {
    const { segmentWriteKey } = this.props;
    if (segmentWriteKey) {
      window.analytics.load(segmentWriteKey);
    }
  }

  setupSematextExperience = () => {
    const { sematextExperienceToken, userId } = this.props;
    if (window.strum && sematextExperienceToken) {
      if (userId) {
        window.strum('identify', { name: userId, identifier: userId });
      }

      window.strum('config', { token: sematextExperienceToken, receiverUrl: 'https://rum-receiver.sematext.com' });
    }
  }

  render() {
    const { history, isAuthenticated } = this.props;
    if (this.state.isLoading) {
      return <Loading />;
    }

    return (
      <div className="content">
        <Switch>
          <Route path="/embed/:embedName/dashboard" component={ Dashboard } />
          <Route path="/dashboard" component={ Dashboard } />
          <Redirect exact from="/" to={`/dashboard${history.location.search || ''}`} />
          {
            isAuthenticated && (
              <Route render={() => (
                <div>
                  <Header />
                  <NotFound
                    goBackLink={ routes.ABSOLUTE_PATHS.DASHBOARD }
                    goBackText="Go back to your syncs"
                  />
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
  segmentWriteKey: getSegmentWriteKey(state),
  sematextExperienceToken: getSematextExperienceToken(state),
  userId: getUserId(state),
});

const mapDispatchToProps = (dispatch, { location }) => ({
  initialFetch: () => Promise.all([
    dispatch(appActions.getAppConfig()),
    dispatch(flagActions.getCohortFlags()),
    dispatch(providerActions.getProviders()),
  ]),
  parseLocation: () => {
    dispatch(appActions.getIsEmbed(location.pathname));
    dispatch(appActions.getQueryParameters(qs.parse(location.search.substring(1))));
  },
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));



// WEBPACK FOOTER //
// ./src/containers/App/App.jsx