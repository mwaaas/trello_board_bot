import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, FormSection } from 'redux-form';
import { Map } from 'immutable';

import { Card, Section, Title } from '../../components';
import { PcdOption } from '../../containers';
import { getProviderCapabilitiesOptions } from '../../reducers';
import { color } from '../../theme';


class Tweaks extends Component {
  static propTypes = {
    pcdOptionsA: PropTypes.instanceOf(Map).isRequired,
    pcdOptionsB: PropTypes.instanceOf(Map).isRequired,
  };

  render() {
    const { pcdOptionsA, pcdOptionsB } = this.props;

    if (pcdOptionsA.isEmpty() && pcdOptionsB.isEmpty()) {
      return null;
    }

    return (
      <Section>
        <Title type="h3">Tool options</Title>
        <div className="row">
          {
            ['A', 'B'].map((containerSide) => {
              const pcdOptions = this.props[`pcdOptions${containerSide}`];
              return (
                <FormSection name={ `${containerSide}.tweaks` } key={ containerSide }>
                  <div className="col-xs-6">
                    <Card borderless color={ color.dark.quiet }>

                      { pcdOptions.isEmpty() && <div className="text-center">No options!</div> }

                      {
                        pcdOptions.map((pcdOption, optionName) => (
                          <Section key={ optionName }>
                            <Field
                              component={ PcdOption }
                              name={ optionName }
                              props={{
                                containerSide,
                                name: optionName,
                                option: pcdOption,
                              }}
                            />
                          </Section>
                        )).toArray()
                      }
                    </Card>
                  </div>
                </FormSection>
              );
            }, this)
          }
        </div>
      </Section>
    );
  }
}

const mapStateToProps = state => ({
  pcdOptionsA: getProviderCapabilitiesOptions(state, { containerSide: 'A' }),
  pcdOptionsB: getProviderCapabilitiesOptions(state, { containerSide: 'B' }),
});

export default connect(mapStateToProps)(Tweaks);



// WEBPACK FOOTER //
// ./src/containers/MoreOptionsForm/Tweaks.jsx