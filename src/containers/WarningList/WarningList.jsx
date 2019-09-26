import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';
import { List } from 'immutable';
import { connect } from 'react-redux';

import {
  Href, Icon, Section, Title,
} from '../../components';
import { linkTypes, routes } from '../../consts';
import {
  getContainer,
  getFiltersSideWarnings,
  getMappingSideWarnings,
  getProvider,
} from '../../reducers';
import { color, fontSize } from '../../theme';


const ListContent = styled.ul`
  list-style: none;
  padding: 0;
`;


const HelpBlock = styled.div`
  font-size: ${fontSize.body};
`;


class WarningList extends Component {
  static propTypes = {
    containerSide: PropTypes.oneOf(['A', 'B']).isRequired,
    filters: PropTypes.instanceOf(List).isRequired,
    filtersOnly: PropTypes.bool,
    mapping: PropTypes.instanceOf(List).isRequired,
    mappingOnly: PropTypes.bool,
  }

  static defaultProps = {
    filtersOnly: false,
    mappingOnly: false,
  }

  getWarningMessage = (warning) => {
    const { provider } = this.props;
    const unmappedStatusCount = warning.get('unmappedCount');
    const singularOrPlural = unmappedStatusCount === 1 ? 'singular' : 'plural';
    const statusTerm = provider.getIn(['capabilities', 'fields', 'status', 'displayName', singularOrPlural]);
    const containerTerm = provider.getIn(['capabilities', 'terms', 'container', 'singular']);


    switch (warning.get('type')) {
      case linkTypes.WARNINGS.MISSING_MAPPING_FIELD_VALUE:
        return 'Missing item';

      case linkTypes.WARNINGS.NO_FILTERS_MULTI_SYNC_OTHER_RO:
      case linkTypes.WARNINGS.NO_FILTERS_MULTI_SYNC_BOTH: {
        return `This ${containerTerm} syncs to multiple projects`;
      }

      case linkTypes.WARNINGS.UNMAPPED_STATUSES:
        return `You have ${unmappedStatusCount} unmapped ${statusTerm}`;

        // Should never trigger. However, this would be more graceful than "undefined" if it did.
      default:
        return 'There is a problem with your sync settings';
    }
  }

  getWarningHelpText = (warning) => {
    const { otherContainer, provider } = this.props;

    const statusTerm = provider.getIn(['capabilities', 'fields', 'status', 'displayName', 'plural']);
    const taskTerm = provider.getIn(['capabilities', 'terms', 'task', 'plural']);
    const containerTerm = provider.getIn(['capabilities', 'terms', 'container', 'singular']);

    switch (warning.get('type')) {
      case linkTypes.WARNINGS.MISSING_MAPPING_FIELD_VALUE:
        return 'One of your mapping items could not be found. Go to the "Map fields" tab to remove it';

      case linkTypes.WARNINGS.NO_FILTERS_MULTI_SYNC_OTHER_RO:
        return (
          <span>
            Use filters to keep all { taskTerm } in <strong>{ otherContainer.get('displayName') }</strong> { ' ' }
            from syncing to every project that this { containerTerm } is connected to.
            We recommend <Href href={ routes.HELP_PATHS.FILTER_TASKS }>assigning a filter to { taskTerm }</Href> to
            control where they sync.
          </span>
        );

      case linkTypes.WARNINGS.NO_FILTERS_MULTI_SYNC_BOTH:
        return (
          <span>
            Use filters to keep all { taskTerm } in this { containerTerm } from syncing to the other projects.
            We recommend to <Href href={ routes.HELP_PATHS.FILTER_TASKS }>assign a filter to your { taskTerm }</Href>.
          </span>
        );

      case linkTypes.WARNINGS.UNMAPPED_STATUSES:
        return (
        <span>
          Not mapping { statusTerm } will <strong>not</strong> filter them out of your sync!
          If you want to filter out { statusTerm }, you can do so in the "Filter Tasks" tab.
        </span>
        );

      // Should never trigger. However, this would be more graceful than "undefined" if it did.
      default:
        return 'There is a problem with your sync settings';
    }
  }

  render() {
    const {
      filters,
      filtersOnly,
      mapping,
      mappingOnly,
    } = this.props;

    return (
      <div className="warning-list">
        {
          !filters.isEmpty() && !mappingOnly
          && <Section>
            <Title type="h3">Filters</Title>

            <ListContent>
              {
                filters.map((warning, index) => (
                  <li key={ index }>
                    <div className="media">
                      <div className="media-left">
                        <Icon
                          className="media-object"
                          color={ color.brand.warning }
                          name="warning"
                        />
                      </div>
                      <div className="media-body">
                        <Title type="h4">{ this.getWarningMessage(warning) }</Title>
                        <HelpBlock className="help-block">
                          { this.getWarningHelpText(warning) }
                        </HelpBlock>
                      </div>
                    </div>
                  </li>
                )).toArray()
              }
            </ListContent>
          </Section>
        }

        {
          !mapping.isEmpty() && !filtersOnly
          && <Section>
            <Title type="h3">Mapping</Title>
            <ListContent>
              {
                mapping.map((warning, index) => (
                  <li key={ index }>
                    <div className="media">
                      <div className="media-left">
                        <Icon
                          className="media-object"
                          color={ color.brand.warning }
                          name="warning"
                        />
                      </div>
                      <div className="media-body">
                        <Title type="h4">{ this.getWarningMessage(warning) }</Title>
                        <HelpBlock className="help-block">
                          { this.getWarningHelpText(warning) }
                        </HelpBlock>
                      </div>
                    </div>
                  </li>
                )).toArray()
              }
            </ListContent>
          </Section>
        }

        {
          (filters.isEmpty() || mappingOnly) && (mapping.isEmpty() || filtersOnly)
            && <div className="media">
              <div className="media-left">
                <Icon
                  className="media-object"
                  color={ color.brand.primary }
                  name="check-circle"
                />
              </div>
              <div className="media-body">
                You're all set here!
              </div>
            </div>
        }
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  container: getContainer(state, ownProps),
  filters: getFiltersSideWarnings(state, ownProps),
  mapping: getMappingSideWarnings(state, ownProps),
  otherContainer: getContainer(state, ownProps, true),
  otherProvider: getProvider(state, ownProps, true),
  provider: getProvider(state, ownProps),
});

export default connect(mapStateToProps)(WarningList);



// WEBPACK FOOTER //
// ./src/containers/WarningList/WarningList.jsx