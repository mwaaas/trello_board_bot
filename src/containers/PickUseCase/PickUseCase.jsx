import React, { Component } from 'react';
import styled from 'styled-components';
import { routes } from '../../consts';
import classnames from 'classnames';

import {
  Button,
  StickyButtonToolbar,
  Card,
  Label,
  Title,
  RadioButtonGroup,
  RadioButton,
  Section,
} from '../../components';
import { OpenIntercomBubble } from '../../containers';
import { color, fontSize, fontWeight } from '../../theme';


const Content = styled.div`
  background: white;
  min-height: calc(100vh - 66px);
  padding: 4em 6em;

  .radio-button {
    border-bottom: 1px solid ${color.dark.whisper};
    padding: 1rem;
  }

  .radio-button:hover {
    background: ${color.dark.quiet};
  }
`;

const NegativeMarginRight = styled.div`
  margin-right: -30px;
`;

const Image = styled.img`
  margin-right: 1rem;
  width: 78px;
`;

const ComingSoon = styled.div`
  color: ${color.dark.secondary};
  font-size: ${fontSize.small};
  font-weight: ${fontWeight.medium};
  font-style: italic;
`;

const Example = styled.div`
  margin-top: ${props => (props.index === 0 ? 0 : '2rem')};

  &:last-child {
    margin-bottom: 0;
  }
`;

const Description = styled.div`
  color: ${color.dark.secondary};
`;

const Hr = styled.hr`
  margin-left: -2em;
  margin-right: -2em;
`;

const Note = ComingSoon.extend`
  margin-top: 1rem;
`;

const HelpBlock = styled.div`
  margin-bottom: 13rem;
`;

const baseFolderPath = `${process.env.PUBLIC_URL}/images/use-cases`;
const useCases = {
  sync: {
    redirectPath: routes.ABSOLUTE_PATHS.ADD_LINK,
    imgSrc: 'mirror-sync.svg',
    label: 'Mirror-sync',
    inBeta: false,
    title: 'How can a mirror-sync help you?',
    description: 'Mirror some or all tasks between two projects for seamless collaboration across teams, projects and tools',
    examplesTitle: 'Most popular mirror-syncs',
    examples: [
      {
        imgSrcs: {
          default: 'mirror-sync_asana_github.svg',
          trello: 'mirror-sync_asana_github.svg',
          wrike: 'mirror-sync_wrike-jira.svg',
        },
        description: 'Pair two teams (marketing, design, engineering, etc) on the same project',
      },
      {
        imgSrcs: {
          default: 'mirror-sync_trello_jira.svg',
          trello: 'mirror-sync_trello_jira.svg',
          wrike: 'mirror-sync_wrike-wrike.svg',
        },
        description: 'Invite a contractor or client to collaborate on a project',
      },
      {
        imgSrcs: {
          default: 'mirror-sync_trello_trello.svg',
          trello: 'mirror-sync_trello_trello.svg',
        },
        description: 'Bridge two processes in a seamless workflow',
      },
    ],
  },
  multisync: {
    redirectPath: routes.ABSOLUTE_PATHS.ADD_MULTISYNC,
    imgSrc: 'multi-sync.svg',
    label: 'Multi-sync',
    inBeta: true,
    title: 'How can a multi-sync help you?',
    description: 'Combine tasks from multiple projects into a single view, or dispatch work from a central plan to other teams, projects and tools',
    examplesTitle: 'Most popular multi-syncs',
    examples: [
      {
        imgSrcs: {
          default: 'multi-sync_trello_trello.svg',
          trello: 'multi-sync_trello_trello.svg',
        },
        description: 'Curate a central backlog and distribute to the right product, project or team',
      },
      {
        imgSrcs: {
          default: 'multi-sync_wrike-jira.svg',
          trello: 'multi-sync_wrike-jira.svg',
          wrike: 'multi-sync_wrike-jira.svg',
        },
        description: 'Build a master plan or campaign, dispatch work and track progress',
      },
      {
        imgSrcs: {
          default: 'multi-sync_asana_trello.svg',
          trello: 'multi-sync_asana_trello.svg',
          wrike: 'multi-sync_github-wrike.svg',
        },
        description: 'Expose a live dashboard of key activities that spans teams, projects and tools',
      },
    ],
  },
};


