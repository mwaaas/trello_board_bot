import styled from 'styled-components';

import {
    color,
    fontSize,
    fontWeight
} from '../../theme';

export const FilterItem = styled.div `
  position: relative;
  display: flex;
  align-items: center;
  min-height: 60px;
  background-color: ${props => (props.isDisabled ? color.dark.whisper : color.light.primary)};
  margin-bottom: 16px;
  padding: 6px 12px;
  font-size: ${fontSize.h1};
  font-weight: ${fontWeight.medium};
  border: 1px solid ${props => (props.hasError ? 'red' : 'transparent')};
`;

export const FieldWrapper = styled.div `
  display: inline-block;
  vertical-align: middle;
  width: 320px;
  margin-right: 5px;
  margin-left: 5px;

  .form-group {
    margin-bottom: 0;
  }
`;

export const ContainerDisplayWrapper = styled.div `
  display: inline-block;
  font-weight: ${fontWeight.regular};
  margin-left: 4px;
  margin-right: 4px;
  vertical-align: middle;
`;

export const TextWrapper = styled.span `
  margin-left: 10px;
  margin-right: 10px;
`;


export { default as MultisyncFilterItem} from './MultisyncFilterItem';
export { default as AddMultisyncFilterItem} from './AddMultisyncFilterItem';
export { default as MultisyncFilterItemDetails} from './MultisyncFilterItemDetails';



// WEBPACK FOOTER //
// ./src/components/MultisyncFilters/index.js