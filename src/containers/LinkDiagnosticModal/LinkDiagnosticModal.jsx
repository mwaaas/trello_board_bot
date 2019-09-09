import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Map } from 'immutable';
import ReactJson from 'react-json-view';
import { addNotification as notify } from 'reapop';

import { containerActions, fieldActions, linkActions } from '../../actions';
import { linkTypes, routes } from '../../consts';

import {
  Button, Card, Href, Icon, Section, Title,
} from '../../components';
import { color } from '../../theme';
import {
  getLatestDiagnostic,
  isDiagnosticLoading,
  getCustomFields,
  getProviderCapabilitiesByProviderName,
  getContainerPlugins,
} from '../../reducers';
import Modal from '../../components/Modal/Modal';

const basicFunctions = [
  { label: 'Columns', name: 'getColumns' },
  { label: 'Container by Id', name: 'getContainerById' },
  { label: 'Custom Fields', name: 'getCustomFields' },
  { label: 'Labels', name: 'getLabels' },
  { label: 'Statuses', name: 'getStatuses' },
  { label: 'Task Types', name: 'getTaskTypes' },
  { label: 'Users', name: 'getUsers' },
  { label: 'Workflows', name: 'getWorkflows' },
  { label: 'Task Ids', name: 'getTaskIds', filter: false },
  { label: 'Filtered in Task Ids', name: 'getTaskIds', filter: true },
  { label: 'Tasks', name: 'getTasks', filter: false },
  { label: 'Filtered in Tasks', name: 'getTasks', filter: true },
  { label: 'Subtasks', name: 'getSubtasks' },
  { label: 'Task by Id', name: 'getTask', argCount: 1 },
  { label: 'Task by URL', name: 'getTaskByUrl', argCount: 1 },
  { label: 'Task History', name: 'getTaskEvents', argCount: 1 },
];

const StyledModal = styled(Modal)`
  width: 90%;
  height: 90%;
`;

const Params = styled.input`
  background: none;
  border: none;
  border-bottom: 2px solid #2ec16b;
  margin-top: 10px;
  padding: 2px 5px;
  width: 100%
`;

class LinkDiagnosticModal extends Component {
  static propTypes = {
    isLoading: PropTypes.bool,
    isOpen: PropTypes.bool.isRequired,
    sync: PropTypes.instanceOf(Map).isRequired,
    onRequestClose: PropTypes.func.isRequired,
    customFields: PropTypes.instanceOf(Map),
  };

  state = {
    Aarg: '',
    Barg: '',
    resyncFieldsA: [],
    resyncFieldsB: [],
  };

  componentDidMount() {
    this.props.fetchResources();
  }

  onClose = () => {
    const { onRequestClose, resetDiagnostic } = this.props;
    resetDiagnostic();
    onRequestClose();
  };

