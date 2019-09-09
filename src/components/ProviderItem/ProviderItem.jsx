import PropTypes from 'prop-types';
import React from 'react';
import { Map } from 'immutable';
import styled from 'styled-components';

import { Label, ProviderIcon } from '../../components';
import { fontWeight } from '../../theme';


const Item = styled.span`
  display: flex;
  align-items: center;
  font-weight: ${props => (props.bold ? fontWeight.medium : fontWeight.regular)};
`;

const ProviderName = styled.span`
  margin-left: 1em;
`;

const Badge = styled.span`
  margin-left: 1em;
`;


const ProviderItem = ({ provider, size, bold }) => (
  <Item bold={ bold }>
    <ProviderIcon provider={ provider } size={ size } />
    <ProviderName>
      { provider.get('displayName') }
    </ProviderName>
    {
      provider.get('badge') && (
        <Badge>
          <Label labelType='warning'>
            { provider.get('badge') }
          </Label>
        </Badge>
      )
    }
  </Item>
);

ProviderItem.propTypes = {
  bold: PropTypes.bool,
  provider: PropTypes.instanceOf(Map).isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

ProviderItem.defaultProps = {
  bold: false,
  size: 'md',
};

export default ProviderItem;



// WEBPACK FOOTER //
// ./src/components/ProviderItem/ProviderItem.jsx