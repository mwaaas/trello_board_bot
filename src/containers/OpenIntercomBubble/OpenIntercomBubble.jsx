import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { FeatureFlag, FeatureFlagVariant } from '../../containers';
import { flagTypes } from '../../consts';


export default class OpenIntercomBubble extends Component {
  static propTypes = {
    children: PropTypes.node,
    message: PropTypes.string,
    onClick: PropTypes.func,
    flagType: PropTypes.oneOf([flagTypes.TYPES.USER, flagTypes.TYPES.COHORT]),
  };

  static defaultProps = {
    children: 'get in touch with our customer support',
    message: '',
  };

  openIntercom = () => {
    const { message } = this.props;
    if (message) {
      window.Intercom('showNewMessage', message);
      return;
    }

    window.Intercom('show');
  }

  openWindowMailTo = () => {
    const { message, onClick } = this.props;

    onClick && onClick();
    window.open(`mailto:help@unito.io?subject=Support needed&body=${message}`, '_blank');
  }

  handleOnClick = () => {
    const { onClick } = this.props;

    // If user is blocking intercom, send an email to support instead
    if (!window.Intercom) {
      this.openWindowMailTo();
      return;
    }

    onClick && onClick();
    this.openIntercom();
  }

  render() {
    const { children, flagType } = this.props;

    return (
      <FeatureFlag name="intercom-enabled-in-power-up" type={ flagType }>
        <FeatureFlagVariant value={ true }>
          <a
            onClick={ this.handleOnClick }
            onKeyPress={ this.handleOnClick }
            role="button"
            tabIndex="0"
          >
            { children }
          </a>
        </FeatureFlagVariant>
        <FeatureFlagVariant value={ false }>
          <a
            onClick={ this.openWindowMailTo }
            onKeyPress={ this.openWindowMailTo }
            role="button"
            tabIndex="0"
          >
            { children }
          </a>
        </FeatureFlagVariant>
      </FeatureFlag>
    );
  }
}



// WEBPACK FOOTER //
// ./src/containers/OpenIntercomBubble/OpenIntercomBubble.jsx