import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, FormSection } from 'redux-form';
import { Map } from 'immutable';

import { Card, Section, Title } from '../../components';
import { PcdOption } from '../../containers';
import { getProviderCapabilitiesMergeableOptions } from '../../reducers';
import { color } from '../../theme';


class CommonOptions extends Component {
  static propTypes = {
    pcdOptionsMergeable: PropTypes.instanceOf(Map).isRequired,
  };

  render() {
    const { pcdOptionsMergeable } = this.props;

    if (pcdOptionsMergeable.isEmpty()) {
      return null;
    }

    return (
      <FormSection name="A.tweaks">
        <Section>
          <Title type="h3">Common options</Title>
          <Card borderless color={ color.dark.quiet }>
            <div className="row">
              <div className="col-xs-6 col-xs-offset-3">
                {
                  pcdOptionsMergeable.map((pcdOption, optionName) => (
                    <Section key={ optionName }>
                      <Field
                        component={ PcdOption }
                        name={ optionName }
                        props={{
                          containerSide: 'A',
                          name: optionName,
                          option: pcdOption,
                        }}
                      />
                    </Section>
                  )).toArray()
                }
              </div>
            </div>
          </Card>
        </Section>
      </FormSection>
    );
  }
}

const mapStateToProps = state => ({
  pcdOptionsMergeable: getProviderCapabilitiesMergeableOptions(state),
});

export default connect(mapStateToProps)(CommonOptions);



// WEBPACK FOOTER //
// ./src/containers/MoreOptionsForm/CommonOptions.jsx