/**
 * @module UserDisplaySelectValue
 * A wrapper around the UserDisplay component that works with react-select
 * used to display the selected value
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import './UserDisplaySelectValue.scss';
import { UserDisplay } from '../';


export default class UserDisplaySelectValue extends Component {
  static propTypes = {
    value: PropTypes.object.isRequired,
  };

  render() {
    const { value: { label, user } } = this.props;

    return (
      <div className="user-display-select-value Select-value" title={ label }>
        <UserDisplay
          avatar={ user.get('avatar') }
          displayName={ user.get('displayName') }
          emails={ user.get('emails') }
        />
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/Select/UserDisplaySelectValue.jsx