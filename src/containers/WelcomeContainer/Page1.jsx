import React from 'react';
import styled from 'styled-components';

import { Title, Section } from '../../components';

import { fontSize } from '../../theme';

const Content = styled.div`
  margin-top: 7%;
`;

const Block = styled.div`
  padding: 5%;
  font-size: ${fontSize.small};
`;

const Image = styled.img`
  margin-bottom: 10px;
`;

const imgProps = {
  height: '80px',
  width: '80px',
};

const sections = [
  {
    img: {
      alt: 'Define your workflow icon',
      src: `${process.env.PUBLIC_URL}/images/workflow.svg`,
    },
    title: 'Define your workflow',
    description: `
      We’ve highlighted common use-cases to help you identify your workflow depending on what you want to achieve.`,
  },
  {
    img: {
      alt: 'Select your projects icon',
      src: `${process.env.PUBLIC_URL}/images/projects.svg`,
    },
    title: 'Select your projects',
    description: `
      Creating a quick sync is easy! Connect your favorite tools, choose the projects you want to link and the sync starts automatically!`,
  },
  {
    img: {
      alt: 'Choose your filters icon',
      src: `${process.env.PUBLIC_URL}/images/filters.svg`,
    },
    title: 'Choose your filters',
    description: `
      After choosing what projects to sync, choose how you will filter out tasks or cards before they’re synced over.`,
  },
  {
    img: {
      alt: "Let's sync icon",
      src: `${process.env.PUBLIC_URL}/images/rocket.svg`,
    },
    title: "Let's sync",
    description: `
      You’re all set! Unito will sync all your tasks for you automatically.`,
  },
];

export default () => (
  <Content className="welcome-content">
    <Section>
      <Title type="h2">
        <strong>4 quick steps</strong> to get you started
      </Title>
    </Section>

    <div className="row">
    {
      sections.map(section =>
        <div className="col-md-3" key={ section.title }>
          <Block>
            <Image
              {...imgProps}
              alt={section.img.alt}
              src={section.img.src}
            />
            <Title type="h4">
              {section.title}
            </Title>
            {section.description}
          </Block>
        </div>)
    }
    </div>
  </Content>
);



// WEBPACK FOOTER //
// ./src/containers/WelcomeContainer/Page1.jsx