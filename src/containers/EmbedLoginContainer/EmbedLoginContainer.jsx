import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Map } from 'immutable';

import { authActions } from '../../actions';
import { Header, Title, Footer } from '../../components';
import { routes } from '../../consts';
import { AuthorizeProviderButton } from '../../containers';
import { getProviderByName } from '../../reducers';


const Content = styled.div`
  max-width: 768px;
  padding-top: 112px;
`;

const Paragraph = styled.p`
  margin-bottom: 2rem;
`;


class EmbedLoginContainer extends Component {
  static propTypes = {
    location: PropTypes.object,
    provider: PropTypes.instanceOf(Map).isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  };

  onAuthorizeSuccess = async ({ isSignup }) => {
    const { history, rehydrateAuthState } = this.props;
    await rehydrateAuthState();

    if (isSignup) {
      history.replace(routes.ABSOLUTE_PATHS.USE_CASES);
      return;
    }

    history.replace(routes.ABSOLUTE_PATHS.DASHBOARD);
  }

  render() {
    const { provider } = this.props;
    if (provider.isEmpty()) {
      return null;
    }

    const providerName = provider.get('displayName');
    const containers = provider.getIn(['capabilities', 'terms', 'container', 'plural']);

    return (
      <div className="embed-login-container">
        <Header dark logoRedirectUrl={ routes.ABSOLUTE_PATHS.LOGIN } />
        <Content className="container text-center">
          <Title>Welcome to Unito</Title>

          <Paragraph>
            Unito needs access to { providerName } to sync your { containers }. <br />
            Authorize { providerName } to get started.
          </Paragraph>

          <AuthorizeProviderButton
            includeProviderIcon
            isEmbed
            isLogin
            onSuccess={ this.onAuthorizeSuccess }
            providerId={ provider.get('_id') }
          >
            Authorize { provider.get('displayName') }
          </AuthorizeProviderButton>

          <Footer>
            By clicking Authorize Trello, you agree to Unito's { ' ' }
            <a href="https://unito.io/terms/" title="Unito Terms of service">Terms of service</a> { ' ' }
            and <a href="https://unito.io/privacy/" title="Unito Privacy Policy">Privacy policy</a>.
          </Footer>
        </Content>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  provider: getProviderByName(state, ownProps.match.params.embedName),
});

const mapDispatchToProps = dispatch => ({
  rehydrateAuthState: () => dispatch(authActions.rehydrateAuthState()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EmbedLoginContainer));



// WEBPACK FOOTER //
// ./src/containers/EmbedLoginContainer/EmbedLoginContainer.jsx