import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Title } from '../../components';


export default class FatalError extends Component {
  static propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
  }

  static defaultProps = {
    title: 'Something happened',
    subtitle: 'We should fix this momentarily.',
  }

  render() {
    const { title, subtitle } = this.props;
    return (
      <div className="link-list link-list--empty text-center">
        <Title type="h2">{ title }</Title>
        <Title type="h2">{ subtitle }</Title>
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/FatalError/FatalError.jsx