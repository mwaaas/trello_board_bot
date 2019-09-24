import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled, { injectGlobal } from 'styled-components';
import { Map } from 'immutable';
import { addNotification as notify } from 'reapop';
import qs from 'qs';
import { color, fontSize } from '../../theme';
import { Redirect } from 'react-router-dom';
import {
  formValueSelector,
  reduxForm,
  Field,
} from 'redux-form';

import appHistory from '../../app-history';
import {
  Button,
  Card,
  CheckboxField,
  Header,
  Href,
  Icon,
  Title,
} from '../../components';
import { authActions, trackingActions } from '../../actions';
import { routes, trackingTypes } from '../../consts';
import { getIsAuthenticated, getProvidersThatCanLogin } from '../../reducers';
import { formUtils } from '../../utils';
import SelectProviderField from './SelectProviderField';

/* eslint-disable */
injectGlobal`
  body {
    background-color: ${color.light.gray};
  }
`;
/* eslint-enable */

const Content = styled.form`
  margin-left: auto;
  margin-right: auto;
  width: 894px;
  padding-top: 10vh;
  text-align: left;
`;

const Details = styled.ul`
  margin-top: 1rem;
  margin-left: 1.6rem;
  font-size: ${fontSize.subheading}
`;

const Agreement = styled.div`
  font-size: 12px;
  margin-bottom: 12px;
  color: ${color.dark.secondary};
  a {
    color: ${color.dark.secondary};
    text-decoration: underline;
  }
`;

const SectionTitle = styled.h5`
  font-size: ${fontSize.subheading};
  margin-bottom: 32px;
  text-align: center;
`;

// todo annotation
// @reduxForm({
//   form: 'signupForm',
//   asyncValidate: (values, dispatch, props, fieldString) => {
//     const { trackSignup } = props;
//     const { signupProvider, agreementValue } = values;
//     if (!fieldString && formUtils.isEmpty(signupProvider)) {
//       const reason = 'Sorry, you need to select a tool to create your account';
//       trackSignup(trackingTypes.FORM_ACTIONS.VALIDATION_FAILED, { reason });
//       return Promise.reject({ signupProvider: reason });
//     }
//
//     if (!fieldString && !agreementValue) {
//       const reason = "You need to agree to Unito's Terms of service and Privacy policy to create your account";
//       trackSignup(trackingTypes.FORM_ACTIONS.VALIDATION_FAILED, { reason });
//       return Promise.reject({ agreementValue: reason });
//     }
//
//     return Promise.resolve();
//   },
// })
class SignupContainer extends Component {
  static propTypes = {
    isAuthenticated: PropTypes.bool,
    location: PropTypes.object,
    providers: PropTypes.instanceOf(Map),
    signupProvider: PropTypes.instanceOf(Map),
    showErrors: PropTypes.func.isRequired,
  }

