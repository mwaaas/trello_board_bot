import React from 'react';
import './UserDisplayLoading.scss';


const generateNameLength = () => 30 + Math.random() * 70;

const generateEmailLength = () => 80 + Math.random() * 80;

const UserDisplayLoading = () => (
  <div className="user-display-loading">
    <div className="user-display-loading__avatar user-display-loading__placeholder" />
    <div
      className="user-display-loading__first-line user-display-loading__placeholder"
      style={{ width: `${generateNameLength()}px` }}
    />
    <div
      className="user-display-loading__second-line user-display-loading__placeholder"
      style={{ width: `${generateEmailLength()}px` }}
    />
  </div>
);

export default UserDisplayLoading;



// WEBPACK FOOTER //
// ./src/components/UserDisplay/UserDisplayLoading.jsx