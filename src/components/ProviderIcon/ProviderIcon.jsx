import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import { Tooltip } from '../../components';


const Icon = styled.img`
  display: ${props => props.display};
  height: ${props => props.size};
  width: ${props => props.size};
`;


export default class ProviderIcon extends Component {
  static propTypes = {
    display: PropTypes.oneOf(['block', 'inline']),
    provider: PropTypes.instanceOf(Map).isRequired,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    spacing: PropTypes.number,
    tooltipPlacement: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
    tooltipText: PropTypes.string,
  };

  static defaultProps = {
    buttonIcon: false,
    display: 'block',
    displayTooltip: false,
    size: 'md',
    spacing: 0,
    tooltipPlacement: 'right',
  }

  state = {
    show: false,
  }

  handleMouseOver = () => {
    this.setState({ show: true });
  }

  handleMouseOut = () => {
    this.setState({ show: false });
  }

  getSize = () => {
    const { size } = this.props;

    const sizeChart = {
      sm: '20px',
      md: '32px',
      lg: '40px',
    };

    return sizeChart[size] || '32px';
  }

  render() {
    const {
      displayTooltip,
      provider,
      tooltipPlacement,
      tooltipText,
    } = this.props;
    const { show } = this.state;
    const icon = provider.get('logo');
    const name = provider.get('name');

    const src = `${process.env.PUBLIC_URL}/images/${icon}`;
    const alt = `${name} logo`;

    return (
      <div>
        <Icon
          alt={ alt }
          className="provider-icon"
          onMouseOut={ this.handleMouseOut }
          onMouseOver={ this.handleMouseOver }
          ref="icon"
          size={ this.getSize() }
          src={ src }
        />
        {
          displayTooltip
          && <Tooltip
            placement={ tooltipPlacement }
            show={ show }
            target={ this.refs.icon }
          >
            { tooltipText }
          </Tooltip>
        }
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/ProviderIcon/ProviderIcon.jsx