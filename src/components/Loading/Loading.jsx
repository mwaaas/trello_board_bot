import React, { Component } from 'react';
import styled from 'styled-components';

import { Icon, UnitoLogo } from '../../components';
import { color } from '../../theme';

const FullPage = styled.div`
  background: ${color.brand.dark};
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
`;

const Content = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  margin-left: -100px;
  margin-top: -80px;
  color: ${color.light.primary};
  text-align: center;
`;

const LogoWrapper = styled.div`
  margin-bottom: 20px;
`;

export default class Loading extends Component {
  render() {
    return (
      <FullPage>
        <Content>
          <LogoWrapper>
            <UnitoLogo color="transparent" />
          </LogoWrapper>
          <Icon name="spinner" className="fa-spin fa-4x" />
        </Content>
      </FullPage>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/Loading/Loading.jsx