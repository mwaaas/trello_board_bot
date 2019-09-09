import PropTypes from 'prop-types';
import React from 'react';
import Modal from 'react-modal';
import classnames from 'classnames';
import styled from 'styled-components';

import { Button, Title } from '../../components';
import { color } from '../../theme';
import Icon from '../Icon/Icon';

const CloseButton = styled(Icon)`
  position: absolute;
  top: 20px;
  right: 24px;

  &:hover {
    cursor: pointer;
  };
`;

const modalSizes = {
  sm: '400px',
  md: '600px',
  lg: 'none',
};

const Content = styled.div`
  color: ${color.dark.secondary};
  max-width: ${props => modalSizes[props.size]};
`;

const ButtonBar = styled.div`
  margin-top: 1rem;
`;

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.87)',
  },
  content: {
    position: 'absolute',
    border: '1px solid #ccc',
    background: '#fff',
    overflow: 'auto',
    borderRadius: '4px',
    outline: 'none',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: '2em',
    maxHeight: '90vh',
  },
};

const modalTypes = {
  INFORMATIVE: 'informativeModal',
  PLAIN: 'plainModal',
  CONFIRMATION: 'confirmationModal',
};


const UnitoModal = ({
  cancelLabel,
  children,
  className,
  confirmLabel,
  displayCloseButton,
  isOpen,
  onCancel,
  onConfirm,
  onRequestClose,
  size,
  title,
  type,
}) => {
  const modalClasses = classnames('modal-dialog', className);
  const cancelText = cancelLabel || (type === modalTypes.INFORMATIVE ? 'Close' : 'Cancel');

  return (
    <Modal
      ariaHideApp={ false }
      className={ modalClasses }
      contentLabel="Modal"
      isOpen={ isOpen }
      onRequestClose={ onRequestClose || onCancel }
      style={ customStyles }
    >
      { displayCloseButton && <CloseButton name="remove" onClick={ onRequestClose || onCancel } /> }

      { title && <Title type="h3">{title}</Title> }

      <Content size={ size }>
        { children }
      </Content>

      {
        type !== modalTypes.PLAIN && (
          <ButtonBar className="clearfix">
            {
              type === modalTypes.CONFIRMATION && (
                <Button btnStyle="purple" onClick={onConfirm} pullRight>
                  { confirmLabel }
                </Button>
              )
            }
            <Button btnStyle="link" pullRight onClick={ onCancel || onRequestClose }>
              { cancelText }
            </Button>
          </ButtonBar>
        )
      }
    </Modal>
  );
};

UnitoModal.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  displayCloseButton: PropTypes.bool,
  isOpen: PropTypes.bool.isRequired,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
  onRequestClose: PropTypes.func,
  size: PropTypes.oneOf(Object.keys(modalSizes)),
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  type: PropTypes.oneOf(Object.values(modalTypes)),
};

UnitoModal.defaultProps = {
  confirmLabel: 'Confirm',
  displayCloseButton: false,
  size: 'lg',
  type: modalTypes.CONFIRMATION,
};

export default UnitoModal;



// WEBPACK FOOTER //
// ./src/components/Modal/Modal.jsx