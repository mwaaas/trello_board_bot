import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { change } from 'redux-form';
import { Map, List } from 'immutable';
import styled from 'styled-components';

import { fieldActions } from '../../actions';
import {
  Button,
  Icon,
  IconHoverTooltip,
  SyncDirectionPicker,
} from '../../components';
import { FieldAssociationValueMapping } from '../../containers';
import { fieldTypes, linkTypes, multisyncTypes } from '../../consts';
import { otherSide as getOtherSide } from '../../utils';
import {
  fieldAssociationNeedsAutomapping,
  getFieldAssociationSideWarnings,
  getFieldAssociationWillBeIgnored,
  getProviderCapabilitiesById,
  isLoadingFieldValue,
} from '../../reducers';
import { color } from '../../theme';


const Content = styled.div`
  background-color: ${props => (props.isIgnored ? color.dark.whisper : color.dark.quiet)};
  border: 1px solid ${color.dark.whisper};
  border-radius: 2px;
`;

const Row = styled.div`
  position: relative;
  padding: 16px;
`;

const Capitalize = styled.div`
  display: inline-block;

  &::first-letter {
    text-transform: uppercase;
  }
`;

const DropdownIconWrapper = styled.div`
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
`;

const IgnoredIconWrapper = styled.div`
  position: absolute;
  top: 50%;
  right: 27px;
  transform: translateY(-50%);
`;

const TrashIconWrapper = styled.div`
  position: absolute;
  top: 50%;
  right: -24px;
  transform: translateY(-50%);

  .btn {
    height: 38px;
    width: 38px;
    padding: 0;
    color: ${color.dark.hint};

    &:hover {
      color: ${color.brand.error};
    }
  }
`;

const directionIcon = {
  both: 'exchange',
  A: 'long-arrow-left',
  B: 'long-arrow-right',
};

class FieldAssociationItem extends Component {
  static propTypes = {
    changeFieldAssociationTarget: PropTypes.func.isRequired,
    containerIdA: PropTypes.string,
    containerIdB: PropTypes.string,
    defaultTarget: PropTypes.oneOf(Object.values(fieldTypes.TARGET)),
    entity: PropTypes.oneOf([linkTypes.ENTITY_NAME, multisyncTypes.ENTITY_NAME]),
    isActive: PropTypes.bool,
    isIgnored: PropTypes.bool,
    needsMapping: PropTypes.bool,
    hideFieldValues: PropTypes.bool,
    multisyncLeafSide: PropTypes.oneOf(['A', 'B']),
    onCustomizeClick: PropTypes.func,
    onDeleteClick: PropTypes.func,
    providerA: PropTypes.instanceOf(Map).isRequired,
    providerB: PropTypes.instanceOf(Map).isRequired,
    providerIdentityIdA: PropTypes.string,
    providerIdentityIdB: PropTypes.string,
    warningsA: PropTypes.instanceOf(List).isRequired,
    warningsB: PropTypes.instanceOf(List).isRequired,
  };

  static defaultProps = {
    isActive: false,
    isIgnored: false,
    defaultTarget: fieldTypes.TARGET.BOTH,
    entity: linkTypes.ENTITY_NAME,
    needsMapping: false,
    hideFieldValues: false,
  };

  state = {
    isHovering: false,
  }

  componentDidMount() {
    const {
      fetchFieldValues,
      automapFieldValuesMapping,
      needsMapping,
      hideFieldValues,
    } = this.props;

    if (needsMapping && !hideFieldValues) {
      automapFieldValuesMapping();
      return;
    }

    if (!hideFieldValues) {
      fetchFieldValues();
    }
  }

  componentDidUpdate(prevProps) {
    const {
      automapFieldValuesMapping,
      containerIdA,
      containerIdB,
      fetchFieldValues,
      hideFieldValues,
      needsMapping,
      providerIdentityIdA,
      providerIdentityIdB,
    } = this.props;

    if (this.props.containerIdB !== prevProps.containerIdB) {
      if (needsMapping && providerIdentityIdA && providerIdentityIdB && containerIdA && containerIdB) {
        automapFieldValuesMapping();
      }

      if (!hideFieldValues) {
        fetchFieldValues();
      }
    }
  }

