import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, Fields } from 'redux-form';
import { Map } from 'immutable';

import { Section, Title } from '../../components';
import {
  ChooseContainer,
  ChooseInformationType,
  ProvidersSelect,
  ProviderIdentitiesSelect,
} from '../../containers';
import {
  getContainerFieldValue,
  getDefaultParamContainerId,
  getDefaultParamProviderId,
  getInitialProviderIdentityId,
  getIsReviewingLink,
  getIsSideLocked,
  getProviderCapabilities,
} from '../../reducers';
import { capitalize } from '../../utils';


class ContainerConfiguration extends Component {
  static propTypes = {
    containerSide: PropTypes.oneOf(['A', 'B']).isRequired,
    defaultContainer: PropTypes.string,
    defaultProvider: PropTypes.string,
    hasSelectedProvider: PropTypes.bool.isRequired,
    isEdit: PropTypes.bool.isRequired,
    selectedProviderIdentity: PropTypes.string,
    terms: PropTypes.instanceOf(Map).isRequired,
    taskCategories: PropTypes.instanceOf(Map).isRequired,
  };

  isContainerReadOnly = () => {
    const { defaultContainer, isSideLocked } = this.props;
    return !!defaultContainer && isSideLocked;
  }

  isProviderReadOnly = () => {
    const { isEdit, defaultProvider, isSideLocked } = this.props;
    return isEdit || (!!defaultProvider && isSideLocked);
  }

  isTaskCategoriesDefined = () => {
    const { taskCategories } = this.props;
    return !taskCategories.isEmpty();
  }

  getAppTitle = () => {
    const { containerSide } = this.props;

    const position = containerSide === 'A' ? 'first' : 'second';
    const chooseYour = this.isProviderReadOnly() ? '' : 'choose the ';

    return capitalize(`${chooseYour}${position} tool to sync`);
  }

  getContainerTitle = () => {
    const { terms } = this.props;

    const title = this.isContainerReadOnly()
      ? `${terms.getIn(['container', 'singular'])} to sync`
      : `choose the ${terms.getIn(['container', 'singular'])} you'd like to sync`;

    return capitalize(title);
  }

  getTaskCategoriesContainerTitle = () => {
    const { terms } = this.props;
    const containerType = terms.getIn(['containerType', 'singular']);
    return `Choose the ${containerType} you want to sync`;
  }

  render() {
    const {
      containerSide,
      defaultContainer,
      hasSelectedProvider,
      initialProviderIdentityId, // Returns undefined if no provider identity instance exists for provider
      isEdit,
      selectedProviderIdentity,
    } = this.props;

    const displayContainerSelect = !isEdit && selectedProviderIdentity && initialProviderIdentityId;
    const isProviderReadOnly = this.isProviderReadOnly();
    const isTaskCategoriesDefined = this.isTaskCategoriesDefined();

    return (
      <div className="container-configuration">
        <Section>
          {
            !isEdit && (
              <Title type="h3">
                { this.getAppTitle() }
              </Title>
            )
          }

          <Field
            component={ ProvidersSelect }
            name="providerId"
            props={{ containerSide, readOnly: isProviderReadOnly }}
          />

          {
            hasSelectedProvider && (
              <Field
                component={ ProviderIdentitiesSelect }
                name="providerIdentityId"
                props={{
                  containerSide,
                  disableIfNoContainerAccess: isEdit || this.isContainerReadOnly(),
                  forceClearContainers: !isEdit && !this.isContainerReadOnly(),
                  isContainerReadOnly: this.isContainerReadOnly(),
                  isEdit,
                }}
              />
            )
          }

          {
            displayContainerSelect && (
              <Section>
                <Title type="h3">{ this.getContainerTitle() }</Title>
                <Fields
                  component={ ChooseContainer }
                  containerSide={ containerSide }
                  defaultContainer={ defaultContainer }
                  isContainerReadOnly={ this.isContainerReadOnly() }
                  names={ ['containerId', 'existingContainer', 'newContainerName', 'workspaceId'] }
                  providerIdentityId={ selectedProviderIdentity }
                />
              </Section>
            )
          }

          {
            !isEdit && isTaskCategoriesDefined && (
              <Section>
                <Title type="h3">{ this.getTaskCategoriesContainerTitle() }</Title>
                <Field
                  component={ ChooseInformationType }
                  containerSide={ containerSide }
                  providerIdentityId={ selectedProviderIdentity }
                  name='selectedCapabilityKey'
                />
              </Section>
            )
          }

        </Section>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  initialProviderIdentityId: getInitialProviderIdentityId(state, ownProps),
  isSideLocked: getIsSideLocked(state, ownProps),
  defaultContainer: getDefaultParamContainerId(state, ownProps.containerSide),
  defaultProvider: getDefaultParamProviderId(state, ownProps.containerSide),
  hasSelectedProvider: !!getContainerFieldValue(state, ownProps, 'providerId'),
  linkIsBeingReviewed: getIsReviewingLink(state),
  selectedProviderIdentity: getContainerFieldValue(state, ownProps, 'providerIdentityId'),
  terms: getProviderCapabilities(state, ownProps, 'terms'),
  taskCategories: getProviderCapabilities(state, ownProps, 'taskCategories'),
});

export default connect(mapStateToProps)(ContainerConfiguration);



// WEBPACK FOOTER //
// ./src/containers/ContainerConfiguration/ContainerConfiguration.jsx