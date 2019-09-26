import React from 'react';
import styled from 'styled-components';

import { Button, Subheading, Title } from '../../components';
import { routes, trackingTypes } from '../../consts';


const Content = styled.div`
  padding-top: 10%;
  margin: 5%;
`;

const Block = styled.div`
  padding-right: 131px;
`;

export default ({ userFullName, trackEvent }) => (
  <Content className="media">
    <div className="media-body">
      <Title type="h2">
        Well done, {userFullName}!
      </Title>
      <Block>
        <Subheading>
          You’re ready to create your first sync.
          Don’t hesitate to ping us via the{' '}
          <span>
            <img
              alt=""
              src={`${process.env.PUBLIC_URL}/images/intercom-icon.png`}
              width="30px"
              height="auto"
            />
          </span> icon if you have any questions.
        </Subheading>
      </Block>
      <Button
        type="href"
        to={ routes.ABSOLUTE_PATHS.ADD_LINK }
        btnStyle="primary"
        onClick={ () => trackEvent(trackingTypes.WELCOME_ACTIONS.END, 3) }

      >
        Let's get started!
      </Button>
    </div>
    <div className="media-right media-middle">
      <img
        alt=""
        src={`${process.env.PUBLIC_URL}/images/ok-hand.svg`}
        width="400px"
        height="auto"
        className="media-object"
      />
    </div>
  </Content>
);



// WEBPACK FOOTER //
// ./src/containers/WelcomeContainer/Page3.jsx