  render() {
    const {
      automapUsers,
      callConnectorFn,
      customFields,
      isLoading,
      isOpen,
      latestResult = {},
      pcdFields,
      plugins,
      sync,
      resyncLink,
    } = this.props;

    const basicFields = ['title', 'description'];

    return (
      <StyledModal
        displayCloseButton
        isOpen={ isOpen }
        onRequestClose={ this.onClose }
        type="plainModal"
        size="lg"
      >
        <Section style={{ marginBottom: '24px' }}>
          <Card borderless color={ color.dark.quiet } padding='1em'>
            <Title type="h2">
              Diagnose <Href to={ `${routes.ABSOLUTE_PATHS.EDIT_LINK}/${sync.get('_id')}` }>{ sync.get('name') }</Href>
            </Title>

            <div className="btn-toolbar">
              <div style={{ float: 'left', marginRight: '10px' }}>
                <strong>linkId:</strong>{ sync.get('_id') }

                <strong style={{ marginLeft: '13px' }}> userId:</strong>
                { sync.getIn(['user', '_id']) } ({ sync.getIn(['user', 'email']) })

                <strong style={{ marginLeft: '13px' }}> organizationId:</strong>{ sync.get('organization') }
              </div>
              <Button
                type="button"
                size="xs"
                btnStyle="error"
                onClick={ () => { resyncLink(); } }
                disabled={ sync.get('syncState') === linkTypes.LINK_SYNC_STATES.SYNCING }
                reverse
              >
                Trigger a resync
              </Button>

              <Button
                type="button"
                size="xs"
                btnStyle="error"
                onClick={ automapUsers }
                reverse
              >
                Automap Users
              </Button>
            </div>
          </Card>
        </Section>
        <Section>
          <div className="row">
            {
              ['A', 'B'].map(side => (
                <div key={ side } className="col-xs-6">
                  <Card borderless color={ color.dark.quiet } padding='1em'>
                    <Title type="h3">
                      Connector infos
                    </Title>
                    <p><strong>
                      { side } - { sync.getIn([side, 'providerName']) }{' - '}
                      { sync.getIn([side, 'container', 'url']) ? (
                          <a target="_blank" href={sync.getIn([side, 'container', 'url'])}>
                            { sync.getIn([side, 'container', 'id']) }
                          </a>
                      ) : (
                        sync.getIn([side, 'container', 'id'])
                      )
                      }
                    </strong>
                    <br/>providerIdentityId: { sync.getIn([side, 'providerIdentity', '_id']) }

                    { (sync.getIn([side, 'providerName']) === 'trello' && plugins.get(side).size > 0)
                     && <span><br/>⚠ Power-ups:{' '}
                          {
                            plugins.get(side).map(plugin =>
                              <a target="_blank"
                                key={plugin.get('id')}
                                href={`https://trello.com/power-ups/${plugin.get('id')}`}>
                                { plugin.get('name') || plugin.get('id') }
                              </a>).reduce((prev, curr) => [prev, ', ', curr])
                          }
                        </span>
                    }
                    </p>

                    <Title type="h3">
                      Fetch from Connector
                    </Title>
                    <div className="btn-toolbar">
                      {
                        basicFunctions.map(func => (
                          <Button
                            style={ { marginBottom: '5px' } }
                            key={ func.label }
                            type="button"
                            size="xs"
                            reverse
                            onClick={ callConnectorFn(side, func, this.state[`${side}arg`])}
                          >
                            { func.label }
                          </Button>
                        ))
                      }
                    <Params
                      type="text"
                      style={ { marginBottom: '10px' } }
                      placeholder="Call parameters (if necessary)"
                      onChange={ (e) => {
                        const stateChange = {};
                        stateChange[`${side}arg`] = e.target.value;
                        this.setState(stateChange);
                      } }
                    />
                    </div>

                    <Title type="h3">
                      Force resync fields
                    </Title>
                    <div className="btn-toolbar">
                      {
                        basicFields.map(fieldName => (
                          <Button
                            style={ { marginBottom: '5px' } }
                            key={ fieldName }
                            type="button"
                            size="xs"
                            reverse
                            btnStyle="dark"
                            onClick={ () => {
                              const stateChange = {};
                              stateChange[`resyncFields${side}`] = this.state[`resyncFields${side}`].concat([{
                                id: fieldName,
                                kind: 'native',
                              }]);
                              this.setState(stateChange);
                            } }
                          >
                            { fieldName }
                          </Button>
                        ))
                      }
                      {
                        pcdFields.get(side, Map()).map((field, key) => (
                          <Button
                            style={ { marginBottom: '5px' } }
                            key={ key }
                            type="button"
                            size="xs"
                            reverse
                            btnStyle="dark"
                            onClick={ () => {
                              const stateChange = {};
                              stateChange[`resyncFields${side}`] = this.state[`resyncFields${side}`].concat([{
                                id: key,
                                kind: 'native',
                              }]);
                              this.setState(stateChange);
                            } }
                          >
                            { key }
                          </Button>
                        )).toArray()
                      }
                      {
                        customFields.get(side, Map()).map(field => (
                          <Button
                            style={ { marginBottom: '5px' } }
                            key={ field.get('id') }
                            type="button"
                            size="xs"
                            reverse
                            btnStyle="secondary"
                            onClick={ () => {
                              this.setState({
                                [`resyncFields${side}`]: this.state[`resyncFields${side}`].concat([{
                                  id: field.get('id'),
                                  kind: 'custom',
                                }]),
                              });
                            } }
                          >
                            { `${field.get('name')} (${field.get('id')})` }
                          </Button>
                        )).toArray()
                      }
                    </div>

                    <div className="btn-toolbar">
                      <div>We will resync these fields: { this.state[`resyncFields${side}`].map(f => f.id).join(', ')}</div>
                    </div>

                    <div className="btn-toolbar">
                      <Button
                        size="md"
                        reverse
                        disabled={ this.state[`resyncFields${side}`].length === 0 }
                        onClick={ () => {
                          resyncLink(this.state[`resyncFields${side}`], side);
                          this.setState({
                            [`resyncFields${side}`]: [],
                          });
                        } }
                      >Start resync</Button>

                      <Button
                        size="md"
                        reverse
                        disabled={ this.state[`resyncFields${side}`].length === 0 }
                        onClick={ () => {
                          this.setState({
                            [`resyncFields${side}`]: [],
                          });
                        } }
                      >Clear fields</Button>
                    </div>

                  </Card>
                </div>
              ))
            }
          </div>
        </Section>

        <Section>
          {
            isLoading && (
                <Card>
                <div className="text-center">
                  <Icon name="spinner" className="fa-spin fa-5x" />
                </div>
              </Card>
            )
          }
       </Section>

        <Section>
          <div className="row">
            {
              ['A', 'B'].map(side => (
                <div key={ side } className="col-xs-6">
                  <Card borderless color={ color.dark.quiet } padding='1em'>
                    {
                      latestResult[side] && <ReactJson
                        src={ latestResult[side] }
                        displayDataTypes={ false }
                      />
                    }
                  </Card>
                </div>
              ))
            }
          </div>
        </Section>

      </StyledModal>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  isLoading: isDiagnosticLoading(state),
  latestResult: getLatestDiagnostic(state),
  customFields: getCustomFields(state),
  pcdFields: Map({
    A: getProviderCapabilitiesByProviderName(state, ownProps.sync.getIn(['A', 'providerName']), 'fields'),
    B: getProviderCapabilitiesByProviderName(state, ownProps.sync.getIn(['B', 'providerName']), 'fields'),
  }),
  plugins: Map({
    A: getContainerPlugins(state, ownProps.sync.getIn(['A', 'container', 'id'])),
    B: getContainerPlugins(state, ownProps.sync.getIn(['B', 'container', 'id'])),
  }),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchResources: () => {
    ['A', 'B'].forEach((containerSide) => {
      const containerId = ownProps.sync.getIn([containerSide, 'container', 'id']);
      const providerIdentityId = ownProps.sync.getIn([containerSide, 'providerIdentity', '_id']);
      dispatch(fieldActions.getCustomFields({
        containerId,
        containerSide,
        providerIdentityId,
      }));

      const providerName = ownProps.sync.getIn([containerSide, 'providerName']);
      if (providerName === 'trello') {
        dispatch(containerActions.getContainerPlugins({
          containerId,
          providerIdentityId,
        }));
      }
    });
  },
  automapUsers: () => {
    dispatch(linkActions.automapUsers(ownProps.sync.get('_id')));
  },
  callConnectorFn: (side, { name, filter, argCount }, arg) => () => {
    // Convenience: strip starting/trailing double-quotes that you get when you copy from the JSONView
    const sanitizedArg = (arg.startsWith('"') && arg.endsWith('"')) ? arg.slice(1, -1).trim() : arg.trim();
    if (argCount && !sanitizedArg) {
      return;
    }
    dispatch(linkActions.callConnectorFn(ownProps.sync.get('_id'), side, name, filter, sanitizedArg));
  },
  resetDiagnostic: () => {
    dispatch(linkActions.resetDiagnostic());
  },
  resyncLink: (forcedFields, forcedSide) => {
    dispatch(linkActions.syncLink(ownProps.sync.get('_id'), true, forcedFields, forcedSide));
    dispatch(notify({
      title: 'Syncing...',
      message: 'Hang tight while your sync refreshes. This may take a couple of minutes',
      status: 'success',
      position: 'tr',
      closeButton: true,
    }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(LinkDiagnosticModal);



// WEBPACK FOOTER //
// ./src/containers/LinkDiagnosticModal/LinkDiagnosticModal.jsx