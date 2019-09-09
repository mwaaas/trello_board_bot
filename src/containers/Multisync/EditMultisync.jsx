import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { connect } from 'react-redux';
import { destroy, initialize } from 'redux-form';
import uuid from 'uuid';
import { Map } from 'immutable';

import { Loading, RoutedNavTabs, Title } from '../../components';
import { multisyncTypes, trackingTypes } from '../../consts';
import { containerActions, multisyncActions, trackingActions } from '../../actions';
import { getCurrentMultisync } from '../../reducers';

import {
  ChooseProjects,
  MapFields,
  Content,
} from '.';

class EditMultisync extends Component {
  static propTypes = {
    cleanUpCurrentMultisync: PropTypes.func.isRequired,
    clearContainers: PropTypes.func.isRequired,
    destroyForm: PropTypes.func.isRequired,
    fetchMultisync: PropTypes.func.isRequired,
    match: PropTypes.object,
    location: PropTypes.object.isRequired,
    multisync: PropTypes.instanceOf(Map).isRequired,
  };

  state = {
    editMultisyncSessionId: uuid.v4(),
    isLoaded: false,
  };

  componentDidMount() {
    this.trackEvent(trackingTypes.FORM_ACTIONS.START);
    this.fetchRessources();
  }

  componentWillUnmount() {
    this.props.destroyForm();
    this.props.cleanUpCurrentMultisync();
    ['A', 'B'].forEach(containerSide => this.props.clearContainers(containerSide));
  }

  trackEvent = (action, page, payload) => {
    const { editMultisyncSessionId } = this.state;

    let eventName = '';
    if (page) {
      eventName = `USER_EDIT_MULTISYNC_PAGE_${page}_${action}`;
    } else {
      eventName = `USER_EDIT_MULTISYNC_${action}`;
    }
    this.props.trackEditMultisync(eventName, { trackingSessionId: editMultisyncSessionId, ...payload });
  }

  fetchRessources = async () => {
    await this.props.fetchMultisync();
    this.setState({ isLoaded: true });
  }

  render() {
    const {
      match,
      multisync,
    } = this.props;

    if (!this.state.isLoaded) {
      return <Loading />;
    }

    const TAB_ROUTES = [
      {
        path: `${match.url}/choose-projects`,
        tabName: 'Overview',
      },
      {
        path: `${match.url}/map-fields`,
        tabName: 'Field Mapping',
      },
    ];

    return (
      <Content className="edit-multisync-container container">
        <Title>
          { multisync.get('name') }
        </Title>

        <RoutedNavTabs
          className="multisync-container__navigation"
          isJustified={ false }
          routes={ TAB_ROUTES }
          tabStyle='underline'
        />

        <Switch>
           <Route
            render={ props =>
              <ChooseProjects
                {...props}
                trackEvent={ this.trackEvent }
                isEdit
              />
            }
            exact
            path={ `${match.url}/choose-projects` }
          />
          <Route
            render={ props =>
              <MapFields
                {...props}
                trackEvent={ this.trackEvent }
                isEdit
              />
            }
            exact
            path={ `${match.url}/map-fields` }
          />
          <Redirect from={ `${match.url}/` } to={ `${match.url}/choose-projects` } />
        </Switch>
      </Content>
    );
  }
}

const mapStateToProps = state => ({
  multisync: getCurrentMultisync(state),
});

const mapDispatchToProps = (dispatch, { match }) => ({
  fetchMultisync: async () => {
    const { multisync, syncs } = await dispatch(multisyncActions.getMultisync(match.params.multisyncId));
    const { topology, root, leaves } = multisync;
    const leavesContainerSide = topology === multisyncTypes.TOPOLOGIES.SPLIT ? 'B' : 'A';
    const rootContainerSide = leavesContainerSide === 'A' ? 'B' : 'A';
    const { kind, field } = root.discriminantField;
    const type = 'whiteList';

    dispatch(initialize('multisyncForm', {
      multisyncId: multisync._id,
      multisyncName: multisync.name,
      topology,
      root: {
        providerIdentityId: root.providerIdentity._id,
        containerId: root.container.id,
        filter: {
          fieldId: field,
          kind,
          type,
          value: [type, kind, field].join('.'),
        },
      },
      leaves: {
        providerIdentityId: leaves.providerIdentity._id,
      },
      filters: syncs.map(sync => ({
        containerId: sync[leavesContainerSide].container.id,
        fieldValueId: sync.syncSettings[rootContainerSide][field].multisyncDiscriminant,
        syncDirection: sync.syncSettings[rootContainerSide].readOnly
          || sync.syncSettings[leavesContainerSide].readOnly ? 'oneWay' : 'twoWay',
        isAutoSync: sync.isAutoSync,
        existingSync: true,
        syncId: sync.id,
      })),
      fieldAssociationsHaveChanged: false,
    }));
  },
  trackEditMultisync: (eventName, payload) => dispatch(trackingActions.trackEvent(eventName, payload)),
  cleanUpCurrentMultisync: () => dispatch(multisyncActions.cleanUpCurrentMultisync()),
  destroyForm: () => dispatch(destroy('multisyncForm')),
  clearContainers: containerSide => dispatch(containerActions.clearContainers(containerSide)),
});

export default connect(mapStateToProps, mapDispatchToProps)(EditMultisync);



// WEBPACK FOOTER //
// ./src/containers/Multisync/EditMultisync.jsx