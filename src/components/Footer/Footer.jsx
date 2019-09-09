import React, { Component } from 'react';
import styled from 'styled-components';

import { Href } from '../../components';
import { fontSize, lineHeight } from '../../theme';


const Content = styled.footer`
  margin-top: 5rem;

  p {
    font-size: ${fontSize.small};
    line-height: ${lineHeight.small};
  }
`;

export default class Footer extends Component {
  render() {
    return (
      <Content className="footer">
        { this.props.children }
        <p style={{ marginTop: '1rem' }}>
          <Href href="https://guide.unito.io">Unito Guide</Href> |{' '}
          <Href href="mailto:support@unito.io">Get Help</Href>
        </p>
      </Content>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/Footer/Footer.jsx