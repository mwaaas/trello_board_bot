import React from 'react';

import { Icon } from '../';
import './UserSelectLoading.scss';

const UserSelectLoading = () => (
    <div className="user-select-loading">
      <div className="user-select-loading__placeholder" />
      <div className="user-select-loading__dropdown">
        <Icon name="sort-desc" />
      </div>
    </div>
);

export default UserSelectLoading;



// WEBPACK FOOTER //
// ./src/components/MappingList/UserSelectLoading.jsx