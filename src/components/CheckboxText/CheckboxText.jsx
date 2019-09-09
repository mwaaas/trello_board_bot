import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';

import { Checkbox } from '../../components';


const Content = styled.div`
  cursor: pointer;
  display: table;
  overflow: visible;
  position: relative;
`;

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

const CheckboxWrapper = styled.div`
  float: left;
  position: relative;
  display: block;
  flex-shrink: 0;
  width: 24px;
  margin-right: 8px;
  margin-left: 0px;
  height: 24px;
`;


export default class CheckboxText extends Component {
  static propTypes = {
    checked: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired,
    color: PropTypes.string,
    contrastColor: PropTypes.string,
    id: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  onChange = (e) => {
    if (e.target.nodeName !== 'A') {
      const { onChange, checked } = this.props;
      onChange(!checked);
    }
  }

  render() {
    const {
      checked,
      color,
      contrastColor,
      children,
      id,
    } = this.props;

    return (
      <Content onClick={ this.onChange } className="checkbox-text">
        <Wrapper>
          <CheckboxWrapper id={ id }>
            <Checkbox ref="checkbox" checked={ checked } color={ color } contrastColor={ contrastColor }/>
          </CheckboxWrapper>
          <label htmlFor={ id }>{ children }</label>
        </Wrapper>
      </Content>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/CheckboxText/CheckboxText.jsx