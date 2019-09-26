import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Map } from 'immutable';

import { trackingActions } from '../../actions';
import { trackingTypes } from '../../consts'; // Tracking types for HubSpot Beta Users
import {
  Title,
  RadioButton,
  RadioButtonGroup,
  Modal,
  Label,
} from '../../components';

import {
  getProviderCapabilities,
  getProviderDisplayName,
} from '../../reducers';

export const HUBSPOT_DEALS_WARNING = {
  DISPLAY_TITLE: 'HubSpot deals are coming soon!',
  MESSAGE: "We understand you want to sync HubSpot deals. Our developers are hard at work getting that feature ready and we'd love to be able to let you know when you can try it out.", // eslint-disable-line
  CTA: "Notify me when it's available",
  LABEL: 'Coming soon',
};

class ChooseInformationType extends Component {
  static propTypes = {
    taskCategories: PropTypes.instanceOf(Map).isRequired,
    terms: PropTypes.instanceOf(Map).isRequired,
    input: PropTypes.object.isRequired,
    providerIdentityId: PropTypes.string,
    displayName: PropTypes.string,
  };

  state = {
    isModalOpen: false,
    isUserNotified: false,
    activeButton: null,
  };

  handleCancelClick = () => {
    const { trackEvent } = this.props;
    trackEvent(trackingTypes.HUBSPOT_BETA.USER_HUBSPOT_DEALS_DONT_NOTIFY_ME);
    this.handleOnClose();
  }

  handleOnConfirm = async () => {
    const { trackEvent } = this.props;
    trackEvent(trackingTypes.HUBSPOT_BETA.USER_HUBSPOT_DEALS_NOTIFY_ME);
    this.setState({ isUserNotified: true });
    this.handleOnClose();
  }

  handleOnChange = (value) => {
    const { input, taskCategories, trackEvent } = this.props;
    input.onChange(value);

    const isItemActive = taskCategories.getIn([value, 'active']);

    if (!isItemActive) {
      trackEvent(trackingTypes.HUBSPOT_BETA.USER_HUBSPOT_DEALS_CLICK);
      this.openModal();
    }
  }

  handleOnClose = () => {
    this.closeModal();
    this.handleOnChange('task');
  }

  closeModal = () => {
    this.setState({ isModalOpen: false });
  }

  openModal = () => {
    this.setState({ isModalOpen: true });
  }

  getModalProps = () => ({
    modalTitle: HUBSPOT_DEALS_WARNING.DISPLAY_TITLE,
    modalText: HUBSPOT_DEALS_WARNING.MESSAGE,
    modalCTA: HUBSPOT_DEALS_WARNING.CTA,
  });

  getRadioButtons = () => {
    const { taskCategories } = this.props;
    return taskCategories.map((taskCategory, index) => (
      <RadioButton
        key={index}
        value={index}
        label={this.renderItemTitle(taskCategory.getIn(['displayName', 'plural']))}
        subLabel={taskCategory.get('helpText')}
        disabled={index === 'deal' && this.state.isUserNotified}
      />
    )).toArray();
  }

  renderItemTitle(value) {
    const title = `${this.props.displayName} ${value} `;
    if (value === 'deals' && this.state.isUserNotified) {
      return (
        <Title type='h4'>
          { title }
          <Label labelStyle={{ borderRadius: 'round' }} labelType='orange'>
            {HUBSPOT_DEALS_WARNING.LABEL}
          </Label>
      </Title>);
    }

    return <Title type='h4'>{ title }</Title>;
  }

  render() {
    const { input } = this.props;

    const {
      modalCTA,
      modalText,
      modalTitle,
    } = this.getModalProps();

    return (
      <div>
        <RadioButtonGroup {...input} onChange={ this.handleOnChange }>
          { this.getRadioButtons() }
        </RadioButtonGroup>
        {/* This is an experiment and if we want to make it universal, we need to refactor 'isOpen' */}
        <Modal
          {...input}
          confirmLabel={ modalCTA }
          cancelLabel='No thanks'
          displayCloseButton={ true }
          isOpen={ this.state.isModalOpen }
          onCancel={ this.handleCancelClick }
          onRequestClose={ this.handleOnClose }
          onConfirm={ this.handleOnConfirm }
          size="sm"
          title={ modalTitle }
        >
          { modalText }
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  displayName: getProviderDisplayName(state, ownProps),
  terms: getProviderCapabilities(state, ownProps, 'terms'),
  taskCategories: getProviderCapabilities(state, ownProps, 'taskCategories'),
});

const mapDispatchToProps = dispatch => ({
  trackEvent: (eventName, data) =>
    dispatch(trackingActions.trackEvent(eventName, { ...data })),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChooseInformationType);



// WEBPACK FOOTER //
// ./src/containers/ChooseInformationType/ChooseInformationType.jsx