  componentDidMount() {
    const { trackSignup } = this.props;
    trackSignup(trackingTypes.FORM_ACTIONS.START);
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

  onClickLogin = () => {
    const { trackSignup } = this.props;
    trackSignup(trackingTypes.FORM_ACTIONS.CANCEL);
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

  trackClick = linkName => () => {
    const { trackOpenExternalLink } = this.props;
    trackOpenExternalLink(linkName);
  }

  render() {
    const {
      handleSubmit,
      isAuthenticated,
      providers,
      signupProvider,
      submitting,
      trackSignup,
    } = this.props;

    if (isAuthenticated) {
      return <Redirect to="/dashboard" />;
    }

    return (
      <div>
        <Header dark logoRedirectUrl={ routes.ABSOLUTE_PATHS.SIGNUP }>
          <li>
            <Button
              id="signin"
              btnStyle="subtleLink"
              color={ color.light.secondary }
              onClick={ this.onClickLogin }
              to={ routes.ABSOLUTE_PATHS.LOGIN }
              type="href"
            >
              Already have an account? Login
            </Button>
          </li>
        </Header>

        <Content className="row" onSubmit={ handleSubmit }>
          <div className="col-sm-6">
            <Title type="h1">
              Unlock the power of collaboration
            </Title>

            <Title type="subtitle3">
              Select a tool to create your Unito account so you can start
              syncing your tasks and projects right away!
            </Title>

            <Details className="fa-ul">
              <li>
                <Icon name="check" className="fa-li" color={ color.brand.primary } />
                14 days free trial
              </li>
              <li>
                <Icon name="check" className="fa-li" color={ color.brand.primary } />
                No credit card required
              </li>
              <li>
                <Icon name="check" className="fa-li" color={ color.brand.primary } />
                Support by friendly experts
              </li>
            </Details>
          </div>
          <div className="col-sm-6">
            <Card color={ color.light.primary } padding="32px">

              <SectionTitle>
                Select the tool that you want to sign up with
              </SectionTitle>

              <div className="form-group">
                <Field
                  name="signupProvider"
                  component={ SelectProviderField }
                  props={{
                    id: 'signupProvider',
                    providers,
                    track: trackSignup,
                  }}
                />
              </div>

              <Agreement className="form-group">
                <Field
                  name="agreementValue"
                  component={ CheckboxField }
                  props={{
                    id: 'agreementValue',
                    label: <span>I agree to Unito's { ' ' }
                      <Href onClick={ this.trackClick('terms') } href="https://unito.io/terms">Terms of service</Href> { ' ' }
                      and <Href onClick={ this.trackClick('privacy') } href="https://unito.io/privacy">Privacy policy</Href>
                    </span>,
                  }}
                />
              </Agreement>

              <Button
                block
                btnStyle="purple"
                disabled={ submitting }
                type="submit"
              >
                { signupProvider ? `Create account with ${signupProvider.get('displayName')}` : 'Create account' }
              </Button>

            </Card>
          </div>
        </Content>
      </div>
    );
  }
}
SignupContainer = reduxForm({
  form: 'signupForm',
  asyncValidate: (values, dispatch, props, fieldString) => {
    const { trackSignup } = props;
    const { signupProvider, agreementValue } = values;
    if (!fieldString && formUtils.isEmpty(signupProvider)) {
      const reason = 'Sorry, you need to select a tool to create your account';
      trackSignup(trackingTypes.FORM_ACTIONS.VALIDATION_FAILED, { reason });
      return Promise.reject({ signupProvider: reason });
    }

    if (!fieldString && !agreementValue) {
      const reason = "You need to agree to Unito's Terms of service and Privacy policy to create your account";
      trackSignup(trackingTypes.FORM_ACTIONS.VALIDATION_FAILED, { reason });
      return Promise.reject({ agreementValue: reason });
    }

    return Promise.resolve();
  },
})(SignupContainer);

const selector = formValueSelector('signupForm');

const mapStateToProps = state => ({
  isAuthenticated: getIsAuthenticated(state),
  providers: getProvidersThatCanLogin(state),
  signupProvider: selector(state, 'signupProvider'),
});

const mapDispatchToProps = dispatch => ({
  showErrors: (message) => {
    dispatch(notify({
      title: 'Unable to log in',
      message,
      status: 'error',
      dismissible: true,
      position: 'tc',
      buttons: [{
        name: 'Get help',
        primary: true,
        onClick: () => { window.open(`https://guide.unito.io/hc/en-us/search?query=${message}`, '_blank'); },
      },
      ],
    }));
  },
  trackOpenExternalLink: (linkName) => {
    const eventName = `USER_OPENED_LINK_${linkName.toUpperCase()}`;
    dispatch(trackingActions.trackAnonymousEvent(eventName));
  },
  trackSignup: (action, data) => {
    const eventName = `USER_SIGNUP_${action}`;
    dispatch(trackingActions.trackAnonymousEvent(eventName, data));
  },
  onSubmit: async ({ signupProvider, agreementValue }) => {
    const eventName = `USER_SIGNUP_${trackingTypes.FORM_ACTIONS.SUBMIT}`;
    dispatch(trackingActions.trackAnonymousEvent(eventName, { providerName: signupProvider.get('name') }));

    dispatch(trackingActions.trackAnonymousEvent(trackingTypes.AUTH_SETUP.USER_OAUTH_START, {
      context: 'signup',
      'provider.connectorName': signupProvider.get('connectorName'),
      agreementValue,
    }));

    if (signupProvider.get('domainRequired')) {
      appHistory.push({ pathname: `/signup/${signupProvider.get('connectorName')}`, search: `?termsPrivacyConsent=${agreementValue}` });
      return;
    }

    const { authenticationUrl } = await dispatch(authActions.authenticate({
      productName: 'projectSync',
      providerName: signupProvider.get('name'),
      termsPrivacyConsent: agreementValue,
    }));
    global.window.location.assign(authenticationUrl);
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SignupContainer);



// WEBPACK FOOTER //
// ./src/containers/SignupContainer/SignupContainer.jsx