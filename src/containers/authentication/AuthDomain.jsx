import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Map } from 'immutable';

import { color } from '../../theme';
import {
  Card,
  Href,
  TextInput,
  Title,
} from '../../components';

export const status = {
  NOT_TESTED: 'untested',
  FAILED_TEST: 'failed',
  SUCCESS_TEST: 'success',
};

class AuthDomain extends Component {
  static propTypes = {
    hasError: PropTypes.bool.isRequired,
    isTested: PropTypes.bool.isRequired,
    match: PropTypes.object,
    provider: PropTypes.instanceOf(Map),
  };

  state = {
    configure: false,
    hasTestFailed: null,
  };

  getIconProps = () => {
    const { isTested, hasError } = this.props;
    if (!isTested) {
      return;
    }

    if (hasError) {
      return {
        name: 'exclamation-circle',
        color: color.brand.errorLight,
      };
    }

    return {
      name: 'check-circle',
      color: color.brand.success,
    };
  }

  render() {
    const { provider, hasError, isTested } = this.props;

    return (
      <div className="auth-domain">
        <Field
          name="domainUrl"
          component={TextInput}
          props={{
            disabled: isTested && !hasError,
            iconProps: this.getIconProps(),
            label: <Title type="h3">{provider.get('displayName')} URL</Title>,
            subLabel: `Enter your complete ${provider.get('displayName')} URL below.`,
          }}
        />
        {hasError && (
          <Card color={color.brand.errorLight} padding="1rem">
            <strong>Uh-oh! We couldn’t reach your {provider.get('displayName')}!</strong>
            <br />
            It looks like the URL you provided is incorrect. Make sure that you entered it correctly, or find out
            more from the{' '}
            <Href href="https://guide.unito.io/hc/en-us/articles/360026615653-Unreachable-Domain-Error">
              troubleshooting article
            </Href>{' '}
            in the Unito Guide.
          </Card>
        )}
      </div>
    );
  }
}

export default AuthDomain;



// WEBPACK FOOTER //
// ./src/containers/authentication/AuthDomain.jsx