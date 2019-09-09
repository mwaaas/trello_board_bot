import React, { Component } from 'react';
import styled from 'styled-components';

import { SyncDirectionIcon, Icon } from '../../components';
import { FeatureFlag, FeatureFlagVariant } from '../../containers';
import { color } from '../../theme';


const Item = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  min-height: 60px;
  background-color: ${color.light.primary};
  border: 1px solid ${color.dark.whisper};
  border-radius: 4px;
  margin-bottom: 16px;
  padding: 6px 12px;

  .dropdown-menu {
    border-top: 0;
    margin-right: -13px;
    margin-top: 18px;
  }
`;

const Indicator = styled.div`
  &:before {
    position: absolute;
    content: ' ';
    background: ${color.dark.whisper};
    top: 0;
    left: 0;
    bottom: 0;
    width: 6px;
    border-radius: 3px 0 0 3px;
  }
`;

const IconPlaceholder = styled.div`
  background-color: ${color.dark.whisper};
  border-radius: 4px;
  height: 20px;
  width: 20px;
  margin-top: 2px;
  margin-left: 8px;
  margin-right: 8px;
`;

const LinkNameWrapper = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
`;

const LinkNamePlaceholder = styled.div`
  background-color: ${color.dark.whisper};
  border-radius: 2px;
  height: 16px;
  margin-left: 16px;
  width: ${props => props.width};
`;

const TogglePlaceholder = styled.div`
  background-color: ${color.dark.whisper};
  border-radius: 26px;
  height: 26px;
  width: 52px;
  margin-left: 8px;
  margin-right: 8px;
`;

const DropdownWrapper = styled.div`
  padding-left: 14px;
  padding-right: 14px;
`;


class LinkItemLoading extends Component {
  state = {
    linkNamePlaceholderWidth: `${40 + Math.floor(Math.random() * 250)}px`,
  }

  render() {
    const { linkNamePlaceholderWidth } = this.state;

    return (
      <Item className="link-item">
        <FeatureFlag name="sync-indicator">
          <FeatureFlagVariant value={ true }>
            <Indicator className="indicator" />
          </FeatureFlagVariant>
        </FeatureFlag>

        <IconPlaceholder />

        <SyncDirectionIcon
          color={ color.dark.whisper }
          readOnlyA={ false }
          readOnlyB={ false }
        />

        <IconPlaceholder />

        <LinkNameWrapper>
          <LinkNamePlaceholder width={ linkNamePlaceholderWidth } />
        </LinkNameWrapper>

        <TogglePlaceholder />

        <DropdownWrapper>
          <Icon name="chevron-down" color={ color.dark.whisper } />
        </DropdownWrapper>

      </Item>
    );
  }
}

export default LinkItemLoading;



// WEBPACK FOOTER //
// ./src/components/LinkItemLoading/LinkItemLoading.jsx