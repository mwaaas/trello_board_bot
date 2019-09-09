import React, { Component } from 'react';
import PropTypes from 'prop-types';

import * as Icons from '.';

const StatusesToIcon = {
  neutral: Icons.UnitoLogo,
  success: Icons.UnitoLogo,
  failure: Icons.ErrorLogo,
};


export default class AuthProviderIcon extends Component {
  static propTypes = {
    status: PropTypes.oneOf(Object.keys(StatusesToIcon)),
    providerName: PropTypes.string.isRequired,
    iconSize: PropTypes.number,
    isCentered: PropTypes.bool,
  };

  static defaultProps = {
    status: Object.keys(StatusesToIcon)[0],
    iconSize: 115,
    isCentered: false,
  };

  render() {
    const {
      iconSize,
      isCentered,
      status,
      providerName,
    } = this.props;
    const Element = Icons[`${providerName}Icon`];
    const miniIcon = StatusesToIcon[status];

    return (
      <div style={{ width: iconSize, margin: isCentered ? '0 auto' : 'initial' }}>
        <Element MiniIcon={miniIcon} />
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/AuthProviderIcon/AuthProviderIcon.jsx