class PickUseCase extends Component {
  state = {
    selectedUseCase: 'sync',
    hoveredUseCase: null,
  }

  handleChangeUseCase = (usecase) => {
    this.setState({ selectedUseCase: usecase });
  }

  getLabel = (useCase) => {
    const { label, imgSrc, inBeta } = useCases[useCase];
    return (
      <div className="media">
        <div className="media-left">
          <Image
            alt={ label }
            className="media-object"
            height="80px"
            src={ `${baseFolderPath}/${imgSrc}` }
            width="80px"
          />
        </div>
        <div className="media-body media-middle">
          <Title type="h3">
            {
              inBeta && (
                <div>
                  <Label block labelType="purple">BETA</Label>
                </div>
              )
            }
            { label }
          </Title>
        </div>
      </div>
    );
  }

  render() {
    const { embedName } = this.props;
    const { hoveredUseCase, selectedUseCase } = this.state;
    const usecase = useCases[selectedUseCase];
    const useCaseToDisplay = hoveredUseCase || selectedUseCase;

    return (
      <Content className="pick-usecase-container container">
        <Title type="subtitle1">
          Let's get started
        </Title>
        <Title type="h1">
          What do you want to create?
        </Title>
        <div className="row">
          <div className="col-md-6">
            <NegativeMarginRight>
              <RadioButtonGroup
                value={ selectedUseCase }
                onChange={ this.handleChangeUseCase }
                name="pickUseCase"
              >
                {
                  Object.keys(useCases).map(useCase => (
                    <RadioButton
                      key={ useCase }
                      value={ useCase }
                      label={ this.getLabel(useCase) }
                      onMouseOver={ () => this.setState({ hoveredUseCase: useCase }) }
                      onMouseOut={ () => this.setState({ hoveredUseCase: null }) }
                    />
                  ))
                }
              </RadioButtonGroup>
            </NegativeMarginRight>
            <HelpBlock className="help-block">
              Not sure what to choose? No problem! <OpenIntercomBubble>Get in touch with our team</OpenIntercomBubble>.
            </HelpBlock>
          </div>
          <div className="col-md-6">
            {
              useCaseToDisplay && (
                <Card boxShadow>
                  <Section>
                    <Title type="h3">
                      { useCases[useCaseToDisplay].title }
                    </Title>
                    <Description>
                      { useCases[useCaseToDisplay].description }
                    </Description>
                  </Section>
                  <Hr />
                  <Section>
                    <Title type="h3">
                      { useCases[useCaseToDisplay].examplesTitle }
                    </Title>
                    {
                      useCases[useCaseToDisplay].examples.map((example, index) => {
                        if (embedName && !example.imgSrcs[embedName]) {
                          return null;
                        }

                        return (
                          <Example className="media" key={ example.imgSrcs[embedName] || example.imgSrcs.default } index={ index }>
                            <div className="media-left media-middle">
                              { example.comingSoon && <ComingSoon>Coming soon</ComingSoon> }
                              <Image
                                alt={ example.description }
                                className="media-object"
                                src={ `${baseFolderPath}/${example.imgSrcs[embedName] || example.imgSrcs.default}` }
                              />
                            </div>
                            <Description className={ classnames('media-body', { 'media-bottom': example.comingSoon }) }>
                              { example.description }
                            </Description>
                          </Example>
                        );
                      })
                    }
                    <Note>
                      { useCases[useCaseToDisplay].note }
                    </Note>
                  </Section>
                </Card>
              )
            }
          </div>
        </div>
        <StickyButtonToolbar>
          <Button type="href" btnStyle="dark" reverse to="/dashboard">
            Cancel
          </Button>
          <Button type="href" pullRight btnStyle="dark" to={ usecase.redirectPath }>
            Next step
          </Button>
        </StickyButtonToolbar>
      </Content>
    );
  }
}

export default PickUseCase;



// WEBPACK FOOTER //
// ./src/containers/PickUseCase/PickUseCase.jsx