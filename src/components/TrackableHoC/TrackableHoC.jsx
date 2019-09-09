import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router';


const trackable = (DecoratedComponent, virtualLocation) => class Trackable extends Component {
    static propTypes = {
      location: PropTypes.object.isRequired,
    };

    componentWillMount() {
      let virtualPathname = virtualLocation;
      // Allow function as location, so we can build dynamic pathnames
      // based on props
      if (typeof virtualPathname === 'function') {
        virtualPathname = virtualPathname(this.props);
      }

      const { location } = this.props;
      window.analytics.page({
        path: `${location.pathname}/${virtualPathname}`,
      });
    }

    render() {
      return <DecoratedComponent {...this.props} />;
    }
};

export default virtualLocation => target => withRouter(trackable(target, virtualLocation));



// WEBPACK FOOTER //
// ./src/components/TrackableHoC/TrackableHoC.jsx