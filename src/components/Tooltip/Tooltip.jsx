import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import classnames from 'classnames';
import styled from 'styled-components';
import Overlay from 'react-overlays/Overlay';


import './Tooltip.scss';


const TextWithBackslashN = styled.div`
  white-space: pre-wrap;
`;


const OverlayToolTip = ({
  className, children, style, onMouseOut, onMouseOver,
}) => (
  <div
    className={ className }
    style={ style }
    onMouseOut={ onMouseOut }
    onMouseOver={ onMouseOver }
  >
    <div className="tooltip__arrow tooltip-arrow" />
    <div className="tooltip__inner tooltip-inner">
      { children }
    </div>
  </div>
);


export default class Tooltip extends Component {
  static propTypes = {
    placement: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
    show: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired,
    onHide: PropTypes.func,
    onMouseOut: PropTypes.func,
    onMouseOver: PropTypes.func,
    target: PropTypes.any,
  };

  static defaultProps = {
    placement: 'top',
  };

  render() {
    const {
      onHide, onMouseOut, onMouseOver, placement, show, target, children,
    } = this.props;
    const classNames = classnames('tooltip', `tooltip--${placement}`, placement, {
      'tooltip--visible': show,
    });

    return (
      <Overlay
        container={ this }
        onHide={ onHide }
        placement={ placement }
        show={ show }
        target={ () => findDOMNode(target) }
      >
        <OverlayToolTip
          className={ classNames }
          onMouseOut={ onMouseOut }
          onMouseOver={ onMouseOver }
        >
          <TextWithBackslashN>
            { children }
          </TextWithBackslashN>
        </OverlayToolTip>
      </Overlay>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/Tooltip/Tooltip.jsx