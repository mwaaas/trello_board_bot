import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Icon } from '../../components';
import './DirectoryHierarchy.scss';


export default class DirectoryHierarchy extends Component {
  static propTypes = {
    parentDirectoryName: PropTypes.string.isRequired,
    childrenDirectoryNames: PropTypes.array.isRequired,
  };

  render() {
    const {
      parentDirectoryName,
      childrenDirectoryNames,
    } = this.props;

    return (
      <div className="directory-hierarchy">
        <strong>
          <Icon name="folder-open-o" /> { parentDirectoryName }
        </strong>
        <ul className="fa-ul directory-hierarchy__list">
          {
            childrenDirectoryNames.map((directoryName, index) => (
              <li key={index} className="directory-hierarchy__item">
                <Icon name="folder-o" className="fa-li" />
                <span className="directory-hierarchy__item-name"> { directoryName }</span>
              </li>
            ))
          }
        </ul>
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/DirectoryHierarchy/DirectoryHierarchy.jsx