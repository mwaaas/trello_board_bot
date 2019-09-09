import React, { Component } from 'react';
import onClickOutside from 'react-onclickoutside';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import { Button, Icon } from '../../components';


// todo annotation
// @onClickOutside
class ConfirmDeleteButton extends Component {
  static propTypes = {
    onClickOutside: PropTypes.func.isRequired,
  };

  handleClickOutside = () => {
    this.props.onClickOutside();
  };

  render() {
    return (
      <Button
        {...this.props}
        btnStyle="errorLight"
        style={{ height: '100%' }}
      >
        <Icon name="trash" /> Confirm Delete
      </Button>
    );
  }
}

ConfirmDeleteButton = onClickOutside(ConfirmDeleteButton);

class DeleteButtonWithConfirm extends Component {
  state = {
    confirmDelete: false,
  };

  componentDidUpdate(prevProps, prevState) {
    const element = ReactDOM.findDOMNode(this.refs.input);
    if (element && this.state.isConfirmDelete && !prevState.isConfirmDelete) {
      element.focus();
      element.setSelectionRange(0, element.value.length);
    }
  }

  handleStartDeleting = () => {
    this.setState({ confirmDelete: true });
  };

  handleClickDeleteConfirm = () => {
    const { onDelete } = this.props;
    this.setState({ confirmDelete: false });
    onDelete();
  }

  render() {
    const { confirmDelete } = this.state;

    if (confirmDelete) {
      return (
        <ConfirmDeleteButton
          {...this.props}
          onClick={ this.handleClickDeleteConfirm }
          onClickOutside={ () => this.setState({ confirmDelete: false }) }
        >
          <Icon name="trash" /> Confirm Delete
        </ConfirmDeleteButton>
      );
    }

    return (
      <Button {...this.props} onClick={ this.handleStartDeleting }>
        <Icon name="trash" />
      </Button>
    );
  }
}

export default DeleteButtonWithConfirm;


// WEBPACK FOOTER //
// ./src/components/DeleteButtonWithConfirm/DeleteButtonWithConfirm.jsx