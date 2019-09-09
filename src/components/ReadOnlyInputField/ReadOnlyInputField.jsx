import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';


const InputField = styled.div`
  border: 1px solid rgba(0,0,0,0.12);
  background-color: rgb(250, 250, 250);
  border-radius: 2px;
  padding: 5px 10px;
`;


export default class ReadOnlyInputField extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    label: PropTypes.string,
  }

  render() {
    const { children, label } = this.props;

    return (
      <div className="form-group">
        { label && <span className="form-label">{ label }</span> }
        <InputField>{ children }</InputField>
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/ReadOnlyInputField/ReadOnlyInputField.jsx