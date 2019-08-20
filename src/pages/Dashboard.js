import React, { Component } from 'react';
import styled from 'styled-components';
import TrelloPowerUp from 'TrelloPowerUp';
// import {
//   Title
// } from '../components/';
import Title from "../components/Title/Title";

const Dashboard = styled.div`
  background: rgba(0,0,0,.5);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const Content = styled.div`
  background: white;
  padding: 24px;
  width: 80%;
  max-width: 600px;
  max-height: 90%;
`;

export default class OverlayPage extends Component {
  componentDidMount() {

    const t = TrelloPowerUp.iframe();

    // Important! If you are using the overlay, you should implement
    // the following two methods to ensure that closing the overlay
    // is simple and consistent for the Trello user

    // close overlay if user clicks outside our content
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('overlay')) {
        t.closeModal().done();
      }
    });

    // close overlay if user presses escape key
    document.addEventListener('keyup', (e) => {
      if (e.keyCode === 27) {
        t.closeModal().done();
      }
    });

  }

  render() {
    return (
      <div className="dashboard-container">
        <Content>
          <Title type="h2">
            Your syncs
          </Title>
        </Content>
      </div>
    );
  }
}