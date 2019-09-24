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
  Href,
  SelectProviderDropdown,
  Title,
} from '../../components';
import { routes, trackingTypes } from '../../consts';
import { getProvidersThatCanLogin } from '../../reducers';
import { formUtils } from '../../utils';

const Container = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: auto;
  min-height: 100vh;
`;

const Content = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height:auto;
  margin: 0 auto;
  padding-top: 4vh;
  text-align: left;
`;

const SectionTitle = styled.h5`
  font-size: ${fontSize.subheading};
  margin-bottom: 32px;
  text-align: center;
`;

const SelectProviderDropdownWrapper = styled.div`
  margin: 0 auto;
  width: 316px;
`;

const TextCenter = styled.div`
  text-align: center;
`;

const ElementMarginTop = styled.div`
  margin-top: 1rem;
`;

const ModifierFontSize = styled.span`
  font-size: 14px;
`;

const UnitoLogo = styled.img`
  width: 10rem;
  height: auto;
  margin-bottom: 2rem;
`;

const Partners = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem 0rem;
`;

const PartnersLogos = styled.div`
  display: flex;
  flex-wrap:wrap;
  justify-content: space-around;
  align-items: center;
  margin: 0 auto;
`;

const PartnerLogo = styled.img`
  margin: 1rem;
  width: auto;
  height: 3rem;
`;

const SmallerPartnerLogo = styled.img`
  margin: 1rem;
  width: auto;
  height: 2rem;
`;

const UNITO_LOGO_IMG_SRC = `${process.env.PUBLIC_URL}/images/unito_logo_color_horiz.svg`;
// Partners logos
const HP_LOGO_IMG_SRC = `${process.env.PUBLIC_URL}/images/hp_logo_compressed.svg`;
const WA_POST_LOGO_IMG_SRC = `${process.env.PUBLIC_URL}/images/washingtonpost_logo_compressed.svg`;
const WIX_LOGO_IMG_SRC = `${process.env.PUBLIC_URL}/images/wix_logo_compressed.svg`;



class LoginContainer extends Component {
  static propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    location: PropTypes.object,
    loginProvider: PropTypes.instanceOf(Map),
    providers: PropTypes.instanceOf(Map),
    showErrors: PropTypes.func.isRequired,
    trackLogin: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { trackLogin } = this.props;
    trackLogin(trackingTypes.FORM_ACTIONS.START);
    this.showServerErrors();
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
  };

  render() {
    const {
      handleSubmit,
      isAuthenticated,
      providers,
      submitting,
      trackLoginAction,
      submitSucceeded,
    } = this.props;

    if (isAuthenticated) {
      return <Redirect to={ routes.ABSOLUTE_PATHS.DASHBOARD } />;
    }

    return (
      <Container className="container">
        <Content onSubmit={ handleSubmit }>
          <TextCenter>
            <Href
              href="https://unito.io/"
              onClick={ () => trackLoginAction('clicked on Unito logo') }
            >
              <UnitoLogo
                src={UNITO_LOGO_IMG_SRC}
                alt="Unito logo"
              />
            </Href>
            <Title type="h1">
              <strong>Welcome back!</strong>
            </Title>
          </TextCenter>
          <Card color={ color.light.primary } padding="32px">
            <SectionTitle>
              Log in to your account below
            </SectionTitle>
            <SelectProviderDropdownWrapper className="form-group">
              <Field
                name="loginProvider"
                component={ SelectProviderDropdown }
                props={{
                  id: 'loginProvider',
                  providers,
                  track: trackLoginAction,
                  placeholder: 'Select a tool to log in with',
                }}
              />
            </SelectProviderDropdownWrapper>
            <Button
              block
              btnStyle="darkBlue"
              data-test="login__btn--login"
              disabled={ !!submitting || !!submitSucceeded }
              type="submit"
              size="lg"
            >
              Login
            </Button>
            <ElementMarginTop>
              <TextCenter>
                <ModifierFontSize>
                  Don't have an account yet?{' '}
                  <strong>
                    <Href
                      to={ routes.ABSOLUTE_PATHS.SIGNUP }
                      linkStyle="blue"
                      onClick={ () => trackLoginAction('clicked Privacy policy') }
                    >
                      Sign up
                    </Href>
                  </strong>
                </ModifierFontSize>
              </TextCenter>
            </ElementMarginTop>
          </Card>
        </Content>
        <Partners>
          <Title type="subtitle2">
            Trusted by teams including:
          </Title>
          <PartnersLogos>
            <PartnerLogo
              src={HP_LOGO_IMG_SRC}
              alt="HP logo"
            />
            <PartnerLogo
              src={WA_POST_LOGO_IMG_SRC}
              alt="The Washington Post logo"
            />
            <SmallerPartnerLogo
              src={WIX_LOGO_IMG_SRC}
              alt="Wix logo"
            />
          </PartnersLogos>
        </Partners>
      </Container>
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
  loginProvider: selector(state, 'loginProvider.provider'),
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
  trackLoginAction: (actionName, data) => {
    const eventName = 'LOGIN_ACTION';
    dispatch(trackingActions.trackAnonymousEvent(eventName, { action_name: actionName, ...data }));
  },
  onSubmit: async (formValues) => {
    const { loginProvider, ...rest } = formValues;
    const { provider } = loginProvider;
    dispatch(trackingActions.trackAnonymousEvent(`USER_LOGIN_${trackingTypes.FORM_ACTIONS.SUBMIT}`, {
      ...rest,
      providerName: provider.get('name'),
      connectorName: provider.get('connectorName'),
    }));

    dispatch(trackingActions.trackAnonymousEvent(trackingTypes.AUTH_SETUP.USER_OAUTH_START, {
      context: 'login',
      'provider.connectorName': provider.get('connectorName'),
    }));

    if (provider.get('domainRequired')) {
      appHistory.push({ pathname: `/login/${provider.get('connectorName')}` });
      return;
    }

    const { authenticationUrl } = await dispatch(authActions.authenticate({
      productName: 'projectSync',
      providerName: provider.get('name'),
    }));

    global.window.location.assign(authenticationUrl);
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginContainer);



// WEBPACK FOOTER //
// ./src/containers/LoginContainer/LoginContainer.jsx