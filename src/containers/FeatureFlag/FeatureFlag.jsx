import { childrenOfType } from 'airbnb-prop-types';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { flagTypes } from '../../consts';
import FeatureFlagVariant from '../../containers/FeatureFlag/FeatureFlagVariant';
import { getFeatureFlagValue } from '../../reducers';


// Export the unconnected component so it's testable
export class FeatureFlag extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    type: PropTypes.oneOf([flagTypes.TYPES.USER, flagTypes.TYPES.COHORT]),
    flagValue: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    children: childrenOfType(FeatureFlagVariant).isRequired,
  }

  static defaultProps = {
    type: flagTypes.TYPES.USER,
  }

  isFlagActive = (childValue) => {
    const { flagValue } = this.props;

    // Show only when the variant is exactly the same as the current flag
    return childValue === flagValue
      // Or show for any of the variants of the current flag when the value is true
      || (childValue === true && !!flagValue);
  }

  render() {
    const { children } = this.props;

    const [Variant = null] = React.Children.map(children, (child) => {
      if (this.isFlagActive(child.props.value)) {
        return child;
      }
    }) || [];

    return Variant;
  }
}

const mapStateToProps = (state, ownProps) => ({
  flagValue: getFeatureFlagValue(state, ownProps.name, (ownProps.type || flagTypes.TYPES.USER)),
});

// Be sure to import the default when using the FeatureFlag container if not importing from containers/index.js
export default connect(mapStateToProps)(FeatureFlag);



// WEBPACK FOOTER //
// ./src/containers/FeatureFlag/FeatureFlag.jsx