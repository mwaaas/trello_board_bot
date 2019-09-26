import React from 'react';
import styled from 'styled-components';

import { Title, Section } from '../../components';
import { color, fontSize, fontWeight } from '../../theme';


const Content = styled.div`
  margin-top: 7%;
`;

const Block = styled.div`
  padding: 5%;
`;

const Details = styled.ul`
  font-size: 12px;
  list-style: none;
  padding-left: 0;

  li {
    border-bottom: 1px solid ${color.dark.whisper};
    padding: 7px 4px;
    margin-left: 1.3em;

    &:last-child {
      border-bottom: none;
    }

    &:before {
      content: "\f00c";
      font-family: FontAwesome;
      color: ${color.brand.primary};
      display: inline-block;
      margin-left: -1.3em;
      width: 1.3em;
    }
  }
`;

const Item = styled.div`
  font-size: ${fontSize.small};
  font-weight: ${fontWeight.regular};
  margin-bottom: 40px;
  position: relative;
`;


const imgProps = { height: 'auto', width: '75px' };

const sections = [
  {
    img: {
      alt: 'split',
      src: `${process.env.PUBLIC_URL}/images/split.svg`,
    },
    title: 'Split your tasks',
    subheading: 'Split a project into multiple smaller ones',
    details: [
      'Copy selected tasks from a backlog to a contractor or external team',
      'Dispatch tasks from a large backlog into team members’ tools of choice',
    ],
  },
  {
    img: {
      alt: 'mirror',
      src: `${process.env.PUBLIC_URL}/images/mirror.svg`,
    },
    title: 'Mirror your projects',
    subheading: 'Sync everything from one project to another one',
    details: [
      'Connect different teams to keep them working in preferred tools',
      'Take advantage of powerful tools for PM use while letting other teams use simpler work management tools',
      'Connect dev team to business teams via an automated 2-way sync',
    ],
  },
  {
    img: {
      alt: 'merge',
      src: `${process.env.PUBLIC_URL}/images/merge.svg`,
    },
    title: 'Merge your boards',
    subheading: 'Sync the contents of many projects into one big project',
    details: [
      'Connect many sources into a reporting view of work across her teams.',
      'Collect resources and requests from many different tools into one place for planning',
      'Combine mlitiple teams’ projects in a single place for kickoffs & planning',
    ],
  },
];

export default () => (
  <Content className="welcome-content">
    <Section>
      <Title type="h2">
        Choose how you want to build your sync
      </Title>
    </Section>

    <div className="row">

      {
        sections.map(section =>
          <div className="col-md-4" key={ section.title }>
            <Block>
              <Item className="media">
                <div className="media-left media-middle">
                  <img
                    {...imgProps}
                    alt={section.img.alt}
                    src={section.img.src}
                  />
                </div>
                <div className="media-body">
                  <Title type="h3">
                    {section.title}
                  </Title>
                  {section.subheading}
              </div>
              </Item>
              <Details>
                {
                  section.details.map((detail, index) =>
                    <li key={ index.toString() }>{ detail }</li>)
                }
              </Details>
            </Block>
          </div>)
      }

    </div>
  </Content>
);



// WEBPACK FOOTER //
// ./src/containers/WelcomeContainer/Page2.jsx