  handleMouseOver = () => {
    this.setState({ isHovering: true });
  }

  handleMouseLeave = () => {
    this.setState({ isHovering: false });
  }

  handleOnCustomize = () => {
    const { onCustomizeClick, isLoading } = this.props;

    if (!isLoading) {
      onCustomizeClick();
    }
  }

  getWarningMessage = (warning) => {
    const { fieldAssociation } = this.props;

    const containerSide = warning.get('containerSide');
    const unmappedStatusCount = warning.get('unmappedCount');
    const singularOrPlural = unmappedStatusCount === 1 ? 'displayName' : 'displayNamePlural';
    const fieldTerm = fieldAssociation.getIn([containerSide, singularOrPlural]);

    switch (warning.get('type')) {
      case linkTypes.WARNINGS.MISSING_MAPPING_FIELD_VALUE:
        return `Missing ${fieldTerm}`;

      case linkTypes.WARNINGS.UNMAPPED_STATUSES:
        return `${warning.get('unmappedCount')} unmapped ${fieldTerm}`;

      // Should never trigger. However, this would be more graceful than "undefined" if it did.
      default:
        return 'There is a problem with your sync settings';
    }
  }

  renderFieldName = (containerSide) => {
    const {
      fieldAssociation,
      isActive,
      isLoading,
      warningsA,
      warningsB,
      providerB,
    } = this.props;

    const fieldName = fieldAssociation.getIn([containerSide, 'displayName']);
    const fieldNamePlural = fieldAssociation.getIn([containerSide, 'displayNamePlural']);
    const otherSideFieldNamePlural = fieldAssociation.getIn([getOtherSide(containerSide), 'displayNamePlural']);
    const firstWarning = containerSide === 'A' ? warningsA.first() : warningsB.first();
    const isDescriptionFooter = fieldAssociation.getIn([containerSide, 'field']) === fieldTypes.DESCRIPTION_FOOTER;
    const statusTermPlural = fieldAssociation.getIn([containerSide, 'displayNamePlural']);
    const canMapValues = fieldAssociation.get('canMapValues');
    const containerTerm = providerB.getIn(['capabilities', 'terms', 'container', 'singular']);
    const isSettingsPerSync = fieldAssociation.get('isSettingsPerSync');

    return (
      <div>
        <Capitalize>{ fieldName || 'Inaccessible custom field' } </Capitalize> { ' ' }
        {
          !fieldName
              && <IconHoverTooltip
                placement="top"
                iconName="warning"
                iconColor={ color.brand.warning }
              >
                You don't have access to this custom field anymore or it has been deleted
              </IconHoverTooltip>
        }
        {
          !isLoading && fieldAssociation.get('hasMapValues') && firstWarning
            && <IconHoverTooltip
              placement="top"
              iconName="warning"
              iconColor={ color.brand.warning }
            >
              {
                firstWarning.get('type') === linkTypes.WARNINGS.UNMAPPED_STATUSES
                  ? `Unmapped ${statusTermPlural} will still sync! `
                    + `If you want to filter by ${statusTermPlural}, you can do that in the "Filter Tasks" tab.`
                  : `This project is missing mapped ${fieldName}. Please update the mapping and unmap the missing ${fieldName}.`
              }
            </IconHoverTooltip>
        }
        {
          isDescriptionFooter
          && <IconHoverTooltip placement="top" iconColor={ color.dark.hint }>
            Special block of text added at the end of the description. { ' ' }
            Displays additional information from fields of the other app.
          </IconHoverTooltip>
        }
        {
          canMapValues && containerSide === 'A' && !isSettingsPerSync && (
            <IconHoverTooltip
              placement="top"
              iconColor={ color.dark.hint }
            >
              To customize your { ` ${fieldNamePlural}${fieldNamePlural === otherSideFieldNamePlural ? '' : `/${otherSideFieldNamePlural}`}` } mapping
              go to the Settings { ' ' } per sync tab and select the { containerTerm } concerned.
            </IconHoverTooltip>

          )
        }
        {
          isActive && !!firstWarning
          && <div>
            <small>{ this.getWarningMessage(firstWarning) }</small>
          </div>
        }
      </div>
    );
  }

