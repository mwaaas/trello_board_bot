import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import styled from 'styled-components';
import { reduxForm, SubmissionError } from 'redux-form';

import { authActions, trackingActions } from '../../actions';
import { appTypes, trackingTypes } from '../../consts';
import {
  Alert,
  AuthProviderIcon,
  Button,
  Card,
  Href,
  Section,
  Title,
} from '../../components';
import { getProviderByConnectorName, getProviderByNamePreferredAuthMethod } from '../../reducers';
import { color } from '../../theme';
import { AuthConfigure, AuthDomain } from '.';


const ButtonsWrapper = styled.div`
  > .btn {
    margin-left: 1rem;
    float: right;
  }

  margin: 2rem 0 1rem;
`;

// todo annotation
// @reduxForm({
//   form: 'authentication',
//   enableReinitialize: true,
// })
class AuthSetup extends Component {
  static propTypes = {
    error: PropTypes.string,
    handleSubmit: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    provider: PropTypes.instanceOf(Map).isRequired,
    submitFailed: PropTypes.bool.isRequired,
    submitSucceeded: PropTypes.bool.isRequired,
    trackAnonymousEvent: PropTypes.func.isRequired,
    testConnection: PropTypes.func.isRequired,
    authenticate: PropTypes.func.isRequired,
    validateDomain: PropTypes.func.isRequired,
  };

  state = {
    requiresSetup: null,
  };

  isAuthenticating = () => {
    const {
      match: {
        params: { method },
      },
    } = this.props;

    return ['login', 'signup'].includes(method);
  };

  getVisibleAuthorizationMethods = () => {
    const { provider } = this.props;
    const authorizationMethods = provider.getIn(['capabilities', 'authentication', 'authorizationMethods'], Map());
    return authorizationMethods.filter(authMethod => authMethod.get('canAuthenticate') && this.isAuthenticating());
  };

  handleValidateDomain = async (values) => {
    const {
      authenticate,
      history,
      match,
      provider,
      validateDomain,
      trackAnonymousEvent,
    } = this.props;

    let valid;
    let requiresSetup;
    let errorMessage;
    let correctedDomain;

    trackAnonymousEvent(trackingTypes.AUTH_SETUP.USER_OAUTH_ENTER_URL_NEXT, { domainUrl: values.domainUrl });
    try {
      ({
        correctedDomain,
        valid,
        requiresSetup,
        errorMessage,
      } = await validateDomain(provider.get('name'), values.domainUrl));
    } catch (err) {
      trackAnonymousEvent(trackingTypes.AUTH_SETUP.USER_OAUTH_ENTER_URL_FAILURE, {
        domainUrl: values.domainUrl,
        failureReason: err.message,
      });
      throw new SubmissionError({ _error: err.message });
    }

    if (!valid) {
      trackAnonymousEvent(trackingTypes.AUTH_SETUP.USER_OAUTH_ENTER_URL_FAILURE, {
        domainUrl: values.domainUrl,
        failureReason: errorMessage,
        failedValidation: valid,
        requiresSetup,
      });
      throw new SubmissionError({ _error: errorMessage });
    }

    this.props.change('domainUrl', correctedDomain);
    this.setState({ requiresSetup });
    if (requiresSetup) {
      history.push(`${match.url}/configure`);
      return Promise.resolve();
    }

    trackAnonymousEvent(trackingTypes.AUTH_SETUP.USER_OAUTH_SUBMIT, { domainUrl: values.domainUrl });
    try {
      await authenticate(provider.get('name'), values);
    } catch (err) {
      trackAnonymousEvent(trackingTypes.AUTH_SETUP.USER_OAUTH_FAILURE, {
        domainUrl: values.domainUrl,
        failureReason: err.message,
      });
      throw new SubmissionError({ _error: err.message });
    }

    return Promise.resolve();
  };

  testConnectionAndAuthenticate = async (values) => {
    const {
      trackAnonymousEvent,
      testConnection,
      authenticate,
      provider,
    } = this.props;
    const { password, clientSecret, ...trackableValues } = values;
    trackAnonymousEvent(trackingTypes.AUTH_SETUP.USER_OAUTH_SUBMIT, trackableValues);

    const { valid, errorMessage } = await testConnection(provider.get('name'), values);
    if (!valid) {
      trackAnonymousEvent(trackingTypes.AUTH_SETUP.USER_OAUTH_CHOOSE_METHOD_FAILURE, {
        ...trackableValues,
        failureReason: errorMessage,
        failedValidation: valid,
      });
      throw new SubmissionError({ selfSignedCertificate: errorMessage });
    }

    try {
      await authenticate(provider.get('name'), values);
    } catch (err) {
      trackAnonymousEvent(trackingTypes.AUTH_SETUP.USER_OAUTH_FAILURE, {
        ...trackableValues,
        failureReason: err.message,
      });
      throw new SubmissionError({ authorizationMethod: err.message });
    }

    return Promise.resolve();
  };

