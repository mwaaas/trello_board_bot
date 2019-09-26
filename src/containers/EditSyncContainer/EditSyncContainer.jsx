import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import qs from 'qs';
import styled from 'styled-components';

import { linkActions, multisyncActions } from '../../actions';
import {
  getCurrentLinkErrors,
  getCurrentLinkName,
  getCurrentLinkState,
  getCurrentLinkKind,
  getFiltersSideWarnings,
  getMappingSideWarnings,
  isCurrentSyncLoaded,
  isSavingSync,
} from '../../reducers';
import { Loading, NavTabs } from '../../components';
import {
  AppsSyncForm,
  EditSyncNameForm,
  FiltersSyncForm,
  LinkErrorsContainer,
  MappingForm,
  MoreOptionsForm,
  SyncFormConfirmationModal,
  SyncStatusForm,
} from '../../containers';
import { linkTypes } from '../../consts';
import syncContainerHoC from '../SyncContainerHoC/SyncContainerHoC';
import './EditSyncContainer.scss';


const Navigation = styled.div`
  margin-bottom: 4rem;
  margin-top: 2rem;
`;

const Content = styled.div`
  background: white;
  min-height: calc(100vh - 66px);
  padding: 4em 6em;
`;

const TABS_SYNC = {
  overviewPage: 'Overview',
  projectsPage: 'Projects',
  filtersPage: 'Filter tasks',
  mapFieldsPage: 'Map fields',
  optionsPage: 'More options',
};
const TABS_CARDSYNC = {
  overviewPage: 'Overview',
  projectsPage: 'Boards',
  mapFieldsPage: 'Map fields',
  optionsPage: 'More options',
};



class EditSyncContainer extends Component {
  static propTypes = {
    fetchResources: PropTypes.func.isRequired,
    hasWarnings: PropTypes.bool,
    isLoaded: PropTypes.bool.isRequired,
    linkErrors: PropTypes.instanceOf(Map),
    linkName: PropTypes.string,
    linkKind: PropTypes.string,
    linkState: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
  };

  state = {
    activePage: 'overviewPage',
    showModal: false,
    pages: {},
  };

  componentDidMount() {
    this.props.fetchResources();
    const { customizing } = qs.parse(this.props.location.search.substring(1));
    this.setState({
      // When customizing, automatically navigate to the the mapping tab !
      activePage: customizing === 'true' ? 'mapFieldsPage' : 'overviewPage',
    });
  }

  componentDidUpdate(previousProps) {
    if (previousProps.linkKind !== this.props.linkKind) {
      this.setState({ pages: this.props.linkKind === linkTypes.KIND.TASK_SYNC ? TABS_CARDSYNC : TABS_SYNC });
    }
  }

  componentWillUnmount() {
    this.props.clearCurrentMultisync();
  }

  changePage = (newPage) => {
    const { pages } = this.state;
    const pageKey = Object.keys(pages)[newPage];
    this.setState({ activePage: pageKey });
  }

  showModal = () => {
    this.setState({ showModal: true });
  }

  hideModal = () => {
    this.setState({ showModal: false });
  }

  handleSubmit = (formProps) => {
    const { hasWarnings, onSubmit } = this.props;

    if (hasWarnings) {
      this.showModal();
      return;
    }

    onSubmit(formProps);
  }

  render() {
    const {
      isLoaded,
      linkErrors,
      linkName,
      linkKind,
      match,
      onCancel,
      onSubmit,
      savingSync,
    } = this.props;
    const { activePage, showModal } = this.state;
    const { pages } = this.state;

    if (!isLoaded || savingSync) {
      return <Loading />;
    }

    const errorsCount = linkErrors.get('identities').size + linkErrors.get('containers').size;

    return (
      <Content className="edit-sync-container container">
        {
          errorsCount > 0 ? (
            <LinkErrorsContainer
              linkErrors={ linkErrors }
              linkName={ linkName }
              linkId={ match.params.linkId }
            />
          ) : (
            <div className="edit-sync-container">
              <EditSyncNameForm />
              <Navigation>
                <NavTabs
                  activeTab={ Object.keys(this.state.pages).indexOf(activePage) }
                  isJustified
                  tabNames={ Object.values(pages) }
                  tabStyle="pills"
                  onTabClick={ this.changePage }
                />
              </Navigation>
              <div className="sync-container__form">
                {
                  activePage === 'overviewPage' && (
                    <SyncStatusForm
                      onCancel={ onCancel }
                      onSubmit={ this.handleSubmit }
                    />
                  )
                }
                {
                  activePage === 'projectsPage' && (
                    <AppsSyncForm
                      immutableA
                      immutableB
                      isEdit
                      onCancel={ onCancel }
                      onSubmit={ this.handleSubmit }
                      linkKind={ linkKind }
                    />
                  )
                }
                {
                  activePage === 'filtersPage' && (
                    <FiltersSyncForm
                      isEdit
                      onCancel={ onCancel }
                      onSubmit={ this.handleSubmit }
                    />
                  )
                }
                {
                  activePage === 'mapFieldsPage' && (
                    <MappingForm
                      isEdit
                      onCancel={ onCancel }
                      onSubmit={ this.handleSubmit }
                    />
                  )
                }
                {
                  activePage === 'optionsPage' && (
                    <MoreOptionsForm
                      onCancel={ onCancel }
                      onSubmit={ this.handleSubmit }
                    />
                  )
                }
              </div>
            </div>
          )
        }

        <SyncFormConfirmationModal
          isOpen={ showModal }
          isEdit
          onRequestClose={ this.hideModal }
          onSubmit={ onSubmit }
        />

      </Content>
    );
  }
}
EditSyncContainer = syncContainerHoC(EditSyncContainer);

const mapStateToProps = (state) => {
  const hasWarnings = !getFiltersSideWarnings(state, { containerSide: 'A', isEdit: true }).isEmpty()
    || !getFiltersSideWarnings(state, { containerSide: 'B', isEdit: true }).isEmpty()
    || !getMappingSideWarnings(state, { containerSide: 'A' }).isEmpty()
    || !getMappingSideWarnings(state, { containerSide: 'B' }).isEmpty();

  return {
    isLoaded: isCurrentSyncLoaded(state),
    savingSync: isSavingSync(state),
    linkErrors: getCurrentLinkErrors(state),
    linkName: getCurrentLinkName(state),
    linkState: getCurrentLinkState(state),
    linkKind: getCurrentLinkKind(state),
    hasWarnings,
  };
};

const mapDispatchToProps = (dispatch, {
  match,
  location,
}) => ({
  onSubmit: formData => dispatch(linkActions.saveLink(match.params.linkId, formData)),
  fetchResources: async () => {
    const { isAutoSync } = qs.parse(location.search.substring(1));
    const { link } = await dispatch(linkActions.getLink(match.params.linkId, isAutoSync === 'true'));
    if (link.multisync) {
      dispatch(multisyncActions.getMultisync(link.multisync));
    }
  },
  clearCurrentMultisync: () => dispatch(multisyncActions.cleanUpCurrentMultisync()),
});

export default connect(mapStateToProps, mapDispatchToProps)(EditSyncContainer);



// WEBPACK FOOTER //
// ./src/containers/EditSyncContainer/EditSyncContainer.jsx