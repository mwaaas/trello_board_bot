import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { destroy } from 'redux-form';
import uuid from 'uuid';

import { NavTabs, OrgNeedsPayment, Title } from '../../components';
import {
  getDefaultParamContainerId,
  getDefaultParamProviderIdentityId,
  getEmbedName,
  organizationNeedsPayment,
} from '../../reducers';

import { containerActions, multisyncActions, trackingActions } from '../../actions';
import { trackingTypes } from '../../consts';
import {
  ChooseProjects,
  MapFields,
  Review,
  Content,
} from '.';


const PAGE_INDEX = 0;

class CreateMultisync extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  };

  state = {
    createMultisyncSessionId: uuid.v4(),
  };

  componentDidMount() {
    const action = this.props.orgNeedsPayment ? trackingTypes.FORM_ACTIONS.DENIED : trackingTypes.FORM_ACTIONS.START;
    this.trackEvent(action, PAGE_INDEX);
  }

  componentWillUnmount() {
    this.props.destroyForm();
    this.props.cleanUpCurrentMultisync();
    ['A', 'B'].forEach(containerSide => this.props.clearContainers(containerSide));
  }

  trackEvent = (action, page, payload) => {
    const { createMultisyncSessionId } = this.state;

    let eventName = '';
    if (page) {
      eventName = `USER_ADD_MULTISYNC_PAGE_${page}_${action}`;
    } else {
      eventName = `USER_ADD_MULTISYNC_${action}`;
    }
    this.props.trackAddMultisync(eventName, { trackingSessionId: createMultisyncSessionId, ...payload });
  }

  getActivePage = (location) => {
    const step = location.slice(location.lastIndexOf('/') + 1); // Getting the last part of URL

    switch (step) {
      case 'choose-projects':
        return 0;
      case 'map-fields':
        return 1;
      case 'review':
        return 2;
      default:
        return 0;
    }
  }

  getPageTitle = activePage => [
    'How do you want this Multi-sync to work?',
    'Which fields should be matched?',
    'Ready to start syncing?',
  ][activePage];

  render() {
    const {
      isEmbed,
      initialValues,
      location,
      match,
      orgNeedsPayment,
    } = this.props;
    const activePage = this.getActivePage(location.pathname);

    if (orgNeedsPayment) {
      return <OrgNeedsPayment isEmbed={ isEmbed } />;
    }

    return (
      <Content className="create-multisync-container container">
        <NavTabs
          activeTab={ activePage }
          className="multisync-container__navigation"
          tabNames={ [
            'Start with the basics',
            'Fine-tune your Multi-sync',
            'Check before launching',
          ] }
          isJustified={ true }
          tabStyle="pills"
        />

        <Title>
          { this.getPageTitle(activePage) }
        </Title>


        <Switch>
          <Route
            render={ props =>
              <ChooseProjects
                {...props}
                initialValues={ initialValues }
                trackEvent={ this.trackEvent }
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
              />
            }
            exact
            path={ `${match.url}/map-fields` }
          />
          <Route
            render={ props =>
              <Review
                {...props}
                trackEvent={ this.trackEvent }
              />
            }
            exact
            path={ `${match.url}/review` }
          />
          <Redirect from={ `${match.url}/` } to={ `${match.url}/choose-projects` } />
        </Switch>
      </Content>
    );
  }
}

const mapStateToProps = state => ({
  orgNeedsPayment: organizationNeedsPayment(state),
  isEmbed: !!getEmbedName(state),
  // This is for embed Trello url parameters
  initialValues: {
    root: {
      providerIdentityId: getDefaultParamProviderIdentityId(state, 'A'),
      containerId: getDefaultParamContainerId(state, 'A'),
    },
    filters: [],
  },
});

const mapDispatchToProps = dispatch => ({
  trackAddMultisync: (eventName, payload) => dispatch(trackingActions.trackEvent(eventName, payload)),
  cleanUpCurrentMultisync: () => dispatch(multisyncActions.cleanUpCurrentMultisync()),
  destroyForm: () => dispatch(destroy('multisyncForm')),
  clearContainers: containerSide => dispatch(containerActions.clearContainers(containerSide)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateMultisync);



// WEBPACK FOOTER //
// ./src/containers/Multisync/CreateMultisync.jsx