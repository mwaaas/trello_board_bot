import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addNotification as notify } from 'reapop';

import {
  Button,
  Icon,
  Modal,
  SearchBox,
} from '../../components';
import {
  linkActions,
  multisyncActions,
  appActions,
} from '../../actions';
import { appIsInMaintenance } from '../../reducers';


class SiteAdminContainer extends Component {
  static propTypes = {
    disableMaintenance: PropTypes.func.isRequired,
    enableMaintenance: PropTypes.func.isRequired,
    getMaintenanceState: PropTypes.func.isRequired,
    isMaintenanceMode: PropTypes.bool.isRequired,
    searchLinks: PropTypes.func.isRequired,
    showInvalidSearch: PropTypes.func.isRequired,
    onResetSearch: PropTypes.func.isRequired,
  };

  state = {
    searchString: '',
    showMaintenanceModal: false,
  };

  componentDidMount() {
    this.props.getMaintenanceState();
  }

  onChangeFilterLinkList = (event) => {
    this.setState({ searchString: event.target.value });
  };

  onSearchLinks = () => {
    const sanitizedSearch = this.state.searchString.trim();
    if (sanitizedSearch.split(',').every(elem => !!elem.match(/^[0-9a-fA-F]{24}$/))) {
      this.props.searchLinks(sanitizedSearch);
    } else {
      this.props.showInvalidSearch();
    }
  };

  onMaintenanceLink = () => {
    if (this.props.isMaintenanceMode) {
      this.props.disableMaintenance();
    } else {
      this.setState({ showMaintenanceModal: true });
    }
  };

  closeMaintenanceModal = () => {
    this.setState({ showMaintenanceModal: false });
  };

  startMaintenance = () => {
    this.props.enableMaintenance();
    this.closeMaintenanceModal();
  };

  render() {
    const {
      isMaintenanceMode,
    } = this.props;
    const { showMaintenanceModal } = this.state;

    return (
      <div className="site-admin">
        <Modal
          isOpen={ showMaintenanceModal }
          onRequestClose={ this.closeMaintenanceModal }
          title="Start maintenance mode?"
          onCancel={ this.closeMaintenanceModal }
          onConfirm={ this.startMaintenance }
          cancelLabel="No"
          confirmLabel="Yes"
        />

        <div className="site-admin__maintenance">
          <Button
            className="btn btn-warning btn-md pull-right"
            onClick={ this.onMaintenanceLink }
          >
            { isMaintenanceMode
              ? <span>
                <Icon name="exclamation-triangle" /> End maintenance
              </span>
              : 'Start Maintenance' }
          </Button>
        </div>

        <div className="site-admin__search">
          <SearchBox
            placeholder="Search links by LinkId, OrganizationId, MultisyncId or UserId. Separate multiple searches with commas."
            onChange={ this.onChangeFilterLinkList }
            onPressEnter={ this.onSearchLinks }
          >
            <Button
              btnStyle="secondary"
              onClick={ this.onSearchLinks }
            >
              Search
            </Button>
            <Button
              btnStyle="error"
              onClick={ this.props.onResetSearch }
            >
              Reset
            </Button>
          </SearchBox>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isMaintenanceMode: appIsInMaintenance(state),
});

const mapDispatchToProps = dispatch => ({
  disableMaintenance: () => {
    dispatch(appActions.disableMaintenance());
  },
  enableMaintenance: () => {
    dispatch(appActions.enableMaintenance());
  },
  getMaintenanceState: () => {
    dispatch(appActions.isMaintenanceEnabled());
  },
  searchLinks: (searchString) => {
    dispatch(linkActions.searchLinks(searchString));
    dispatch(multisyncActions.searchMultisyncs(searchString));
  },
  onResetSearch: () => {
    dispatch(linkActions.getLinks());
    dispatch(multisyncActions.getMultisyncs());
  },
  showInvalidSearch: () => {
    dispatch(notify({
      title: 'Invalid search',
      message: 'Make sure to enter valid "Link Id", "Organization Id", "Multi-sync Id" or "User Id". Separate multiple searches with commas.',
      status: 'error',
      position: 'tc',
      closeButton: true,
    }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SiteAdminContainer);



// WEBPACK FOOTER //
// ./src/containers/SiteAdminContainer/SiteAdminContainer.jsx