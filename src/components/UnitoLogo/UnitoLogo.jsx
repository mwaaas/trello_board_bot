import PropTypes from 'prop-types';
import React, { Component } from 'react';


export default class UnitoLogo extends Component {
  static propTypes = {
    alignment: PropTypes.oneOf(['vertical', 'horizontal']),
    color: PropTypes.oneOf(['transparent', 'color', 'green']),
    height: PropTypes.string,
    width: PropTypes.string,
  }

  static defaultProps = {
    alignment: 'horizontal',
    color: 'color',
    height: 'auto',
    width: 'auto',
  }

  getExtension = () => {
    const { color } = this.props;
    switch (color) {
      case 'green':
      case 'color': {
        return 'svg';
      }

      default: {
        return 'png';
      }
    }
  }

  render() {
    const {
      alignment, color, height, width,
    } = this.props;
    const extension = this.getExtension();

    const src = `${process.env.PUBLIC_URL}/images/logo-${color}-${alignment}.${extension}`;
    return (
      <img
        alt="Unito logo"
        className="unito-logo"
        src={ src }
        width={ width }
        height={ height }
      />
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/UnitoLogo/UnitoLogo.jsx