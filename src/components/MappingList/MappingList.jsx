import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { List } from 'immutable';

import {
  Card,
  MappedItems,
  SearchBox,
  Section,
  Title,
  UnmappedItems,
} from '../';
import { color } from '../../theme';
import MappedItemsLoading from './MappedItemsLoading';
import UnmappedItemsLoading from './UnmappedItemsLoading';
import './MappingList.scss';


export default class MappingList extends Component {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    mappedUsers: PropTypes.instanceOf(List).isRequired,
    unmappedA: PropTypes.instanceOf(List).isRequired,
    unmappedB: PropTypes.instanceOf(List).isRequired,
    mapItems: PropTypes.func.isRequired,
    unmapItems: PropTypes.func.isRequired,
    filterFunction: PropTypes.func.isRequired,
  };

  state = {
    mappedSearchString: '',
    unmappedSearchString: '',
  };

  onChangeMappedSearchString = (event) => {
    this.setState({ mappedSearchString: event.target.value });
  };

  onChangeUnmappedSearchString = (event) => {
    this.setState({ unmappedSearchString: event.target.value });
  };

  onMapItems = (indexA, indexB) => {
    const { mapItems } = this.props;
    this.setState({ unmappedSearchString: '' });
    mapItems(indexA, indexB);
  };

  onUnmapItems = (idx) => {
    const { unmapItems } = this.props;
    this.setState({ mappedSearchString: '' });
    unmapItems(idx);
  };

  getFilteredMappedUsers() {
    const { filterFunction, mappedUsers, isLoading } = this.props;
    const { mappedSearchString } = this.state;

    if (isLoading) {
      return List();
    }

    return mappedUsers.filter((item) => {
      const userA = item.get('userA');
      const userB = item.get('userB');

      return filterFunction(userA, mappedSearchString)
        || filterFunction(userB, mappedSearchString);
    });
  }

  getFilteredUnmappedUsersA() {
    const { filterFunction, unmappedA } = this.props;
    const { unmappedSearchString } = this.state;

    return unmappedA.filter(user => filterFunction(user, unmappedSearchString));
  }

  render() {
    const { filterFunction, isLoading, unmappedB } = this.props;
    const { mappedSearchString, unmappedSearchString } = this.state;

    const filteredUnmappedA = this.getFilteredUnmappedUsersA();
    const filteredMapped = this.getFilteredMappedUsers();

    return (
      <div className="mapping-list">
        <Section>
          <div className="row">
            <Title type="h3" className="col-xs-5">
              Unmapped users
            </Title>
            <div className="col-xs-6 col-xs-push-1">
              <SearchBox
                name="unmappedSearch"
                className="search-box__filter-users"
                size="sm"
                placeholder="Search users (name or email)"
                onChange={ this.onChangeUnmappedSearchString }
                value={ unmappedSearchString }
              />
            </div>
          </div>
          <Card borderless>
            {
              isLoading ? (
                <UnmappedItemsLoading />
              ) : (
                <UnmappedItems
                  usersA={ filteredUnmappedA }
                  usersB={ unmappedB }
                  filterFunction={ filterFunction }
                  mapItems={ this.onMapItems }
                />
              )
            }
          </Card>
        </Section>

        <Section>
          <div className="row">
            <Title type="h3" className="col-xs-5">
              Mapped users
            </Title>
            <div className="col-xs-6 col-xs-push-1">
              <SearchBox
                className="search-box__filter-users"
                size="sm"
                placeholder="Search users (name or email)"
                onChange={ this.onChangeMappedSearchString }
                value={ mappedSearchString }
              />
            </div>
          </div>
          <Card borderless color={ color.dark.quiet }>
            {
              isLoading ? (
                <MappedItemsLoading />
              ) : (
                <MappedItems
                  users={ filteredMapped }
                  unmapItems={ this.onUnmapItems }
                />
              )
            }
          </Card>
        </Section>
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/MappingList/MappingList.jsx