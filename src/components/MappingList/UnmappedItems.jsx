import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { List } from 'immutable';

import { MappingListAddItem, Paginator } from '../';

export default class UnmappedItems extends Component {
  static propTypes = {
    filterFunction: PropTypes.func.isRequired,
    listSize: PropTypes.number,
    mapItems: PropTypes.func.isRequired,
    usersA: PropTypes.instanceOf(List).isRequired,
    usersB: PropTypes.instanceOf(List).isRequired,
  };

  static defaultProps = {
    listSize: 5,
  };

  state = {
    currentPage: 1,
  };

  componentWillReceiveProps(nextProps) {
    const { listSize } = this.props;
    let { currentPage } = this.state;
    let paginated = this.getPaginatedUsers(nextProps.usersA, currentPage, listSize);
    while (paginated.size === 0 && currentPage > 1) {
      currentPage -= 1;
      paginated = this.getPaginatedUsers(nextProps.usersA, currentPage, listSize);
    }
    this.setState({ currentPage });
  }

  onPaginate = (page) => {
    this.setState({ currentPage: page });
  }

  getPaginatedUsers(usersA, currentPage, nbItemsPerpage) {
    const startIndex = (currentPage - 1) * nbItemsPerpage;
    const endIndex = currentPage * nbItemsPerpage;
    const paginatedA = usersA.slice(startIndex, endIndex);
    return paginatedA;
  }

  render() {
    const {
      filterFunction,
      listSize,
      mapItems,
      usersA,
      usersB,
    } = this.props;

    const { currentPage } = this.state;

    const paginatedUsersA = this.getPaginatedUsers(usersA, currentPage, listSize);
    const nbPages = Math.ceil(usersA.size / listSize);

    return (
      <div className="unmapped-items">
        {
          paginatedUsersA
            .map((userA, index) => (
              <MappingListAddItem
                filterFunction={ filterFunction }
                key={ userA.get('id') }
                mappingIndex={ index }
                onMapItems= { mapItems }
                unmappedB={ usersB }
                userA={ userA }
              />
            ))
            .toArray()
        }

        { paginatedUsersA.isEmpty() && 'Unmapped users not found' }

        {
          nbPages > 1
          && <Paginator
            numPages={ nbPages }
            onChangePage={ this.onPaginate }
          />
        }
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/MappingList/UnmappedItems.jsx