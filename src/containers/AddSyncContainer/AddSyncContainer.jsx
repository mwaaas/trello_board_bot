import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import uuid from 'uuid';
import styled from 'styled-components';

import { linkActions } from '../../actions';
import { trackingTypes } from '../../consts';
import { Loading, NavTabs } from '../../components';
import {
  AppsSyncForm,
  FiltersSyncForm,
  SyncFormConfirmationModal,
  ReviewSyncForm,
} from '../../containers';
import {
  appHasDefaultSyncParameters,
  getEmbedName,
  getFiltersSideWarnings,
  getMappingSideWarnings,
  isLoadedProviderIdentities,
} from '../../reducers';

import syncContainerHoC from '../SyncContainerHoC/SyncContainerHoC';
import getProviderIdentitiesHoC from '../GetProviderIdentitiesHoC/GetProviderIdentitiesHoC';


const Content = styled.div`
  background: white;
  min-height: calc(100vh - 66px);
  padding: 4em 6em;

  .nav {
    margin-bottom: 4rem;
  }
`;


class AddSyncContainer extends Component {
  static propTypes = {
    hasFiltersWarnings: PropTypes.bool.isRequired,
    hasMappingWarnings: PropTypes.bool.isRequired,
    immutableA: PropTypes.bool,
    immutableB: PropTypes.bool,
    areProviderIdentitiesLoaded: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    pages: PropTypes.array,
  };

  static defaultProps = {
    immutableA: false,
    immutableB: false,
  };

  state = {
    createLinkSessionId: uuid.v4(),
    activePage: 0,
    showModal: false,
  };

  componentDidMount() {
    const { trackAddSyncSteps } = this.props;
    const { createLinkSessionId } = this.state;
    trackAddSyncSteps(trackingTypes.FORM_ACTIONS.START, 0, createLinkSessionId);
  }

  showModal = () => {
    const { trackAddSyncSteps } = this.props;
    const { activePage, createLinkSessionId } = this.state;
    trackAddSyncSteps(trackingTypes.FORM_ACTIONS.WARNING, activePage + 1, createLinkSessionId);
    this.setState({ showModal: true });
  }

  hideModal = () => {
    this.setState({ showModal: false });
  }

  getModalSubmit = () => {
    const { activePage } = this.state;

    if (activePage === 1) {
      return this.nextPage;
    }

    if (activePage === 2) {
      return this.createSync;
    }

    return () => {};
  }

  nextPage = () => {
    const { pages, trackAddSyncSteps } = this.props;
    const { activePage, createLinkSessionId } = this.state;

    trackAddSyncSteps(trackingTypes.FORM_ACTIONS.NEXT, activePage + 1, createLinkSessionId);
    this.setState({ activePage: Math.min(activePage + 1, pages.length - 1) });
  }

  previousPage = () => {
    const { trackAddSyncSteps } = this.props;
    const { activePage, createLinkSessionId } = this.state;

    trackAddSyncSteps(trackingTypes.FORM_ACTIONS.BACK, activePage + 1, createLinkSessionId);
    this.setState({ activePage: Math.max(0, activePage - 1) });
  }

  handleFiltersSubmit = () => {
    const { hasFiltersWarnings } = this.props;

    if (hasFiltersWarnings) {
      this.showModal();
      return;
    }

    this.nextPage();
  }

  handleMappingSubmit = (formData) => {
    const { hasMappingWarnings } = this.props;

    if (hasMappingWarnings) {
      this.showModal();
      return;
    }

    this.createSync(formData);
  }


  createSync = (formData) => {
    const { addSync, trackAddSyncSteps } = this.props;
    const { activePage, createLinkSessionId } = this.state;

    trackAddSyncSteps(trackingTypes.FORM_ACTIONS.SUBMIT, activePage + 1, createLinkSessionId);
    addSync(formData);
  }

  cancelCreation = () => {
    const { onCancel, trackAddSyncSteps } = this.props;
    const { activePage, createLinkSessionId } = this.state;

    trackAddSyncSteps(trackingTypes.FORM_ACTIONS.CANCEL, activePage + 1, createLinkSessionId);
    onCancel();
  }

  render() {
    const {
      immutableA,
      immutableB,
      areProviderIdentitiesLoaded,
      pages,
    } = this.props;
    const { activePage, showModal } = this.state;

    if (!areProviderIdentitiesLoaded) {
      return <Loading />;
    }

    return (
      <Content className="add-sync-container container">
        <NavTabs
          activeTab={ activePage }
          tabNames={ pages }
          isJustified
          tabStyle="pills"
        />

        <div className="sync-container__form">
          {
            activePage === 0 && (
              <AppsSyncForm
                onSubmit={ this.nextPage }
                onCancel={ this.cancelCreation }
                immutableA={ immutableA }
                immutableB={ immutableB }
              />
            )
          }
          {
            activePage === 1 && (
              <FiltersSyncForm
                onCancel={ this.cancelCreation }
                onSubmit={ this.handleFiltersSubmit }
                onPrevious={ this.previousPage }
              />
            )
          }
          {
            activePage === 2 && (
              <ReviewSyncForm
                createLinkSessionId={ this.state.createLinkSessionId }
                onCancel={ this.cancelCreation }
                onSubmit={ this.createSync }
                onPrevious={ this.previousPage }
              />
            )
          }
        </div>

        <SyncFormConfirmationModal
          isOpen={ showModal }
          onRequestClose={ this.hideModal }
          onSubmit={ this.getModalSubmit() }
          submitButtonText="Next"
          filtersOnly={ activePage === 1 }
          mappingOnly={ activePage === 2 }
        />
      </Content>
    );
  }
}
AddSyncContainer = syncContainerHoC(AddSyncContainer);
AddSyncContainer = getProviderIdentitiesHoC(AddSyncContainer);

const mapStateToProps = (state) => {
  const embedName = getEmbedName(state);
  const pages = ['Choose projects', 'Filter tasks', 'Review'];

  const hasFiltersWarnings = !getFiltersSideWarnings(state, { containerSide: 'A' }).isEmpty()
    || !getFiltersSideWarnings(state, { containerSide: 'B' }).isEmpty();

  const hasMappingWarnings = !getMappingSideWarnings(state, { containerSide: 'A' }).isEmpty()
    || !getMappingSideWarnings(state, { containerSide: 'B' }).isEmpty();

  return {
    immutableA: !!embedName && appHasDefaultSyncParameters(state, 'A'),
    immutableB: !!embedName && appHasDefaultSyncParameters(state, 'B'),
    areProviderIdentitiesLoaded: isLoadedProviderIdentities(state),
    pages,
    hasMappingWarnings,
    hasFiltersWarnings,
  };
};

const mapDispatchToProps = dispatch => ({
  addSync: (formData) => {
    dispatch(linkActions.addLink(formData));
  },
  trackAddSyncSteps: (action, tabIndex, createLinkSessionId) => {
    dispatch(linkActions.trackAddSyncSteps(action, tabIndex, createLinkSessionId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AddSyncContainer);



// WEBPACK FOOTER //
// ./src/containers/AddSyncContainer/AddSyncContainer.jsx