  associationHasReadOnlyField = (fieldA, fieldB) => {
    const STATIC_FIELDS = [
      'title',
      'description',
      'comments',
      fieldTypes.DESCRIPTION_FOOTER,
    ];

    const { capabilitiesProviderA, capabilitiesProviderB } = this.props;

    if (STATIC_FIELDS.includes(fieldA) || STATIC_FIELDS.includes(fieldB)) {
      return true;
    }

    return capabilitiesProviderA.getIn([fieldA, 'readOnly'])
      || capabilitiesProviderB.getIn([fieldB, 'readOnly']);
  }

  renderAssociationDirection = () => {
    const { changeFieldAssociationTarget, defaultTarget, fieldAssociation } = this.props;
    const fieldTarget = fieldAssociation.get('target', defaultTarget);

    const fieldA = fieldAssociation.getIn(['A', 'field']);
    const fieldB = fieldAssociation.getIn(['B', 'field']);

    // If there is a sync direction which isn't "both", don't show picked
    if (defaultTarget === fieldTypes.TARGET.BOTH && !this.associationHasReadOnlyField(fieldA, fieldB)) {
      return (
        <SyncDirectionPicker
          size="xs"
          btnStyle="dark"
          onClick={ changeFieldAssociationTarget }
          selectedTarget={ fieldTarget }
        />
      );
    }

    return <Icon name={ directionIcon[fieldTarget] }/>;
  }

  render() {
    const {
      fieldAssociation,
      fieldAssociationIndex,
      isActive,
      isIgnored,
      isLoading,
      multisyncLeafSide,
      onDeleteClick,
      providerA,
      providerB,
      entity,
      containerIdA,
      containerIdB,
      providerIdentityIdA,
      providerIdentityIdB,
    } = this.props;
    const { isHovering } = this.state;

    const fieldNameA = fieldAssociation.getIn(['A', 'displayName']) || fieldAssociation.getIn(['A', 'field']);
    const fieldNameB = fieldAssociation.getIn(['B', 'displayName']) || fieldAssociation.getIn(['B', 'field']);
    const hasMapValues = fieldAssociation.get('hasMapValues');

    return (
      <Content
        isIgnored={ isIgnored }
        onMouseOver={ this.handleMouseOver }
        onMouseLeave={ this.handleMouseLeave }
      >
        <Row className="row">

          <div className="text-center col-xs-4">
            { this.renderFieldName('A') }
          </div>

          <div className="text-center col-xs-4">
            { this.renderAssociationDirection() }
          </div>

          <div className="text-center col-xs-4">
            { this.renderFieldName('B') }
          </div>

          {
            isIgnored && (
              <IgnoredIconWrapper>
                <IconHoverTooltip
                  placement="top"
                  iconName="warning"
                  iconColor={ color.brand.warning }
                >
                  This mapping will be ignored because information is not syncing in this direction.
                </IconHoverTooltip>
              </IgnoredIconWrapper>
            )
          }

          {
            hasMapValues && (
              <DropdownIconWrapper>
                <Button
                  btnStyle="link"
                  onClick={ this.handleOnCustomize }
                  title="Customize field mapping"
                  size="xs"
                >
                  <Icon
                    className={ isLoading ? 'fa-spin' : '' }
                    color={ color.brand.secondary }
                    name={ isLoading ? 'spinner' : 'cog' }
                  />
                </Button>
              </DropdownIconWrapper>
            )
          }

          {
            isHovering && !!onDeleteClick && (
              <TrashIconWrapper>
                <Button
                  btnStyle="link"
                  onClick={ onDeleteClick }
                  title="Remove field mapping"
                  size="xs"
                >
                  <Icon name="trash" />
                </Button>
              </TrashIconWrapper>
            )
          }
        </Row>

        {
          hasMapValues && isActive && (
            <FieldAssociationValueMapping
              fieldAssociation={ fieldAssociation }
              fieldAssociationIndex={ fieldAssociationIndex }
              fieldNameA={ fieldNameA }
              fieldNameB={ fieldNameB }
              multisyncLeafSide={ multisyncLeafSide }
              providerA={ providerA }
              providerB={ providerB }
              entity={ entity }
              containerIdA={ containerIdA }
              containerIdB={ containerIdB }
              providerIdentityIdA={ providerIdentityIdA }
              providerIdentityIdB={ providerIdentityIdB }
            />
          )
        }

      </Content>
    );
  }
}

