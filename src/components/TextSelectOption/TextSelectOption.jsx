import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';

import { Avatar } from '../../components';

const Option = styled.div`
  .option__disabled-text {
    margin-left: 0.5rem;
    text-transform: capitalize;
  }
`;

const Color = styled.div`
  background-color: ${props => props.color};
  border-radius: 100%;
  display: inline-block;
  height: 10px;
  width: 10px;
  margin-left: 0.25rem;
`;

export default class TextSelectOption extends Component {
  static propTypes = {
    color: PropTypes.string,
    disabled: PropTypes.bool,
    disabledText: PropTypes.string,
    iconUrl: PropTypes.string,
    maxTextLength: PropTypes.number.isRequired,
    children: PropTypes.node.isRequired,
  };

  static defaultProps = {
    disabled: false,
    disabledText: 'Mapped',
  };

  render() {
    const {
      color,
      disabled,
      disabledText,
      iconUrl,
      children: text,
    } = this.props;

    return (
      <Option className="option">
        { text }
        { iconUrl && <Avatar size={ 12 } src={ iconUrl } /> }
        { !iconUrl && color && <Color color={ color } /> }
        {
          disabled && (
            <span className="option__disabled-text pull-right text-muted">
              { disabledText }
            </span>
          )
        }
      </Option>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/TextSelectOption/TextSelectOption.jsx