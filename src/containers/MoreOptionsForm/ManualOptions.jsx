import React, { Component } from 'react';
import { Field } from 'redux-form';
import { color } from '../../theme';

import { Card, TextAreaInput, Title } from '../../components';
import { OpenIntercomBubble } from '../../containers';


export default class ManualOptions extends Component {
  render() {
    return (
      <div className="manual-options">
        <Title type="h3">Manual Settings</Title>
        <Card borderless color={ color.dark.quiet }>
          <div className="row">
            <div className="col-xs-5">
              <p>Manual settings are used for new features that are not available from the User Interface.</p>
              <p>
                Want to know our hidden features or request a new one?<br/>
                <a href="mailto:happiness@unito.io">Email us.</a>
              </p>
            </div>
            <div className="col-xs-7">
              <Field
                component={ TextAreaInput }
                name="manualOptions"
                props={{
                  className: 'form-control--monospace',
                  rows: 6,
                  placeholder: '{ "format": "JSON" }',
                  helpText: <OpenIntercomBubble>Get help</OpenIntercomBubble>,
                }}
              />
            </div>
          </div>
        </Card>
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/containers/MoreOptionsForm/ManualOptions.jsx