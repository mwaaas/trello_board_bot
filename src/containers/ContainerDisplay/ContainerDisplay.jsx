import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Map } from 'immutable';

import { containerActions } from '../../actions';
import { ContainerIcon, InlineLoading, ReadOnlyInputField } from '../../components';
import { getContainerById, getProviderByProviderIdentityId } from '../../reducers';
import { formUtils } from '../../utils';


class ContainerDisplay extends Component {
  static propTypes = {
    container: PropTypes.instanceOf(Map).isRequired,
    containerId: PropTypes.string.isRequired,
    containerSide: PropTypes.oneOf(['A', 'B']).isRequired,
    getContainer: PropTypes.func.isRequired,
    label: PropTypes.string,
    providerIdentityId: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['input', 'icon', 'name', 'inputNoLabel']),
    noUrl: PropTypes.bool,
    shortenLength: PropTypes.number,
  };

  static defaultProps = {
    noUrl: false,
    type: 'input',
  };

  componentDidMount() {
    const { container, containerId, getContainer } = this.props;

    if (containerId && (container.isEmpty() || container.get('isLoading'))) {
      getContainer(containerId);
    }
  }

  componentDidUpdate(prevProps) {
    const { containerId, getContainer } = this.props;

    if (!prevProps.containerId && containerId) {
      getContainer(containerId);
    }
  }

  render() {
    const {
      container,
      type,
      provider,
      noUrl,
      shortenLength,
    } = this.props;

    const containerName = shortenLength
      ? formUtils.shortenString(container.get('displayName'), shortenLength, '')
      : container.get('displayName');

    if (container.isEmpty() || container.get('isLoading')) {
      return <InlineLoading size="small" />;
    }

    if (type === 'inputNoLabel') {
      return (
        <ReadOnlyInputField>
          { containerName }
        </ReadOnlyInputField>
      );
    }

    if (type === 'input') {
      const label = this.props.label || `${container.getIn(['containerType', 'displayName'])} name`;
      return (
        <ReadOnlyInputField label={ label }>
          { containerName }
        </ReadOnlyInputField>
      );
    }

    if (type === 'icon') {
      return (
        <ContainerIcon
          container={ container }
          iconSize="sm"
          provider={ provider }
          showName
          noUrl={ noUrl }
        />
      );
    }

    return <em>{ containerName }</em>;
  }
}

const mapStateToProps = (state, { containerId, containerSide, providerIdentityId }) => ({
  container: getContainerById(state, containerSide, containerId),
  provider: getProviderByProviderIdentityId(state, providerIdentityId),
});

const mapDispatchToProps = (dispatch, { providerIdentityId, containerSide }) => ({
  getContainer: (containerId) => {
    dispatch(containerActions.getContainerById(providerIdentityId, containerId, containerSide));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ContainerDisplay);



// WEBPACK FOOTER //
// ./src/containers/ContainerDisplay/ContainerDisplay.jsx