import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';
import classnames from 'classnames';

import { Icon } from '../../components';
import { color } from '../../theme';


const Padding = styled.div`
  padding: 20px;
`;

const Message = styled.div`
  color: ${color.dark.secondary};
  margin-top: 16px;
`;


export default class InlineLoading extends Component {
  static propTypes = {
    children: PropTypes.node,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
  };

  static defaultProps = {
    size: 'large',
  }

  getIconClass = () => {
    const { size } = this.props;

    const classes = {
      small: 'fa-lg',
      medium: 'fa-2x',
      large: 'fa-3x',
    };

    return classnames('fa-spin', classes[size]);
  }

  render() {
    const { children } = this.props;


    return (
      <Padding className="text-center">
        <Icon
          className={ this.getIconClass() }
          color={ color.dark.secondary }
          name="spinner"
        />
        { children && <Message>{ children }</Message> }
      </Padding>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/InlineLoading/InlineLoading.jsx