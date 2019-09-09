import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addNotification as notify } from 'reapop';

import { providerIdentityActions } from '../../actions';
import { getProviderById } from '../../reducers';
import { getPopupTopLeftValues } from '../../utils';


const mapStateToProps = (state, ownProps) => ({
  provider: getProviderById(state, ownProps),
});

const mapDispatchToProps = dispatch => ({
  getProviderIdentitySuccess: (providerIdentity) => {
    dispatch(providerIdentityActions.getProviderIdentitySuccess(providerIdentity));
  },
  getProviderIdentityFailure: (error) => {
    if (error) {
      dispatch(notify({
        title: 'Something went wrong :(',
        ...error,
        position: 'tc',
        closeButton: true,
      }));
    }
  },
});

export default (WrappedComponent) => {
  class OAuthPopup extends Component {
    handleAuthorizeProvider = () => {
      this.openPopupWindow();
      this.setEventListener(this.props);
    }

    openPopupWindow = () => {
      const authUrl = this.getAuthUrl();
      const options = this.createOptions();
      const authPopup = window.open(authUrl, 'auth', `${options},resizable`);
      authPopup && authPopup.focus();
    }

    setEventListener({
      getProviderIdentityFailure, getProviderIdentitySuccess, onFailure, onSuccess,
    }) {
      const handleMessage = function (e) { // eslint-disable-line
        try {
          const dataKeys = Object.keys(e.data);
          // Some tracking libraries also send a postMessage event, only listen to the one defined by Unito
          if (!dataKeys.includes('success') || !dataKeys.includes('providerIdentity')) {
            return;
          }

          if (e.data.success) {
            // If you call onSuccess and you need to rehydrate the state, do it manually.
            // Having both onSuccess and rehydrateAuthState caused issues on Firefox and Safari,
            // because of this https://bugzilla.mozilla.org/show_bug.cgi?id=1280189
            if (e.data.providerIdentity) {
              getProviderIdentitySuccess(e.data.providerIdentity);
            }
            onSuccess && onSuccess(e.data);
          } else if (e.data.success === false) {
            getProviderIdentityFailure(e.data.error);
            onFailure && onFailure(e.data.error);
          }
        } catch (err) {
          console.log(err); // eslint-disable-line
        }

        global.window.removeEventListener('message', handleMessage, false);
      };

      // Don't use an arrow function, or the event listener will never fire the function
      global.window.addEventListener('message', handleMessage, false);
    }

    getAuthUrl = () => {
      const {
        provider, isLogin, isEmbed, botGuidance, providerIdentityId,
      } = this.props;

      const params = {
        popup: true,
        botGuidance: !isLogin && botGuidance,
        isEmbed,
        providerIdentityId,
      };
      const queryParams = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
      const baseServerUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';
      const baseUrl = isLogin ? `${baseServerUrl}/api/v1/login/${provider.get('name')}` : provider.get('authUrl');
      return `${baseUrl}?${queryParams}`;
    }

    createOptions = () => {
      const width = 1000;
      const height = 785;
      const { left, top } = getPopupTopLeftValues(width, height);
      const options = {
        copyhistory: 'no',
        directories: 'no',
        height,
        left,
        location: 'no',
        scrollbars: 'yes',
        status: 'no',
        toolbar: 'no',
        top,
        width,
      };
      return Object.keys(options).map(key => `${key}=${options[key]}`).join(',');
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          onClick={ this.handleAuthorizeProvider }
        />
      );
    }
  }

  OAuthPopup.propTypes = {
    botGuidance: PropTypes.bool,
    domain: PropTypes.string,
    onSuccess: PropTypes.func,
    onFailure: PropTypes.func,
    providerId: PropTypes.string,
    providerIdentityId: PropTypes.string,
    getProviderIdentitySuccess: PropTypes.func.isRequired,
    getProviderIdentityFailure: PropTypes.func.isRequired,
  };

  OAuthPopup.defaultProps = {
    botGuidance: false,
    isLogin: false,
    isEmbed: false,
    domain: '',
    // If reconnecting a provider identity, give its id
    providerIdentityId: '',
  };

  return connect(mapStateToProps, mapDispatchToProps)(OAuthPopup);
};



// WEBPACK FOOTER //
// ./src/containers/OAuthPopupHoC/OAuthPopupHoC.jsx