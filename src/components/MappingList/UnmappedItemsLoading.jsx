import React from 'react';

import {
  Icon,
  Paginator,
  UserDisplayLoading,
  UserSelectLoading,
} from '../';
import './UnmappedItemsLoading.scss';

const UnmappedItem = () => (
  <div className="row mapping-list-add-item">
    <div className="col-xs-6 mapping-list-add-item__user-display">
      <UserDisplayLoading />
    </div>

    <Icon name="arrows-h" />

    <div className="col-xs-6 mapping-list-add-item__select-container">
      <UserSelectLoading />
    </div>
  </div>
);

const UnmappedItemsLoading = () => (
    <div className="unmapped-items-loading">
      <UnmappedItem />
      <UnmappedItem />
      <UnmappedItem />
      <Paginator numPages={ 3 } />
    </div>
);

export default UnmappedItemsLoading;



// WEBPACK FOOTER //
// ./src/components/MappingList/UnmappedItemsLoading.jsx