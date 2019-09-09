import React from 'react';

import {
  Icon,
  UserDisplayLoading,
  Paginator,
} from '../';

// Using classes from the original component
const MappedItem = () => (
  <div className="row mapping-list-add-item">
    <div className="col-xs-6 mapping-list-add-item__user-display">
      <UserDisplayLoading />
    </div>

    <Icon name="arrows-h" />

    <div className="col-xs-6 mapping-list-add-item__user-display">
      <UserDisplayLoading />
    </div>
  </div>
);

const MappedItemsLoading = () => (
    <div>
      <MappedItem />
      <MappedItem />
      <MappedItem />
      <MappedItem />
      <MappedItem />
      <Paginator numPages={ 4 } />
    </div>
);

export default MappedItemsLoading;



// WEBPACK FOOTER //
// ./src/components/MappingList/MappedItemsLoading.jsx