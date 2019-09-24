import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { formValueSelector, Field } from 'redux-form';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';

import {
  Button,
  Collapse,
  Icon,
  Section,
  TextAreaInput,
  TextInput,
  Title,
} from '../../components';
import { AuthorizationMethods } from '.';


class AuthConfigure extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    provider: PropTypes.instanceOf(Map).isRequired,
    requiresSetup: PropTypes.bool,
    visibleAuthorizationMethods: PropTypes.instanceOf(Map).isRequired,
  };

  state = {
    isOpenConnectionParams: false,
  };

  getConnectionParameters = () => {
    const { provider } = this.props;
    return provider.getIn(['capabilities', 'authentication', 'connectionParameters'], Map());
  };

  render() {
    const {
      visibleAuthorizationMethods,
      domainUrl,
      match,
      provider,
      requiresSetup,
    } = this.props;
    const connectionParameters = this.getConnectionParameters();

    if (!domainUrl) {
      return <Redirect to={ match.url.substring(0, match.url.lastIndexOf('/')) } />;
    }

    return (
      <div className="auth-configure">
        {
          !connectionParameters.isEmpty() && (
            <Section>
              <Title type="h3">
                Advanced settings
                <Button
                  style={{ paddingLeft: 0, paddingRight: 0 }}
                  btnStyle="subtleLink"
                  onClick={ () => this.setState(state => ({ isOpenConnectionParams: !state.isOpenConnectionParams })) }
                  pullRight
                >
                  <Icon name="chevron-circle-down" />
                </Button>
              </Title>
              <p style={{ marginBottom: '2rem' }}>
                { connectionParameters.get('helpText') }
              </p>

              <Collapse isCollapsed={ !this.state.isOpenConnectionParams }>
                {
                  connectionParameters.get('fields', Map()).map((field, name) => (
                    <Field
                      key={name}
                      name={name}
                      component={ field.get('type') === 'text' ? TextInput : TextAreaInput }
                      props={{
                        label: <Title type="h4">{field.get('label')}</Title>,
                        subLabel: field.get('helpText'),
                        placeholder: field.get('placeholder'),
                      }}
                    />
                  )).toArray()
                }
              </Collapse>
              <hr />
            </Section>
          )
        }
        {
          !visibleAuthorizationMethods.isEmpty() && (
            <Field
              name="authorizationMethod"
              component={AuthorizationMethods}
              props={{
                requiresSetup,
                authorizationMethods: visibleAuthorizationMethods,
                provider,
                domainUrl,
              }}
            />
          )
        }
      </div>
    );
  }
}

const formSelector = formValueSelector('authentication');

const mapStateToProps = state => ({
  domainUrl: formSelector(state, 'domainUrl'),
});

export default connect(mapStateToProps)(AuthConfigure);



// WEBPACK FOOTER //
// ./src/containers/authentication/AuthConfigure.jsx