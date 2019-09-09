import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map } from 'immutable';
import styled from 'styled-components';

import { ProviderIcon, Href, Tooltip } from '../../components';


const Icon = styled.div`
  display: inline-block;
  vertical-align: middle
`;

const NameWrapper = styled.div`
  display: inline-block;
  margin-left: .5rem;
  vertical-align: middle;
`;

const Name = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
`;


export default class ContainerIcon extends Component {
  static propTypes = {
    container: PropTypes.instanceOf(Map).isRequired,
    iconSize: PropTypes.oneOf(['sm', 'md', 'lg']),
    isNewContainer: PropTypes.bool,
    linkStyle: PropTypes.string,
    noUrl: PropTypes.bool,
    provider: PropTypes.instanceOf(Map),
    showName: PropTypes.bool,
    terms: PropTypes.instanceOf(Map),
    tooltipPlacement: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
  };

  static defaultProps = {
    iconSize: 'md',
    isNewContainer: false,
    linkStyle: 'link',
    noUrl: false,
    showName: false,
    terms: Map(),
    tooltipPlacement: 'top',
  };

  hasContainerUrl = () => {
    const { isNewContainer, container, noUrl } = this.props;
    return !isNewContainer && container.get('url') && !noUrl;
  }

  state = {
    isHovering: false,
  };

  handleOnMouseOver = () => {
    this.setState({ isHovering: true });
  }

  handleOnMouseLeave = () => {
    this.setState({ isHovering: false });
  }

  render() {
    const {
      container,
      iconSize,
      isNewContainer,
      linkStyle,
      provider,
      showName,
      terms,
      tooltipPlacement,
    } = this.props;
    const { isHovering } = this.state;

    const containerName = container.get('displayName', '');
    const containerTermSingular = terms.getIn(['container', 'singular']);
    const providerDisplayName = provider && provider.get('displayName');

    const Element = this.hasContainerUrl() ? Href : 'div';
    const elemProps = this.hasContainerUrl() ? { href: container.get('url'), linkStyle } : {};

    const tooltipText = isNewContainer
      ? `A new ${providerDisplayName} ${containerTermSingular}` : containerName;

    return (
      <Element {...elemProps} className="container-icon" style={{ display: 'inline-block' }}>
        <Icon>
          <ProviderIcon
            displayTooltip={ !showName }
            provider={ provider }
            size={ iconSize }
            tooltipPlacement={ tooltipPlacement }
            tooltipText={ tooltipText }
          />
        </Icon>
        {
          showName && (
            <NameWrapper>
              <Name
                ref="name"
                onMouseOver={ this.handleOnMouseOver }
                onMouseLeave={ this.handleOnMouseLeave }
              >
                { containerName }
              </Name>
            </NameWrapper>
          )
        }
        <Tooltip
          show={ isHovering }
          target={ this.refs.name }
          placement={ tooltipPlacement }
        >
          { containerName }
        </Tooltip>
      </Element>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/ContainerIcon/ContainerIcon.jsx