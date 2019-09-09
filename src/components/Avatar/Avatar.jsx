import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import styled from 'styled-components';

import { Icon } from '../../components';
import { color } from '../../theme';
import './Avatar.scss';

const StyledAvatar = styled.span`
  border: 1px solid ${props => color[props.colorScheme].whisper};
  background: ${props => color[props.colorScheme].whisper};
  color: ${props => color[props.colorScheme].primary};
`;


export default class Avatar extends Component {
  static propTypes = {
    src: PropTypes.string,
    className: PropTypes.string,
    size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    alt: PropTypes.string,
    colorScheme: PropTypes.oneOf(['dark', 'light']),
  };

  static defaultProps = {
    size: 26,
    alt: '',
    colorScheme: 'dark',
  };

  constructor(props) {
    super(props);
    this.state = {
      src: props.src,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      src: nextProps.src,
    });
  }

  onImageErrorLoad = () => {
    this.setState({
      src: null,
    });
  }

  render() {
    const {
      alt,
      className,
      colorScheme,
      light,
      size,
    } = this.props;
    const { src } = this.state;

    const style = src ? {} : {
      width: size,
      height: size,
      lineHeight: `${size}px`,
    };

    return (
      <StyledAvatar
        className={ classnames('avatar', className, { 'avatar--no-url': !src }) }
        style={ style }
        colorScheme={ colorScheme }
      >
        {
          src ? (
            <img
              src={ src }
              width={ size }
              height={ size }
              alt={ alt }
              onError={ this.onImageErrorLoad }
            />
          ) : (
            <Icon
              style={{ fontSize: (size / 2) }}
              name="user"
              color={ light ? color.light.primary : undefined }
            />
          )
        }
      </StyledAvatar>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/Avatar/Avatar.jsx