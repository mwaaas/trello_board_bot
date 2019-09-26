import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { TextInput, Title } from '../../components';
import { getDefaultLinkName } from '../../reducers';


class GiveSyncName extends Component {
  static propTypes = {
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
  };

  componentDidMount() {
    const { defaultSyncName, input } = this.props;
    input.onChange(defaultSyncName);
  }

  componentWillReceiveProps(nextProps) {
    const { defaultSyncName, input } = this.props;
    if (defaultSyncName !== nextProps.defaultSyncName) {
      input.onChange(nextProps.defaultSyncName);
    }
  }

  render() {
    return (
      <div className="give-sync-name">
        <Title type="h3">Give your sync a name</Title>
        <TextInput maxLength={ 75 } {...this.props} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  defaultSyncName: getDefaultLinkName(state),
});

export default connect(mapStateToProps)(GiveSyncName);



// WEBPACK FOOTER //
// ./src/containers/GiveSyncName/GiveSyncName.jsx