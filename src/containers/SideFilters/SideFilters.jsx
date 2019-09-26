import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, FieldArray, FormSection } from 'redux-form';
import { Map } from 'immutable';
import styled from 'styled-components';

import { fieldActions } from '../../actions';
import {
  Card,
  Icon,
  IconHoverTooltip,
  InlineLoading,
  Section,
  Title,
  ToggleFormInput,
} from '../../components';
import { ChooseFilter, FieldValuesSelect } from '../../containers';
import {
  getContainer,
  getCurrentMultisync,
  getProviderCapabilities,
  isLoadedCustomFields,
  getMultisyncDiscriminantBySide,
} from '../../reducers';
import { color } from '../../theme';
import { otherSide } from '../../utils';


const NoArrow = styled.div`
  .Select-arrow-zone {
    display: none;
  }
`;


class SideFilters extends Component {
  static propTypes = {
    containerName: PropTypes.string.isRequired,
    containerSide: PropTypes.oneOf(['A', 'B']).isRequired,
    fetchCustomFields: PropTypes.func.isRequired,
    multisync: PropTypes.instanceOf(Map),
    multisyncDiscriminant: PropTypes.instanceOf(Map),
    otherContainerName: PropTypes.string.isRequired,
    taskTerm: PropTypes.string.isRequired,
  };

  componentDidMount() {
    this.props.fetchCustomFields();
  }

  render() {
    const {
      containerName,
      containerSide,
      isLoading,
      multisync,
      multisyncDiscriminant,
      otherContainerName,
      pcdFields,
      taskTerm,
    } = this.props;

    if (isLoading) {
      return <InlineLoading />;
    }

    return (
      <Card borderless color={ color.dark.quiet }>
        <FormSection name={ containerSide }>
          <Section>
            <FieldArray
              component={ ChooseFilter }
              name="filters"
              props={{ containerName, containerSide }}
            />
          </Section>
          <Section>
            <Field component={ ToggleFormInput } name="closedTasks">
              Include closed { taskTerm } { ' ' }
              <IconHoverTooltip placement="top">
                Import { taskTerm } which are already closed
                or archived to { otherContainerName } from { containerName }
              </IconHoverTooltip>
            </Field>
          </Section>
          {
            multisyncDiscriminant && (
              <Section>
                <hr />
                <Title type="h3">
                  Multi-sync filter { ' ' }
                  <Icon name="random" className="fa-rotate-270" /> { ' ' }
                </Title>
                <p>
                  This { pcdFields.getIn([multisyncDiscriminant.get('fieldId'), 'displayName', 'singular']) } { ' ' }
                  was configured in the multi-sync <em>{ multisync.get('name') }</em>
                </p>
                <NoArrow>
                  <FieldValuesSelect
                    category={ multisyncDiscriminant.get('category') }
                    containerSide={ this.props.containerSide }
                    disabled
                    fieldId={ multisyncDiscriminant.get('fieldId') }
                    kind={ multisyncDiscriminant.get('kind') }
                    multi
                    onChange={ this.onSelectIssueType }
                    value={ multisyncDiscriminant.get('multisyncDiscriminant') }
                  />
                </NoArrow>
              </Section>
            )
          }
        </FormSection>
      </Card>
    );
  }
}

const mapStateToProps = (state, { containerSide }) => ({
  containerName: getContainer(state, { containerSide }).get('displayName'),
  isLoading: !isLoadedCustomFields(state, { containerSide }),
  multisync: getCurrentMultisync(state),
  multisyncDiscriminant: getMultisyncDiscriminantBySide(state, { containerSide }),
  otherContainerName: getContainer(state, { containerSide: otherSide(containerSide) }).get('displayName'),
  pcdFields: getProviderCapabilities(state, { containerSide }, 'fields'),
  taskTerm: getProviderCapabilities(state, { containerSide }, 'terms').getIn(['task', 'plural']),
});

const mapDispatchToProps = (dispatch, { containerSide }) => ({
  fetchCustomFields: () => {
    dispatch(fieldActions.getCustomFields({ containerSide }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SideFilters);



// WEBPACK FOOTER //
// ./src/containers/SideFilters/SideFilters.jsx