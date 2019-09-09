import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';

import { AddProviderAccount } from '../../containers';
import Modal from '../Modal/Modal';


const StyledModal = styled(Modal)`
  width: 750px;
  text-align: center;
  height: 270px;
`;


export default class NewProviderModal extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func,
  };

  render() {
    const {
      isOpen,
      onRequestClose,
      onSuccess,
    } = this.props;

    return (
      <StyledModal
        displayCloseButton
        isOpen={ isOpen }
        onRequestClose={ onRequestClose }
        title="Connect another tool"
        type="plainModal"
      >
        <AddProviderAccount onSuccess={ onSuccess || onRequestClose } />
      </StyledModal>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/NewProviderModal/NewProviderModal.jsx