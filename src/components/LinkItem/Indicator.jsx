import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { FeatureFlag, FeatureFlagVariant } from '../../containers';
import {
  linkHasErrors,
  linkSyncHistoryHasLoaded,
} from '../../reducers';
import { color } from '../../theme';


const StyledIndicator = styled.div`
  &:before {
    position: absolute;
    content: ' ';
    background: ${props => props.color};
    top: 0;
    left: 0;
    bottom: 0;
    width: 6px;
    border-radius: 3px 0 0 3px;
  }
`;


class Indicator extends Component {
  static propTypes = {
    hasLoadedSyncHistory: PropTypes.bool.isRequired,
    hasError: PropTypes.bool.isRequired,
    isAutoSync: PropTypes.bool.isRequired,
    isSuspended: PropTypes.bool.isRequired,
    syncHistory: PropTypes.instanceOf(List),
  }

  getIndicatorColor = () => {
    const {
      hasError,
      hasLoadedSyncHistory,
      isAutoSync,
      isSuspended,
    } = this.props;

    if (!isAutoSync || isSuspended) {
      return color.dark.whisper;
    }

    if (hasLoadedSyncHistory && hasError) {
      return color.brand.error;
    }

    return color.brand.success;
  }

  render() {
    return (
      <FeatureFlag name="sync-indicator">
        <FeatureFlagVariant value={ true }>
          <StyledIndicator className="indicator" color={ this.getIndicatorColor() } />
        </FeatureFlagVariant>
      </FeatureFlag>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  hasError: linkHasErrors(state, ownProps.linkId),
  hasLoadedSyncHistory: linkSyncHistoryHasLoaded(state, ownProps.linkId),
});

export default connect(mapStateToProps)(Indicator);



// WEBPACK FOOTER //
// ./src/components/LinkItem/Indicator.jsx