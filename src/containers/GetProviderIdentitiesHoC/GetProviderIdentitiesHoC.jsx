import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { providerIdentityActions } from '../../actions';


const HoC = (WrappedComponent) => {
  class GetProviderIdentitiesHoC extends Component {
    static propTypes = {
      getProviderIdentities: PropTypes.func.isRequired,
    };

    componentDidMount() {
      this.props.getProviderIdentities();
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  const mapDispatchToProps = dispatch => ({
    getProviderIdentities: () => {
      dispatch(providerIdentityActions.getProviderIdentities());
    },
  });

  return connect(null, mapDispatchToProps)(GetProviderIdentitiesHoC);
};

export default HoC;



// WEBPACK FOOTER //
// ./src/containers/GetProviderIdentitiesHoC/GetProviderIdentitiesHoC.jsx