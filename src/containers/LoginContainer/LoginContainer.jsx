/**
* @module Login container
*/
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Map } from 'immutable';
import { Redirect } from 'react-router-dom';
import { addNotification as notify } from 'reapop';
import qs from 'qs';
import { color, fontSize } from '../../theme';
import {
  formValueSelector,
  reduxForm,
  Field,
} from 'redux-form';

import { authActions, trackingActions } from '../../actions';
import appHistory from '../../app-history';
import {
  Button,
  Card,
  Header,
  Href,
  Title,
} from '../../components';
import { routes, trackingTypes } from '../../consts';
import { getProvidersThatCanLogin } from '../../reducers';
import { formUtils } from '../../utils';
import SelectProviderField from '../SignupContainer/SelectProviderField';

const Content = styled.form`
  margin-left: auto;
  margin-right: auto;
  width: 894px;
  padding-top: 10vh;
  text-align: left;
`;

const SectionTitle = styled.h5`
  font-size: ${fontSize.subheading};
  margin-bottom: 32px;
  text-align: center;
`;



class LoginContainer extends Component {
  static propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    location: PropTypes.object,
    loginProvider: PropTypes.instanceOf(Map),
    providers: PropTypes.instanceOf(Map),
    showErrors: PropTypes.func.isRequired,
    trackLogin: PropTypes.func.isRequired,
  }

  componentDidMount() {
    const { trackLogin } = this.props;
    trackLogin(trackingTypes.FORM_ACTIONS.START);
    this.showServerErrors();
  }

  getAuthUrl = (provider) => {
    const { location: { search } } = this.props;
    const { returnUrl = '' } = qs.parse(search.substring(1));
    const params = {
      returnUrl: encodeURIComponent(returnUrl),
    };
    const queryParams = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
    const baseServerUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';
    return `${baseServerUrl}/api/v1/login/${provider.get('name')}?${queryParams}`;
  }

  onClickSignup = () => {
    const { trackLogin } = this.props;
    trackLogin(trackingTypes.FORM_ACTIONS.CANCEL);
  }

  onClickNews = () => {
    const { trackOpenExternalLink } = this.props;
    trackOpenExternalLink('mirror_news');
  }

  showServerErrors = () => {
    const {
      location: { search },
      showErrors,
    } = this.props;

    const query = qs.parse(search.substring(1)) || {};
    // Prevent show server error from displaying multiple times, due to other props update
    if (query.message) {
      showErrors(query.message);
    }
  }

  render() {
    const {
      handleSubmit,
      isAuthenticated,
      providers,
      loginProvider,
      submitting,
      trackLogin,
    } = this.props;
    if (isAuthenticated) {
      return <Redirect to="/dashboard" />;
    }

    return (
      <div>
        <Header dark logoRedirectUrl={ routes.ABSOLUTE_PATHS.LOGIN }>
          <li>
            <Button
              id="signup"
              btnStyle="subtleLink"
              color={ color.light.secondary }
              onClick={ this.onClickSignup }
              to={ routes.ABSOLUTE_PATHS.SIGNUP }
              type="href"
            >
              Don't have an account? Sign up
            </Button>
          </li>
        </Header>

        <Content className="row" onSubmit={ handleSubmit }>
          <div className="col-sm-6">
            <Title type="h1">
              Log in to your account
            </Title>
            <Title type="h3">
              What's new
            </Title>
            <Title type="subtitle3">
              Meet Mirror, our new Trello Power Up that
              syncs specific cards from one board to another
              without leaving the board you work in everyday!<br/>
              <Href onClick={ this.onClickNews } href="https://unito.io/trello-sync/mirror">Learn More</Href>
            </Title>
          </div>
          <div className="col-sm-6">
            <Card color={ color.light.primary } padding="32px">
              <SectionTitle>
                Select the tool you want to log in with
              </SectionTitle>

              <div className="form-group">
                <Field
                  name="loginProvider"
                  component={ SelectProviderField }
                  props={{
                    id: 'loginProvider',
                    providers,
                    track: trackLogin,
                  }}
                />
              </div>

              <Button
                block
                btnStyle="purple"
                data-test="login__btn--login"
                disabled={ submitting }
                type="submit"
              >
                { loginProvider ? `Log in with ${loginProvider.get('displayName')}` : 'Log in' }
              </Button>

            </Card>
          </div>
        </Content>
      </div>
    );
  }
}

LoginContainer = reduxForm({
  form: 'loginForm',
  asyncValidate: (formValues, dispatch, props) => {
    const { trackLogin } = props;
    const { loginProvider } = formValues;

    if (formUtils.isEmpty(loginProvider)) {
      const reason = 'Sorry, you need to select a tool to login';
      trackLogin(trackingTypes.FORM_ACTIONS.VALIDATION_FAILED, { reason });
      return Promise.reject({ loginProvider: reason });
    }

    return Promise.resolve();
  },
})(LoginContainer);

const selector = formValueSelector('loginForm');

const mapStateToProps = state => ({
  isAuthenticated: state.auth.get('isAuthenticated'),
  loginProvider: selector(state, 'loginProvider'),
  providers: getProvidersThatCanLogin(state),
});

const mapDispatchToProps = dispatch => ({
  showErrors: (message) => {
    dispatch(notify({
      title: 'Unable to log in',
      message,
      status: 'error',
      dismissible: true,
      dismissAfter: 0,
      position: 'tc',
      buttons: [{
        name: 'Get help',
        primary: true,
        onClick: () => { window.open('https://guide.unito.io/hc/en-us/search?query=Shared Connector Errors', '_blank'); },
      },
      ],
    }));
  },
  trackLogin: (action, data) => {
    const eventName = `USER_LOGIN_${action}`;
    dispatch(trackingActions.trackAnonymousEvent(eventName, data));
  },
  trackOpenExternalLink: (linkName) => {
    const eventName = `USER_OPENED_LINK_${linkName.toUpperCase()}`;
    dispatch(trackingActions.trackAnonymousEvent(eventName));
  },
  onSubmit: async (formValues) => {
    const { loginProvider, ...rest } = formValues;
    dispatch(trackingActions.trackAnonymousEvent(`USER_LOGIN_${trackingTypes.FORM_ACTIONS.SUBMIT}`, {
      ...rest,
      providerName: loginProvider.get('name'),
      connectorName: loginProvider.get('connectorName'),
    }));

    dispatch(trackingActions.trackAnonymousEvent(trackingTypes.AUTH_SETUP.USER_OAUTH_START, {
      context: 'login',
      'provider.connectorName': loginProvider.get('connectorName'),
    }));

    if (loginProvider.get('domainRequired')) {
      appHistory.push({ pathname: `/login/${loginProvider.get('connectorName')}` });
      return;
    }

    const { authenticationUrl } = await dispatch(authActions.authenticate({
      productName: 'projectSync',
      providerName: loginProvider.get('name'),
    }));
    global.window.location.assign(authenticationUrl);
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginContainer);



// WEBPACK FOOTER //
// ./src/containers/LoginContainer/LoginContainer.jsx