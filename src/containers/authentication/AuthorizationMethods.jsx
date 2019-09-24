import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

import {
  Button,
  Card,
  Href,
  RadioButton,
  RadioButtonGroup,
  Section,
  Title,
} from '../../components';
import { flagTypes } from '../../consts';
import { OpenIntercomBubble } from '../../containers';
import { color } from '../../theme';


class AuthorizationMethods extends Component {
  static propTypes = {
    authorizationMethods: PropTypes.instanceOf(Map).isRequired,
    domainUrl: PropTypes.string,
    input: PropTypes.object.isRequired,
    provider: PropTypes.instanceOf(Map).isRequired,
    requiresSetup: PropTypes.bool,
  };

  getConfigureUrl = () => {
    const { authorizationMethods, domainUrl, input } = this.props;
    const configureUrl = authorizationMethods
      .getIn([input.value, 'instructions', 'configureUrl'])
      .replace('${domain}', domainUrl); // eslint-disable-line
    return configureUrl;
  };

  getInstructions = () => {
    const { input, authorizationMethods } = this.props;
    return authorizationMethods.getIn([input.value, 'instructions']);
  };

  render() {
    const {
      input,
      meta,
      authorizationMethods,
      provider,
      requiresSetup,
    } = this.props;
    const instructions = this.getInstructions();

    return (
      <div>
        <Section>
          <Title type="h3">Authorization method</Title>
          <RadioButtonGroup {...input} selectedValue={input.value}>
            {authorizationMethods
              .map((authMethod, authMethodName) => (
                <RadioButton
                  key={authMethodName}
                  label={<Title type="h4">{authMethod.get('label')}</Title>}
                  value={authMethodName}
                  subLabel={authMethod.get('helpText')}
                />
              ))
              .toArray()}
          </RadioButtonGroup>
        </Section>
        {requiresSetup && instructions && (
          <Card color={color.dark.quiet} borderless padding="2rem 3rem">
            <Title type="h3">
              {instructions.get('label')} <small>(required)</small>
            </Title>
            <p>
              {instructions.get('helpText')}
              You can find the steps in{' '}
              <Href href={instructions.get('helpTextUrl', 'https://guide.unito.io/hc/en-us/articles/224417348')}>
                this article
              </Href>
              .
            </p>
            <Button btnStyle="primary" type="href" href={this.getConfigureUrl()}>
              Configure my {provider.get('displayName')}
            </Button>
          </Card>
        )}
        {meta.error && (
          <Card color={color.brand.errorLight} padding="1rem" style={{ marginTop: '1rem' }}>
            {meta.error} <br />
            Need help configuring {provider.get('displayName')}?{' '}
            <OpenIntercomBubble flagType={flagTypes.TYPES.COHORT}>Get in touch with our team</OpenIntercomBubble>
          </Card>
        )}
      </div>
    );
  }
}

export default AuthorizationMethods;



// WEBPACK FOOTER //
// ./src/containers/authentication/AuthorizationMethods.jsx