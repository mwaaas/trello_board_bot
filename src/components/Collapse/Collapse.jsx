import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';


export default class Collapse extends Component {
  static propTypes = {
    isCollapsed: PropTypes.bool,
    children: PropTypes.node.isRequired,
  };

  static defaultProps = {
    isCollapsed: false,
  };

  render() {
    const { isCollapsed, children, ...rest } = this.props;

    return (
      <div className={ classnames('collapse', 'clearfix', { in: !isCollapsed }, rest.className) }>
        { children }
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/Collapse/Collapse.jsx