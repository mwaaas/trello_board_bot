import React from 'react';
import styled from 'styled-components';

import {
  Href,
  Section,
  Subheading,
  Title,
} from '../../components';
import { routes } from '../../consts';


const Content = styled.div`
  background: white;
  min-height: calc(100vh - 67px);
  padding: 4em 6em;
`;


const NotFound = () => (
  <Content className="container">
    <Title type="h1">
      Doh! This page does not exist!
    </Title>
    <Section>
      <Subheading>
        <Href to={ routes.ABSOLUTE_PATHS.DASHBOARD }>
          Go back to your syncs
        </Href>
      </Subheading>
    </Section>
  </Content>
);

export default NotFound;



// WEBPACK FOOTER //
// ./src/components/NotFound/NotFound.jsx