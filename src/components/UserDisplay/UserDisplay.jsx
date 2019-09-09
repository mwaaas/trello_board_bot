import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { List } from 'immutable';

import { Avatar } from '../../components';
import './UserDisplay.scss';


const UserDisplay = ({
  displayName,
  avatar,
  emails,
  className,
  size,
}) => (
  <div className={ classnames('user-display', 'clearfix', className) }>
    <Avatar size={ size } src={ avatar } />
    <div className="user-display__first-line user-display__information">
      { displayName }
    </div>
    <div className="user-display__second-line user-display__information">
      { emails.first() || 'email hidden' }
    </div>
  </div>
);

UserDisplay.propTypes = {
  displayName: PropTypes.string.isRequired,
  avatar: PropTypes.string,
  emails: PropTypes.instanceOf(List),
  className: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

UserDisplay.defaultProps = {
  size: 32,
  emails: List(),
};

export default UserDisplay;



// WEBPACK FOOTER //
// ./src/components/UserDisplay/UserDisplay.jsx