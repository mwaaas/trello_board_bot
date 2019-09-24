import PropTypes from 'prop-types';
import React from 'react';
import { Map } from 'immutable';
import styled from 'styled-components';

import { Label, ProviderIcon } from '../../components';
import { fontWeight } from '../../theme';


const ItemWrapper = styled.div`
  display: flex;
  align-items: center;
  font-weight: ${fontWeight.regular};
`;

const ProviderName = styled.span`
  margin-left: 1em;
`;

const Badge = styled.span`
  margin-left: 1em;
`;


const ProviderIconWithLabel = ({ provider, preLabel, showBadge }) => (
  <ItemWrapper>
    <ProviderIcon provider={ provider } size="sm" />
    <ProviderName>
      { preLabel ? `${preLabel} ` : ''}
      { provider.get('displayName') }
    </ProviderName>
    {
      showBadge && (
        <Badge>
          <Label labelType='warning'>
            { provider.get('badge') }
          </Label>
        </Badge>
      )
    }
  </ItemWrapper>
);

ProviderIconWithLabel.propTypes = {
  provider: PropTypes.instanceOf(Map).isRequired,
  preLabel: PropTypes.string,
  showBadge: PropTypes.bool,
};

ProviderIconWithLabel.defaultProps = {
  preLabel: null,
  showBadge: false,
};

export default ProviderIconWithLabel;



// WEBPACK FOOTER //
// ./src/components/ProviderIconWithLabel/ProviderIconWithLabel.jsx