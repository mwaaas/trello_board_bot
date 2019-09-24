import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Map } from 'immutable';

import { Button, TextInput } from '../../components';
import { containerActions } from '../../actions';
import { WorkspacesSelect } from '../../containers';
import { getProviderByProviderIdentityId } from '../../reducers';
import { formUtils } from '../../utils';

import Modal from '../../components/Modal/Modal';


const StyledModal = styled(Modal)`
  width: 600px;
`;

const ButtonsWrapper = styled.div`
  margin-top: 4em;
`;


// todo annotation
// @reduxForm({
//   form: 'newContainerForm',
//   validate: (values) => {
//     const errors = {};
//     if (formUtils.isEmpty(values.containerName)) {
//       errors.containerName = 'Required';
//     }
//
//     if (formUtils.isEmpty(values.workspaceId)) {
//       errors.workspaceId = 'Required';
//     }
//     return errors;
//   },
// })
class NewProjectModal extends Component {
  static propTypes = {
    containerSide: PropTypes.oneOf(['A', 'B']).isRequired,
    handleSubmit: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
    providerIdentityId: PropTypes.string.isRequired,
    provider: PropTypes.instanceOf(Map).isRequired,
  };

  render() {
    const {
      containerSide,
      handleSubmit,
      isOpen,
      onRequestClose,
      provider,
      providerIdentityId,
      submitting,
    } = this.props;
    const containerTerm = provider.getIn(['terms', 'container', 'singular'], 'project');

    return (
      <StyledModal
        displayCloseButton
        isOpen={ isOpen }
        onRequestClose={ onRequestClose }
        title={ `Create a new ${provider.get('displayName', '')} ${containerTerm}` }
        type="plainModal"
      >
        <form onSubmit={ handleSubmit }>
          <Field
            component={ TextInput }
            name="newContainerName"
            placeholder={ `Name your ${containerTerm}` }
            label="Name"
          />

          <Field
            component={ WorkspacesSelect }
            name="workspaceId"
            props={{ containerSide, providerIdentityId }}
          />

          <ButtonsWrapper className="btn-toolbar">
            <Button btnStyle="link" onClick={ handleSubmit } disabled={ submitting } pullRight>
              { submitting ? `Creating new ${containerTerm}` : `Create new ${containerTerm}` }
            </Button>
            <Button btnStyle="link" onClick={ onRequestClose } pullRight>
              Cancel
            </Button>
          </ButtonsWrapper>
        </form>
      </StyledModal>
    );
  }
}
NewProjectModal = reduxForm({
  form: 'newContainerForm',
  validate: (values) => {
    const errors = {};
    if (formUtils.isEmpty(values.containerName)) {
      errors.containerName = 'Required';
    }

    if (formUtils.isEmpty(values.workspaceId)) {
      errors.workspaceId = 'Required';
    }
    return errors;
  },
})(NewProjectModal);

const mapStateToProps = (state, ownProps) => ({
  provider: getProviderByProviderIdentityId(state, ownProps.providerIdentityId),
});

const mapDispatchToProps = (dispatch, {
  containerSide,
  providerIdentityId,
  onRequestClose,
  onSuccess,
}) => ({
  onSubmit: async ({ workspaceId, newContainerName }) => {
    const sides = {
      [containerSide]: {
        providerIdentityId,
        containerId: workspaceId,
        newContainerName,
      },
    };

    try {
      const { container } = await dispatch(containerActions.createContainer(sides, containerSide));
      onRequestClose();
      onSuccess(container.id);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject();
    }
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(NewProjectModal);



// WEBPACK FOOTER //
// ./src/containers/NewProjectModal/NewProjectModal.jsx