import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Icon } from '../../components';
import { color } from '../../theme';


export default class SyncDirectionIcon extends Component {
  static propTypes = {
    readOnlyA: PropTypes.bool.isRequired,
    readOnlyB: PropTypes.bool.isRequired,
    size: PropTypes.string,
  };

  getIconName = () => {
    const { readOnlyA, readOnlyB, multisync } = this.props;

    if (multisync) {
      return 'plus';
    }

    if (readOnlyA) {
      return 'long-arrow-right';
    }

    if (readOnlyB) {
      return 'long-arrow-left';
    }

    return 'exchange';
  }

  render() {
    const { size } = this.props;

    return (
      <Icon
        color={ this.props.color || color.dark.primary }
        size={ size }
        name={ this.getIconName() }
      />
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/SyncDirectionIcon/SyncDirectionIcon.jsx