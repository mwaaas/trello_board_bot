import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';

import { Button, Title } from '../../components';
import { routes } from '../../consts';
import { color, fontWeight } from '../../theme';


const Message = styled.div`
  color: ${color.text.secondary};
  margin-top: 4em;
  text-align: center;

  h6 {
    font-weight: ${fontWeight.light};
  };
`;


export default class OrgNeedsPayment extends Component {
  static propTypes = {
    isEmbed: PropTypes.bool.isRequired,
  };

  render() {
    const { isEmbed } = this.props;

    const target = isEmbed ? '_blank' : '_self';

    return (
      <Message className="sync-container__message">
        <Title>It looks like your Unito account is suspended</Title>
        <Title type="h3">To add or edit syncs, select a plan and enter your payment information.</Title>
        <Button
          btnStyle="secondary"
          size="sm"
          target={ target }
          to={ routes.ABSOLUTE_PATHS.ORGANIZATIONS }
          type="href"
        >
          Take me to the Billing Page
        </Button>
      </Message>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/OrgNeedsPayment/OrgNeedsPayment.jsx