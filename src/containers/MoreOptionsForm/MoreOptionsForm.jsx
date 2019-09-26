import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { reduxForm } from 'redux-form';

import {
  Button,
  Section,
  StickyButtonToolbar,
  Title,
} from '../../components';
import { ContainersSync } from '../../containers';
import Trackable from '../../components/TrackableHoC/TrackableHoC';
import CommonOptions from './CommonOptions';
import ManualOptions from './ManualOptions';
import Tweaks from './Tweaks';


export const validate = ({ manualOptions }) => {
  const error = {
    manualOptions: 'Your manual settings are invalid and will not be saved. Make sure the format entered is valid JSON.',
  };

  if (!manualOptions) {
    return {};
  }

  try {
    const parsedOptions = JSON.parse(manualOptions);
    if (typeof parsedOptions === 'string' || Array.isArray(parsedOptions)) {
      return error;
    }
  } catch (err) {
    return error;
  }

  return {};
};


export default class MoreOptionsForm extends Component {
  static propTypes = {
    onCancel: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
  };

  render() {
    const { handleSubmit, onCancel } = this.props;

    return (
      <div className="more-options-form">
        <Section>
          <Title type="h2">
            More options
          </Title>
        </Section>

        <Section>
          <ContainersSync isEdit />
        </Section>

        <form>
          <Section>
            <Tweaks />
            <CommonOptions />
          </Section>

          <ManualOptions />

          <StickyButtonToolbar>
            <Button
              btnStyle="dark"
              onClick={ onCancel }
              pullLeft
              reverse
            >
              Cancel
            </Button>
            <Button
              btnStyle="primary"
              onClick={ handleSubmit }
              pullRight
            >
              Save and sync
            </Button>
          </StickyButtonToolbar>
        </form>
      </div>
    );
  }
}

MoreOptionsForm = reduxForm({
  form: 'syncForm',
  destroyOnUnmount: false,
  validate,
})(MoreOptionsForm);

MoreOptionsForm = Trackable(MoreOptionsForm, 'customize/more');

// WEBPACK FOOTER //
// ./src/containers/MoreOptionsForm/MoreOptionsForm.jsx