const mapDispatchToProps = (dispatch, {
  fieldAssociation,
  fieldAssociationIndex,
  entity,
  multisyncLeafSide,
  ...rest
}) => ({
  fetchFieldValues: () => {
    if (fieldAssociation && fieldAssociation.get('hasMapValues')) {
      ['A', 'B'].forEach((containerSide) => {
        const fieldId = fieldAssociation.getIn([containerSide, 'field']);
        const kind = fieldAssociation.getIn([containerSide, 'kind']);
        const category = fieldAssociation.getIn([containerSide, 'mappingCategory']);
        dispatch(fieldActions.fetchFieldValues({
          fieldId,
          kind,
          category,
          containerSide,
          containerId: rest[`containerId${containerSide}`],
          providerIdentityId: rest[`providerIdentityId${containerSide}`],
        }));
      });
    }
  },
  changeFieldAssociationTarget: (target) => {
    dispatch(change(entity === multisyncTypes.ENTITY_NAME ? 'multisyncForm' : 'syncForm', 'fieldAssociationsHaveChanged', true));
    dispatch(fieldActions.changeFieldAssociationTarget({
      containerIdA: rest.containerIdA,
      containerIdB: rest.containerIdB,
      entity,
      index: fieldAssociationIndex,
      multisyncLeafSide,
      target,
    }));
  },
  automapFieldValuesMapping: () => {
    dispatch(fieldActions.automapFieldValuesMapping({
      containerIdA: rest.containerIdA,
      containerIdB: rest.containerIdB,
      providerIdentityIdA: rest.providerIdentityIdA,
      providerIdentityIdB: rest.providerIdentityIdB,
      fieldAssociation,
      entity,
      fieldAssociationIndex,
      multisyncLeafSide,
    }));
  },
});

const mapStateToProps = (state, {
  entity,
  fieldAssociationIndex,
  fieldAssociation,
  providerA,
  providerB,
  ...rest
}) => {
  const isLoadingA = isLoadingFieldValue(state, 'A', fieldAssociation.getIn(['A', 'field']));
  const isLoadingB = isLoadingFieldValue(state, 'B', fieldAssociation.getIn(['B', 'field']));

  return {
    isIgnored: getFieldAssociationWillBeIgnored(state, { ...rest, fieldAssociation }),
    isLoading: isLoadingA || isLoadingB,
    warningsA: getFieldAssociationSideWarnings(state, { fieldAssociationIndex, fieldAssociation, containerSide: 'A' }),
    warningsB: getFieldAssociationSideWarnings(state, { fieldAssociationIndex, fieldAssociation, containerSide: 'B' }),
    capabilitiesProviderA: getProviderCapabilitiesById(state, providerA.get('_id'), 'fields'),
    capabilitiesProviderB: getProviderCapabilitiesById(state, providerB.get('_id'), 'fields'),
    needsMapping: fieldAssociationNeedsAutomapping(state, { fieldAssociation, entity }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FieldAssociationItem);



// WEBPACK FOOTER //
// ./src/containers/FieldAssociationItem/FieldAssociationItem.jsx