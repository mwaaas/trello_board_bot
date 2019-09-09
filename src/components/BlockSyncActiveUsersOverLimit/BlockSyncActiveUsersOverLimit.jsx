import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';

import { Button, Section, Title } from '../../components';
import { routes } from '../../consts';

const Content = styled.div`
  background: white;
  min-height: calc(100vh - 66px);
  padding: 4em 6em;

  .nav {
    margin-bottom: 4rem;
  }
`;


export default class BlockSyncActiveUsersOverLimit extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    isEmbed: PropTypes.bool.isRequired,
    trackLoadEvent: PropTypes.func.isRequired,
    trackUpgradeEvent: PropTypes.func.isRequired,
    trackCancelEvent: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { trackLoadEvent } = this.props;
    trackLoadEvent();
  }

  render() {
    const {
      children,
      isEmbed,
      trackCancelEvent,
      trackUpgradeEvent,
    } = this.props;

    const target = isEmbed ? '_blank' : '_self';

    return (
      <Content className="container text-center">
        <Section>
          <Title>
            Oops! You’ve hit your plan limit of active users
          </Title>
          <Title type="h3">
            { children }
          </Title>
        </Section>

        <Section>
          <img width="700" alt="" src={ `${process.env.PUBLIC_URL}/images/unito_limits.png` } />
        </Section>

        <Button
          btnStyle="subtleLink"
          target={ target }
          size="lg"
          to={ routes.ABSOLUTE_PATHS.DASHBOARD }
          type="href"
          onClick={ trackCancelEvent }
        >
          Go back to your syncs
        </Button>
        <Button
          target={ target }
          size="lg"
          to={ routes.ABSOLUTE_PATHS.ORGANIZATIONS }
          type="href"
          onClick={ trackUpgradeEvent }
        >
          Upgrade now!
        </Button>
      </Content>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/BlockSyncActiveUsersOverLimit/BlockSyncActiveUsersOverLimit.jsx