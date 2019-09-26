import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';
import { reduxForm } from 'redux-form';

import {
  Button, Card, CheckboxText, Section,
} from '../../components';
import { WarningList, ContainersSync } from '../../containers';
import { color } from '../../theme';
import Modal from '../../components/Modal/Modal';


const StyledModal = styled(Modal)`
  &&& {
    padding-bottom: 1.5em !important;
  }

  max-width: 1050px;
`;

const AlignCheckbox = styled.div`
  margin-top: 8px;
  margin-right: 16px;
`;



export default class SyncFormConfirmationModal extends Component {
  static propTypes = {
    filtersOnly: PropTypes.bool,
    isEdit: PropTypes.bool,
    isOpen: PropTypes.bool.isRequired,
    mappingOnly: PropTypes.bool,
    onRequestClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    submitButtonText: PropTypes.string,
  };

  static defaultProps = {
    filtersOnly: false,
    isEdit: false,
    mappingOnly: false,
    submitButtonText: 'Save settings',
  };

  state = {
    checked: false,
  };

  toggleCheck = () => {
    this.setState({ checked: !this.state.checked });
  }

  handleSubmitAndCloseModal = (formProps) => {
    const { handleSubmit, onRequestClose } = this.props;

    this.setState({ checked: false });
    onRequestClose();
    handleSubmit(formProps);
  }

  render() {
    const {
      filtersOnly,
      isEdit,
      isOpen,
      mappingOnly,
      onRequestClose,
      submitButtonText,
    } = this.props;
    const { checked } = this.state;

    return (
      <StyledModal
        isOpen={ isOpen }
        onRequestClose={ onRequestClose }
        title="Heads up!"
        size="lg"
        type="plainModal"
      >
        <Section>
          <ContainersSync isEdit={ isEdit } />
        </Section>

        <Section>
          <div className="row">
            <div className="col-xs-6">
              <Card borderless color={ color.dark.quiet }>
                <WarningList
                  containerSide="A"
                  filtersOnly={ filtersOnly }
                  isEdit={ isEdit }
                  mappingOnly={ mappingOnly }
                />
              </Card>
            </div>
            <div className="col-xs-6">
              <Card borderless color={ color.dark.quiet }>
                <WarningList
                  containerSide="B"
                  filtersOnly={ filtersOnly }
                  isEdit={ isEdit }
                  mappingOnly={ mappingOnly }
                />
              </Card>
            </div>
          </div>
        </Section>

        <form>
          <div className="btn-toolbar">
            <Button onClick={ onRequestClose } pullLeft>
              Edit my sync
            </Button>

            <Button
              btnStyle="dark"
              disabled={ !checked }
              onClick={ this.handleSubmitAndCloseModal }
              pullRight
              reverse
            >
              { submitButtonText }
            </Button>

            <AlignCheckbox className="pull-right">
              <CheckboxText
                checked={ checked }
                id="sync-form-confirmation-checkbox"
                onChange={ this.toggleCheck }
              >
                I understand and wish to proceed.
              </CheckboxText>
            </AlignCheckbox>

          </div>
        </form>

      </StyledModal>
    );
  }
}

SyncFormConfirmationModal = reduxForm({
  form: 'syncForm',
  destroyOnUnmount: false,
})(SyncFormConfirmationModal);

// WEBPACK FOOTER //
// ./src/containers/SyncFormConfirmationModal/SyncFormConfirmationModal.jsx