import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map, List } from 'immutable';
import classnames from 'classnames';

import { FieldValueDisplay, Icon } from '../';
import { FieldValuesSelect } from '../../containers';
import { otherSide } from '../../utils';
import './FieldValuesGroup.scss';


export default class FieldValuesGroup extends Component {
  static propTypes = {
    category: PropTypes.string,
    containerSide: PropTypes.oneOf(['A', 'B']).isRequired,
    fieldId: PropTypes.string.isRequired,
    fieldName: PropTypes.string.isRequired,
    fieldValueIdsToExclude: PropTypes.instanceOf(List).isRequired,
    fieldValues: PropTypes.instanceOf(List).isRequired,
    isActive: PropTypes.bool.isRequired,
    kind: PropTypes.string.isRequired,
    onAddFieldValue: PropTypes.func.isRequired,
    onMakeDefaultItem: PropTypes.func.isRequired,
    onShouldHighlightOtherSide: PropTypes.func.isRequired,
    onUnmapItem: PropTypes.func.isRequired,
    provider: PropTypes.instanceOf(Map).isRequired,
    providerIdentityId: PropTypes.string.isRequired,
    containerId: PropTypes.string.isRequired,
    target: PropTypes.oneOf(['A', 'B', 'both']).isRequired,
  };

  highlightOtherSideDefault = (needsHighlight) => {
    const { containerSide, onShouldHighlightOtherSide } = this.props;
    onShouldHighlightOtherSide(otherSide(containerSide), needsHighlight);
  }

  handleAddFieldValue = (value) => {
    const { onAddFieldValue, containerSide } = this.props;
    onAddFieldValue(containerSide, value);
  }

  handleOnMouseOver = () => this.highlightOtherSideDefault(true);

  handleOnMouseOut = () => this.highlightOtherSideDefault(false);

  handleOnMakeDefaultItem = (index) => {
    const { onMakeDefaultItem, containerSide } = this.props;
    onMakeDefaultItem(containerSide, index);
  }

  handleOnUnmapItem = (index) => {
    const { onUnmapItem, containerSide } = this.props;
    onUnmapItem(containerSide, index);
  }

  render() {
    const {
      category,
      containerSide,
      containerId,
      fieldId,
      fieldName,
      fieldValueIdsToExclude,
      fieldValues,
      isActive,
      kind,
      provider,
      providerIdentityId,
      target,
    } = this.props;

    const classNames = classnames('field-values-group', {
      [`field-values-group--${containerSide}`]: containerSide,
      'field-values-group--empty': fieldValues.isEmpty(),
      'field-values-group--is-active': isActive,
    });
    const selectClassNames = classnames('field-values-group__add', `field-values-group--${containerSide}`, {
      'field-values-group__add--is-children': !fieldValues.isEmpty(),
    });
    const showArrow = (target === 'both' || target === containerSide);

    return (
      <div className={ classNames }>
        {
          fieldValues.map((fieldValue, index) => (
            <FieldValueDisplay
              containerSide={ containerSide }
              fieldName={ fieldName }
              fieldValue={ fieldValue }
              index={ index }
              isActive={ isActive }
              key={ index }
              onMakeDefaultClick={ this.handleOnMakeDefaultItem }
              onMouseOut={ this.handleOnMouseOut }
              onMouseOver={ this.handleOnMouseOver }
              onUnmapClick={ this.handleOnUnmapItem }
              provider={ provider }
              showTail={ (target === 'both' || target !== containerSide) }
            />
          )).toArray()
        }

        { showArrow && containerSide === 'A' && <Icon name="long-arrow-left" /> }
        { showArrow && containerSide === 'B' && <Icon name="long-arrow-right" /> }

        <FieldValuesSelect
          autoload
          category={ category }
          className={ selectClassNames }
          containerId={ containerId }
          containerSide={ containerSide }
          fieldId={ fieldId }
          fieldValueIdsToExclude={ fieldValueIdsToExclude }
          kind={ kind }
          onChange={ this.handleAddFieldValue }
          providerIdentityId={ providerIdentityId }
        />
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/FieldValuesGroup/FieldValuesGroup.jsx