  handleCancel = (eventName) => {
    const { history, match, trackAnonymousEvent } = this.props;
    trackAnonymousEvent(eventName);
    history.push(`/${match.params.method}`);
  };

  render() {
    const {
      match,
      provider,
      handleSubmit,
      error,
      submitSucceeded,
      submitFailed,
      ...rest
    } = this.props;

    return (
      <div className="container">
        <form className="col-md-10 col-md-offset-1" onSubmit={e => e.preventDefault()}>
          <Card color={color.light.primary} padding="5rem" style={{ margin: '5rem 0' }}>
            <AuthProviderIcon isCentered iconSize={115} providerName={match.params.connectorName} />
            <Title type="h1" className="text-center">
              Connect {provider.get('displayName')} with Unito <br />
              <Route exact path={[match.path, `${match.path}/`]} render={() => <span>(Step 1 of 2)</span>} />
              <Route exact path={`${match.path}/configure`} render={() => <span>(Step 2 of 2)</span>} />
            </Title>
            <Route
              {...rest}
              path={[match.path, `${match.path}/`]}
              render={routeProps => (
                <Section>
                  <AuthDomain
                    {...routeProps}
                    provider={provider}
                    isTested={submitFailed || submitSucceeded}
                    hasError={!!error}
                    isAuthenticating={this.isAuthenticating()}
                  />
                </Section>
              )}
            />
            <Route
              {...rest}
              exact
              path={`${match.path}/configure`}
              render={routeProps => (
                <AuthConfigure
                  {...routeProps}
                  provider={provider}
                  requiresSetup={this.state.requiresSetup}
                  visibleAuthorizationMethods={this.getVisibleAuthorizationMethods()}
                />
              )}
            />
            <ButtonsWrapper className="clearfix">
              <Route
                exact
                path={[match.path, `${match.path}/`]}
                render={() => (
                  <Button btnStyle="dark" onClick={handleSubmit(this.handleValidateDomain)}>
                    Connect
                  </Button>
                )}
              />
              <Route
                exact
                path={`${match.path}/configure`}
                render={() => (
                  <Button btnStyle="dark" onClick={handleSubmit(this.testConnectionAndAuthenticate)}>
                    Authorize
                  </Button>
                )}
              />
              <Route
                exact
                path={[match.path, `${match.path}/`]}
                render={() => (
                  <Button
                    reverse
                    btnStyle="dark"
                    onClick={() => this.handleCancel(trackingTypes.AUTH_SETUP.USER_OAUTH_ENTER_URL_CANCEL)}
                  >
                    Cancel
                  </Button>
                )}
              />
              <Route
                exact
                path={`${match.path}/configure`}
                render={() => (
                  <Button
                    reverse
                    btnStyle="dark"
                    onClick={() => this.handleCancel(trackingTypes.AUTH_SETUP.USER_OAUTH_CHOOSE_METHOD_CANCEL)}
                  >
                    Cancel
                  </Button>
                )}
              />
            </ButtonsWrapper>
            {!this.isAuthenticating() && (
              <Alert level="info">
                For best results, we recommend that you use an administrator account or a{' '}
                <Href href="https://guide.unito.io/hc/en-us/articles/224412908-Create-a-Bot-User">bot account</Href>
                .
              </Alert>
            )}
          </Card>
        </form>
      </div>
    );
  }
}
AuthSetup = reduxForm({
  form: 'authentication',
  enableReinitialize: true,
})(AuthSetup);

const mapStateToProps = (state, props) => {
  const provider = getProviderByConnectorName(state, props.match.params.connectorName);
  return {
    provider,
    initialValues: {
      authorizationMethod: getProviderByNamePreferredAuthMethod(state, provider.get('name')),
    },
  };
};

const mapDispatchToProps = (dispatch, props) => ({
  validateDomain: async (providerName, domainUrl) =>
    dispatch(authActions.validateDomain(providerName, domainUrl)),
  testConnection: async (providerName, values) =>
    dispatch(authActions.testConnection(providerName, {
      domain: values.domainUrl,
      selfSignedCertificate: values.selfSignedCertificate,
    })),
  authenticate: async (providerName, values) => {
    const termsPrivacyConsent = props.location.search.includes('termsPrivacyConsent=true');
    const { authenticationUrl } = await dispatch(authActions.authenticate({
      productName: appTypes.PRODUCT_NAMES.PROJECT_SYNC,
      providerName,
      domain: values.domainUrl,
      selfSignedCertificate: values.selfSignedCertificate,
      apiUrl: values.apiUrl,
      termsPrivacyConsent,
    }));
    global.window.location.assign(authenticationUrl);
  },
  trackAnonymousEvent: (eventName, data) =>
    dispatch(trackingActions.trackAnonymousEvent(eventName, {
      ...data,
      'provider.connectorName': props.match.params.connectorName,
      context: props.match.params.method,
    })),
});

export default connect(mapStateToProps, mapDispatchToProps)(AuthSetup);



// WEBPACK FOOTER //
// ./src/containers/authentication/AuthSetup.jsx