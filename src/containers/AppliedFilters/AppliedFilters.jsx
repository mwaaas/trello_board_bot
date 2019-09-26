import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Field } from 'redux-form';
import { List, Map } from 'immutable';
import styled from 'styled-components';

import { fieldTypes } from '../../consts';
import {
  Button, Icon, IconHoverTooltip, Section, Title,
} from '../../components';

import { Filter } from '../../containers';
import { color } from '../../theme';

const { PCD_FIELD } = fieldTypes.KINDS;


const FilterRow = styled.div`
  position: relative;

  &:hover .btn {
    visibility: visible;
  }
`;

const DeleteButtonContainer = styled.div`
  position: absolute;
  right: -27px;
  bottom: 2px;

  .btn {
    visibility: hidden;
    height: 38px;
    width: 28px;
    padding: 0;
    color: ${color.dark.hint};

    &:hover {
      color: ${color.brand.error};
    }
  }

  &:hover .btn {
    visibility: visible;
  }
`;


class AppliedFilters extends Component {
  static propTypes = {
    allContainerFields: PropTypes.instanceOf(Map).isRequired,
    containerSide: PropTypes.oneOf(['A', 'B']).isRequired,
    fields: PropTypes.object.isRequired,
    containerName: PropTypes.string.isRequired,
  };

  getFieldValueIdsToExclude = (fieldId, filterType) => {
    const appliedFilters = this.props.fields.getAll();
    const oppositeType = filterType === 'whiteList' ? 'blackList' : 'whiteList';

    let fieldValueIdsToExclude = new List();

    const oppositeTypeFilters = appliedFilters
      .filter(filter => filter.fieldId === fieldId)
      .find(filter => filter.type === oppositeType);

    // If the opposite filter has values applied, make those values unavailable for selection
    if (oppositeTypeFilters && oppositeTypeFilters.values) {
      fieldValueIdsToExclude = new List(oppositeTypeFilters.values);
    }

    return fieldValueIdsToExclude;
  }

  getFieldName = (field) => {
    if (field.get('kind') === PCD_FIELD) {
      return field.get('fieldId');
    }

    return field.get('name');
  }

  removeFilter = index => () => {
    const { fields } = this.props;
    fields.remove(index);
  }

  render() {
    const {
      allContainerFields,
      containerName,
      containerSide,
      fields,
    } = this.props;

    if (fields.length === 0) {
      return null;
    }

    return (
      <Section>
        <Title type="h3">
          Current filters
        </Title>
        {
          fields.map((fieldItem, index, allFields) => {
            const { fieldId, type } = allFields.get(index);
            const fieldValueIdsToExclude = this.getFieldValueIdsToExclude(fieldId, type);
            const field = allContainerFields.get(fieldId);

            if (!field) {
              // Hopefully the only case of this is a deleted custom field.
              return (
                <div>
                  <div>
                    <IconHoverTooltip
                      placement="top"
                      iconName="warning"
                      iconColor={ color.brand.warning }
                    >
                      Deleted field id: { fieldId }
                    </IconHoverTooltip>
                    { ' ' } A custom field was deleted from project "{ containerName }".
                    Please delete this filter, and create a new one if needed.
                  </div>
                  <Button
                    reverse
                    btnStyle="error"
                    onClick={ this.removeFilter(index) }
                  >
                    Delete filter
                  </Button>
                </div>
              );
            }

            return (
              <FilterRow key={ fieldId + type }>
                <Field
                  name={ `${fieldItem}.values` }
                  component={ Filter }
                  props={{
                    containerSide,
                    customFieldName: field.get('name', ''),
                    fieldId,
                    fieldValueIdsToExclude,
                    filter: field.get(type),
                    kind: field.get('kind'),
                    type,
                    searchable: field.get('searchable'),
                    valueLabels: field.get('valueLabels', Map()),
                  }}
                />
                <DeleteButtonContainer>
                  <Button
                    btnStyle="link"
                    size="sm"
                    onClick={ this.removeFilter(index) }
                  >
                    <Icon name="trash" />
                  </Button>
                </DeleteButtonContainer>
              </FilterRow>
            );
          })
        }
      </Section>
    );
  }
}

export default AppliedFilters;



// WEBPACK FOOTER //
// ./src/containers/AppliedFilters/AppliedFilters.jsx