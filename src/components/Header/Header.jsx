import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';

import { Href, UnitoLogo } from '../../components';
import { TrialBadge } from '../../containers';
import { routes } from '../../consts';
import { color, fontWeight } from '../../theme';

const Navbar = styled.nav`
  background-color: ${color.brand.dark};
  margin: 0;
  padding-left: 15px;
  padding-right: 15px;

  .nav > li > a,
  .nav > li > button {
    font-weight: ${fontWeight.light};
  }
`;

const HomeButton = styled.div`
  padding: 15px 0;
  float: left;
`;

const LeftMargin = styled.span`
  margin-left: 1em;
`;

export default class Header extends Component {
  static propTypes = {
    children: PropTypes.node,
    logoRedirectUrl: PropTypes.string,
  }

  static defaultProps = {
    logoRedirectUrl: routes.ABSOLUTE_PATHS.SYNCS,
  }

  render() {
    const { children, logoRedirectUrl } = this.props;

    return (
      <Navbar className="navbar navbar-static-top navbar-inverse">
        <HomeButton>
          <Href to={logoRedirectUrl}>
            <UnitoLogo color="transparent" width="125px" />
          </Href>
          <LeftMargin>
            <TrialBadge />
          </LeftMargin>
        </HomeButton>
        {children && <ul className="nav navbar-nav navbar-right">{children}</ul>}
      </Navbar>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/Header/Header.jsx