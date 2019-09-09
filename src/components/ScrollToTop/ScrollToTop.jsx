
import { Component } from 'react';
import { withRouter } from 'react-router-dom';

class ScrollToTop extends Component {
  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    return this.props.children || null;
  }
}

export default withRouter(ScrollToTop);



// WEBPACK FOOTER //
// ./src/components/ScrollToTop/ScrollToTop.jsx