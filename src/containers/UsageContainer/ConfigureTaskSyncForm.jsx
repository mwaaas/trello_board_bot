import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Field, reduxForm } from 'redux-form';
import styled from 'styled-components';

import { Button, Icon } from '../../components';
import {
  ProviderIdentitiesSelect,
  WorkspacesSelect,
} from '../../containers';


const MarginBottom = styled.div`
  margin-bottom: 3rem;
`;

export default class ConfigureTaskSyncForm extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    provider: PropTypes.instanceOf(Map).isRequired,
  };

  state = {
    providerIdentityId: null,
  };

  render() {
    const { handleSubmit, provider, onCancel } = this.props;
    const containerSide = 'configureTaskSync';
    const { providerIdentityId } = this.state;

    return (
      <form onSubmit={handleSubmit}>
        <MarginBottom>
          <Field
            component={ProviderIdentitiesSelect}
            name="providerIdentityId"
            onChanged={value => this.setState({ providerIdentityId: value })}
            props={{
              containerSide,
              provider,
              label: `Select the ${provider.get('displayName')} connector for your team`,
            }}
          />
          <Field
            component={WorkspacesSelect}
            name="workspaceId"
            props={{
              disabled: !providerIdentityId,
              containerSide,
              providerIdentityId,
              label: 'Select your team',
              workspaceIdsToDisable: ['PersonalBoards'],
              simpleValue: false,
            }}
          />
        </MarginBottom>
        <div className="alert alert-warning">
          <p>
            <Icon name="info-circle" /> You won’t be able to change the team associated with Mirror in the future
          </p>
        </div>
        <Button btnStyle="purple" type="submit" onSubmit={handleSubmit} pullRight>
          Validate Team
        </Button>
        <Button btnStyle="link" pullRight onClick={ onCancel }>
          Cancel
        </Button>
      </form>
    );
  }
}
ConfigureTaskSyncForm = reduxForm({
  form: 'configureTaskSyncForm',
  validate: (values) => {
    const errors = {};
    if (!values.providerIdentityId) {
      errors.providerIdentityId = 'Required';
    }

    if (!values.workspaceId) {
      errors.workspaceId = 'Required';
    }

    return errors;
  },
})(ConfigureTaskSyncForm);


// WEBPACK FOOTER //
// ./src/containers/UsageContainer/ConfigureTaskSyncForm.jsx