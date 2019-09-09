import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import { Map } from 'immutable';
import styled from 'styled-components';

import { Avatar, Button, IconHoverTooltip } from '../';
import { color } from '../../theme';
import './FieldValueDisplay.scss';


const TooltipSpacing = styled.span`
  margin-right: 8px;
`;


export default class FieldValueDisplay extends Component {
  static propTypes = {
    className: PropTypes.string,
    containerSide: PropTypes.string.isRequired,
    fieldValue: PropTypes.instanceOf(Map).isRequired,
    index: PropTypes.number.isRequired,
    onMakeDefaultClick: PropTypes.func,
    onMouseOut: PropTypes.func,
    onMouseOver: PropTypes.func,
    onUnmapClick: PropTypes.func.isRequired,
    provider: PropTypes.instanceOf(Map).isRequired,
    showTail: PropTypes.bool.isRequired,
  };

  handleMakeDefaultClick = () => {
    const { onMakeDefaultClick, index } = this.props;
    onMakeDefaultClick(index);
  }

  handleUnmapClick = () => {
    const { onUnmapClick, onMouseOut, index } = this.props;
    onUnmapClick(index);
    // Force onMouseOut, or the other containerSide will stay highlighted
    onMouseOut();
  }

  render() {
    const {
      className,
      containerSide,
      fieldValue,
      index,
      onMouseOut,
      onMouseOver,
      provider,
      showTail,
    } = this.props;

    const isDefault = (index === 0);
    const isHidden = fieldValue.get('isHidden', false);
    const isNotFound = fieldValue.isEmpty();

    const classNames = classnames('field-value-display', {
      'alert-warning': isHidden || isNotFound,
      'field-value-display--is-default': isDefault,
      [`field-value-display--${containerSide}`]: containerSide,
    }, className);

    const topValueTail = `${((index + 1) * 48)}px`;

    const providerName = provider.get('displayName');
    const warningMessage = isNotFound
      ? `This item was not found in ${providerName}. Perhaps it has been deleted and should be unmapped.`
      : `This item is archived. As a result, synced changes will not be visible in ${providerName}.`;

    return (
      <div
        className={ classNames }
        title={ fieldValue.get('description') }
        onMouseOver={ onMouseOver }
        onFocus={ onMouseOver }
        onMouseOut={ onMouseOut }
        onBlur={ onMouseOut }
      >
        { showTail && !isDefault && <span className="arrow-tail-1" style={{ height: `${(index * 46)}px` }}/> }
        { showTail && <span className="arrow-tail-2" style={{ top: topValueTail }} /> }

        <div className="field-value-display__actions btn-group">
          {
            !isDefault && !isNotFound && (
              <Button
                btnStyle="link"
                className="field-value-display__make-default"
                color={ color.brand.dark }
                onClick={ this.handleMakeDefaultClick }
                size="xs"
              >
                <IconHoverTooltip iconName="angle-double-up" placement="top">
                  Make this item the group's default
                </IconHoverTooltip>
              </Button>
            )
          }
          <Button
            btnStyle="link"
            className="field-value-display__unmap"
            color={ color.brand.dark }
            onClick={ this.handleUnmapClick }
            size="xs"
          >
            <IconHoverTooltip iconName="remove" placement="top">
              Remove from this group
            </IconHoverTooltip>
          </Button>
        </div>

        <div className="field-value-display__name">
          {
            (isNotFound || isHidden)
              && <TooltipSpacing>
                <IconHoverTooltip placement="top">
                  { warningMessage }
                </IconHoverTooltip>
              </TooltipSpacing>
          }
          { isNotFound ? 'Not found' : fieldValue.get('displayName') }
          { fieldValue.get('iconUrl') && <Avatar size={ 12 } src={ fieldValue.get('iconUrl') } /> }
          {
            !fieldValue.get('iconUrl') && fieldValue.get('color') && (
              <span
                className="field-value-display__color"
                style={{ backgroundColor: fieldValue.get('color') }}
              />
            )
          }
        </div>
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/FieldValueDisplay/FieldValueDisplay.jsx