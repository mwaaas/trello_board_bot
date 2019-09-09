import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import styled from 'styled-components';
import classnames from 'classnames';
import Color from 'color';

import { color } from '../../theme';


const Anchor = styled.a`
  color: ${props => props['data-color']};

  &:active,
  &:focus,
  &:hover {
    color: ${props => Color(props['data-color']).darken(0.18).string()};
  }
`;

const Link = Anchor.withComponent(ReactRouterLink);


export default class Href extends Component {
  static propTypes = {
    href: PropTypes.string,
    linkStyle: PropTypes.oneOf([...Object.keys(color.brand), 'subtleLink']),
    target: PropTypes.string,
    to: PropTypes.string,
  };

  static defaultProps = {
    linkStyle: 'link',
    target: '_blank',
  }

  render() {
    const {
      href, target, to, linkStyle, ...rest
    } = this.props;
    const commonProps = {
      className: classnames('href', rest.className),
      'data-color': color.brand[linkStyle],
      ...rest,
    };

    const anchorProps = {
      rel: 'noopener noreferrer',
      target,
    };

    if (to) {
      return <Link {...commonProps} to={ to } />;
    }

    return (
      <Anchor
        {...anchorProps}
        {...commonProps}
        href={ href }
      />
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/Href/Href.jsx