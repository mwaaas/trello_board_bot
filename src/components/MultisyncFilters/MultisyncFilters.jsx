import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Fields } from 'redux-form';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { addNotification as notify } from 'reapop';

import { linkActions } from '../../actions';
import { MultisyncFilterItem, AddMultisyncFilterItem } from '.';

const MultisyncFilterList = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
`;


class MultisyncFilters extends Component {
  static propTypes = {
    fields: PropTypes.object.isRequired,
    leaves: PropTypes.object.isRequired,
    root: PropTypes.object.isRequired,
    topology: PropTypes.object.isRequired,
  };

  state = {
    displayDetailIndex: null,
  };

  handleDeleteItem = async (index) => {
    const { fields, deleteLink } = this.props;
    const { displayDetailIndex } = this.state;
    const { syncId, existingSync } = fields.getAll()[index];

    if (existingSync) {
      await deleteLink(syncId);
    }

    fields.remove(index);
    if (displayDetailIndex === index) {
      this.setState({ displayDetailIndex: null });
    }
  }

  handleDisplayDetailItem = (index) => {
    const { displayDetailIndex } = this.state;
    this.setState({
      displayDetailIndex: displayDetailIndex === index ? null : index,
    });
  }

  render() {
    const {
      fields,
      leaves,
      root,
      topology,
    } = this.props;

    const addedFields = fields.getAll() || [];

    return (
      <div className="multisync-filters">
        <MultisyncFilterList>
          {
            fields.map((filterItem, index) => (
              <li key={ index }>
                <Fields
                  component={ MultisyncFilterItem }
                  names={[
                    `${filterItem}.containerId`,
                    `${filterItem}.fieldValueId`,
                    `${filterItem}.syncDirection`,
                    `${filterItem}.isAutoSync`,
                    `${filterItem}.applyIncomingTag`,
                    `${filterItem}.existingSync`,
                  ]}
                  props={{
                    index,
                    leaves,
                    onDeleteFilterItem: () => this.handleDeleteItem(index),
                    onDisplayDetail: () => this.handleDisplayDetailItem(index),
                    root,
                    topology: topology.input.value,
                    selectedFilters: addedFields,
                    displayDetail: this.state.displayDetailIndex === index,
                  }}
                />
              </li>
            ), this)
          }
        </MultisyncFilterList>
        <AddMultisyncFilterItem
          leaves={ leaves }
          onAdd={ fields.push }
          root={ root }
          selectedFilters={ addedFields }
          topology={ topology.input.value }
        />
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  deleteLink: async (syncId) => {
    await dispatch(linkActions.deleteLink(syncId));
    dispatch(notify({
      closeButton: true,
      dismissible: true,
      position: 'tr',
      message: 'Sync deleted',
      status: 'success',
    }));
  },
});

export default connect(null, mapDispatchToProps)(MultisyncFilters);



// WEBPACK FOOTER //
// ./src/components/MultisyncFilters/MultisyncFilters.jsx