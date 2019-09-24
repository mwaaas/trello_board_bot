import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { Card, NotFound } from '../../components';


const Content = styled.div`
  padding: 40px;
  background-color: red;
`;

const Row = styled.div`
  margin-bottom: 16px;
  padding-bottom: 16px;
`;


class Canvas extends Component {
  render() {
    if (process.env.NODE_ENV !== 'development') {
      return <NotFound />;
    }

    // todo mwas fix this
    // /* eslint-disable jsx-a11y/href-no-hash */
    return (
      <Content>

        <Row>
          <Card>Hello</Card>
        </Row>

      </Content>
    );
    // todo mwas fix this
    // /* eslint-enable jsx-a11y/href-no-hash */
  }
}

export default connect()(Canvas);



// WEBPACK FOOTER //
// ./src/containers/Canvas/Canvas.jsx