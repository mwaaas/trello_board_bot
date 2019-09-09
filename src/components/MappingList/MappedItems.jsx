import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { List } from 'immutable';

import { Paginator, MappingListItem } from '../';


export default class MappedItems extends Component {
  static propTypes = {
    users: PropTypes.instanceOf(List).isRequired,
    unmapItems: PropTypes.func.isRequired,
    listSize: PropTypes.number,
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
    let paginated = this.getPaginatedUsers(nextProps.users, currentPage, listSize);
    // If the last user of the page was unmapped we have to go to previous page
    // Or if we are searching for users we have to go to the first unempty page
    while (paginated.size === 0 && currentPage > 1) {
      currentPage -= 1;
      paginated = this.getPaginatedUsers(nextProps.users, currentPage, listSize);
    }
    this.setState({ currentPage });
  }

  onPaginate = (page) => {
    this.setState({ currentPage: page });
  };

  getPaginatedUsers(users, currentPage, nbItemsPerpage) {
    const startIndex = (currentPage - 1) * nbItemsPerpage;
    const endIndex = currentPage * nbItemsPerpage;
    const paginated = users.slice(startIndex, endIndex);
    return paginated;
  }

  render() {
    const { users, unmapItems, listSize } = this.props;
    const { currentPage } = this.state;
    const paginated = this.getPaginatedUsers(users, currentPage, listSize);
    const nbPages = Math.ceil(users.size / listSize);

    return (
      <div className="mapped-items">
        {
          paginated.map((item) => {
            const index = item.get('index');
            const userA = item.get('userA');
            const userB = item.get('userB');

            return (
              <MappingListItem
                key={ index }
                userA={ userA }
                userB={ userB }
                mappingIndex={ index }
                onUnmapItems={ unmapItems }
              />
            );
          }).toArray()
        }
        { paginated.isEmpty() && 'Mapped users not found' }
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
// ./src/components/MappingList/MappedItems.jsx