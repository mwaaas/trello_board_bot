import React from 'react';
import styled from 'styled-components';

import { Title, Subheading, Icon } from '../../components';

import { color } from '../../theme';

const Content = styled.div`
  margin: 10%;
  margin-left: 5%;
`;


export default () => (
  <Content className="media">
    <div className="media-body media-middle">
      <Title type="h2">
        <strong>Welcome on board!</strong>
      </Title>
      <Subheading>
        Learn about Unito's amazing possibilities by exploring our quick guide{' '}
        <Icon
          size="lg"
          className="fa-smile-o"
          name="smile"
          color={color.dark.primary}
        />
        .
    </Subheading>
    </div>
    <div className="media-right">
      <img
        alt=""
        className="media-object"
        src={ `${process.env.PUBLIC_URL}/images/dolls-04.svg` }
        width="450px"
        height="auto"
      />
    </div>
  </Content>
);



// WEBPACK FOOTER //
// ./src/containers/WelcomeContainer/Page0.jsx