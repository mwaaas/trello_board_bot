import PropTypes from 'prop-types';
import { Component } from 'react';

export default class FeatureFlagVariant extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
  };

  render() {
    return this.props.children;
  }
}



// WEBPACK FOOTER //
// ./src/containers/FeatureFlag/FeatureFlagVariant.jsx