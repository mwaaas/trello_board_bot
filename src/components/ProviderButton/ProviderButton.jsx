import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map } from 'immutable';
import styled from 'styled-components';

import { Button } from '../../components';
import { color } from '../../theme';


const Icon = styled.img`
  display: inline;
  height: 20px;
  margin-right: 16px;
  vertical-align: text-bottom;
`;


export default class ProviderButton extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func.isRequired,
    provider: PropTypes.instanceOf(Map).isRequired,
  };

  getIconSrc = () => {
    const { provider } = this.props;
    const [fileName, extension] = provider.get('logo').split('.');

    const iconFilename = `${fileName}-button.${extension}`;
    return `${process.env.PUBLIC_URL}/images/${iconFilename}`;
  }

  render() {
    const { children, provider, ...rest } = this.props;

    const src = this.getIconSrc();
    const alt = `${provider.get('name')} logo`;

    return (
      <Button
        {...rest}
        backgroundColor={ provider.get('brandColor') }
        color={ color.light.primary }
      >
        <Icon alt={ alt } src={ src } />
        { children }
      </Button>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/ProviderButton/ProviderButton.jsx