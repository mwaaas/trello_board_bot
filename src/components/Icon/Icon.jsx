import PropTypes from 'prop-types';
/**
 * @module Icon
 */
import React, { Component } from 'react';
import classnames from 'classnames';
import styled from 'styled-components';

import './Icon.scss';


const IconContainer = styled.span`
  color: ${props => props.color};
`;

export default class Icon extends Component {
  static propTypes = {
    color: PropTypes.string,
    name: PropTypes.string.isRequired,
    hoverName: PropTypes.string,
    className: PropTypes.string,
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
  };

  static defaultProps = {
    size: 'md',
    hoverName: '',
  };

  state = {
    isHover: false,
  };

  getSize = () => {
    const { size } = this.props;

    const sizeChart = {
      sm: 'fa-sm',
      md: '',
      lg: 'fa-lg',
      xl: 'fa-2x',
    };

    return sizeChart[size] || '';
  }

  handleMouseOver = () => {
    const { onMouseOver } = this.props;
    if (onMouseOver) {
      onMouseOver();
    }
    this.setState({ isHover: true });
  }

  handleMouseOut = () => {
    const { onMouseOut } = this.props;
    if (onMouseOut) {
      onMouseOut();
    }
    this.setState({ isHover: false });
  }

  render() {
    const {
      name, type, className, size, hoverName, ...rest
    } = this.props;
    const hover = this.state.isHover && hoverName;
    const iconClasses = classnames(className, `fa fa-${hover ? hoverName : name} ${this.getSize()}`);

    return (
      <IconContainer
        {...rest}
        className={ iconClasses }
        onFocus={ this.handleMouseOver }
        onBlur={ this.handleMouseOut }
        onMouseOver={ this.handleMouseOver }
        onMouseOut={ this.handleMouseOut }
      />
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/Icon/Icon.jsx