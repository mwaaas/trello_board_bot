import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map } from 'immutable';
import styled from 'styled-components';

import { Button, Modal } from '../../components';
import { color, fontWeight } from '../../theme';


const CollaboratorItem = styled.div`
  background-color: ${color.dark.quiet};
  margin-bottom: .5rem;
  padding: 1rem 0 1rem 1rem;
`;

const CollaboratorName = styled.span`
  color: ${props => props.isExcluded && color.dark.hint};
  font-weight: ${fontWeight.medium};
`;

export default class CollaboratorListItem extends Component {
  static propTypes = {
    collaborator: PropTypes.instanceOf(Map).isRequired,
    onExclude: PropTypes.func.isRequired,
  };

  state = {
    isLoading: false,
    showRemoveModal: false,
  };

  handleConfirmExclude = async () => {
    const { collaborator, onExclude } = this.props;
    this.setState({ isLoading: true });
    await onExclude(collaborator.get('id'));
    this.setState({ showRemoveModal: false, isLoading: false });
  }

  getModal = () => {
    const { collaborator } = this.props;
    const { showRemoveModal } = this.state;

    return (
      <Modal
        confirmLabel="Confirm remove"
        isOpen={ showRemoveModal && !collaborator.get('isExcluded') }
        onCancel={ () => this.setState({ showRemoveModal: false }) }
        onConfirm={ this.handleConfirmExclude }
        size="md"
        title="Remove Active User?"
      >
        <CollaboratorName>
          { collaborator.get('displayName') }’s tasks will stop syncing in all of your projects. { ' ' }
          This action will not revert any changes made by the user or delete any cards.
        </CollaboratorName>
      </Modal>
    );
  }

  handleClick = async () => {
    const { collaborator, onInclude } = this.props;
    if (!collaborator.get('isExcluded')) {
      this.setState({ showRemoveModal: true });
      return;
    }

    this.setState({ isLoading: true });
    await onInclude(collaborator.get('id'));
    this.setState({ isLoading: false });
  }

  render() {
    const { collaborator } = this.props;
    const { isLoading } = this.state;

    return (
      <CollaboratorItem className="collaborator-list-item">
        { this.getModal() }
        <CollaboratorName isExcluded={ collaborator.get('isExcluded') }>
          { collaborator.get('displayName') }
        </CollaboratorName>
        <Button
          btnStyle="subtleLink"
          disabled={ isLoading }
          onClick={ this.handleClick }
          pullRight
          size="sm"
        >
          { collaborator.get('isExcluded') ? 'Add' : 'Remove' }
        </Button>
      </CollaboratorItem>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/CollaboratorListItem/CollaboratorListItem.jsx