import React, { Component } from 'react';
import styled from 'styled-components';
import TrelloPowerUp from 'TrelloPowerUp';

const BoardBar = styled.div`
  background: #0C3953;
  color: white;
  padding: 18px;
`;

export default class BoardBarPage extends Component {

  componentDidMount() {
    const t = TrelloPowerUp.iframe();

    // want to know when you are being closed?
    window.addEventListener('unload', (e) => {
      // Our board bar is being closed, clean up if we need to
    });

    t.render(() => {
      // this function we be called once on initial load
      // and then called each time something changes that
      // you might want to react to, such as new data being
      // stored with t.set()
    });
  }

  render() {
    return (
      <BoardBar>
        <h2>Tips for using t.boardBar()</h2>
        <hr />
        <ol>
          <li>You should only call t.boardBar() as a response to a user action, such as clicking a button.</li>
          <li>In addition to setting the height when calling t.boardBar() it can be helpful to resize the height from within the boardBar using t.sizeTo(). Remember the boardBar is restricted to 50% of the board height as a maximum.</li>
          <li>Try to get your boardBar to load and render as quickly as possible.</li>
        </ol>
      </BoardBar>
    );
  }
}