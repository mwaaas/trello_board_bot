import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Icon, Tooltip } from '../../components';
import styled from 'styled-components';


const IconContainer = styled.div`
  font-size: 85%;
  display: inline-block;
  opacity: .8;
  &:hover {
    opacity: 1;
  }
`;

export default class IconHoverTooltip extends Component {
  static propTypes = {
    placement: PropTypes.oneOf(['top', 'right', 'bottom', 'left']).isRequired,
    children: PropTypes.node.isRequired,
    color: PropTypes.string,
    iconColor: PropTypes.string,
    iconName: PropTypes.string,
    iconClassName: PropTypes.string,
    iconSize: PropTypes.oneOf(['sm', 'md', 'lg']),
    mouseEnterDelay: PropTypes.number,
    mouseLeaveDelay: PropTypes.number,
  };

  static defaultProps = {
    iconName: 'question-circle',
    placement: 'right',
    mouseEnterDelay: 500,
    mouseLeaveDelay: 100,
  };

  state = {
    show: false,
  };

  componentWillUnmount() {
    if (this.delayTimer) {
      window.clearTimeout(this.delayTimer);
    }
  }

  handleIconMouseOver = () => {
    const { mouseEnterDelay } = this.props;
    this.delaySetTooltipVisible(true, mouseEnterDelay);
  }

  handleIconMouseOut = () => {
    const { mouseLeaveDelay } = this.props;
    this.delaySetTooltipVisible(false, mouseLeaveDelay);
  }

  handleTooltipMouseOver = () => {
    this.clearDelayTimer();
  }

  handleTooltipMouseOut = () => {
    const { mouseLeaveDelay } = this.props;
    this.delaySetTooltipVisible(false, mouseLeaveDelay);
  }

  clearDelayTimer() {
    if (this.delayTimer) {
      window.clearTimeout(this.delayTimer);
      this.delayTimer = null;
    }
  }

  delaySetTooltipVisible(visible, delay) {
    this.clearDelayTimer();
    if (delay) {
      this.delayTimer = window.setTimeout(() => {
        this.setTooltipVisible(visible);
        this.clearDelayTimer();
      }, delay);
    } else {
      this.setTooltipVisible(visible);
    }
  }

  setTooltipVisible = (visibility) => {
    this.setState({
      show: visibility,
    });
  }

  render() {
    const {
      iconColor, iconName, iconSize, iconClassName, placement, children, type, onClick,
    } = this.props;
    const { show } = this.state;
    const onClickProps = {
      onClick,
      onKeyPress: onClick,
      role: onClick ? 'button' : undefined,
      tabIndex: onClick ? 0 : undefined,
    };

    return (
      <IconContainer className="icon-hover-tooltip" {...onClickProps}>
        <Icon
          className={ iconClassName }
          color={ iconColor }
          name={ iconName }
          ref="icon"
          onMouseOver={ this.handleIconMouseOver }
          onMouseOut={ this.handleIconMouseOut }
          type={ type }
          size={ iconSize }
        />
        <Tooltip
          target={ this.refs.icon }
          placement={ placement }
          show={ show }
          onMouseOver={ this.handleTooltipMouseOver }
          onMouseOut={ this.handleTooltipMouseOut }
        >
          { children }
        </Tooltip>
      </IconContainer>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/IconHoverTooltip/IconHoverTooltip.jsx