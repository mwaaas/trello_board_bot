import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import styled from 'styled-components';
import debounce from 'lodash.debounce';

import { containerActions } from '../../actions';
import { Icon, SelectInput, TitleOption } from '../../components';
import {
  getContainers,
  getProviderCapabilitiesByProviderIdentityId,
  isLoadingContainers,
} from '../../reducers';
import { NewProjectModal } from '../../containers';
import { color } from '../../theme';


const DepthLine = styled.span`
  border-bottom: 1px dotted ${color.dark.whisper};
  content: '';
  display: inline-block;
  float: left;
  height: 1px;
  margin-right: ${props => (props['data-depth'] ? '0' : '8px')};
  margin-top: 11px;
  width: ${props => `${(props['data-depth'] - 1) * 16}px`};
`;


const ContainerOption = styled.span`
  padding-left: 8px;
`;

const IconWrapper = styled.div`
  margin-left: 2px;
  margin-right: 2px;
  color: ${color.brand.secondary};
`;


class ContainersSelect extends Component {
  static propTypes = {
    allowCreate: PropTypes.bool,
    containers: PropTypes.instanceOf(Map).isRequired,
    disabledText: PropTypes.string,
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    otherSideContainerId: PropTypes.string,
    placeholder: PropTypes.string,
    terms: PropTypes.instanceOf(Map).isRequired,
    valuesToExclude: PropTypes.array,
  };

  static defaultProps = {
    allowCreate: false,
    disabledText: 'Already synced',
    valuesToExclude: [],
    isReadOnly: false,
  };

  state = {
    showCreateNewContainerModal: false,
  };

  getOptions = () => {
    const {
      allowCreate,
      capabilities,
      containers,
      disabledText,
      input,
      otherSideContainerId,
      valuesToExclude,
    } = this.props;

    const containerOptions = containers
      // We should not be able to select the same container id on side A and B
      .filterNot(container => container.get('id') === otherSideContainerId)
      .map((container) => {
        let disabled = false;
        let details = container.getIn(['warnings', 0], '');

        if (!container.get('selectable')) {
          disabled = true;
          details = container.getIn(['errors', 0], details);
        } else if (
          container.get('conflicting')
          || (container.get('id') !== input.value && valuesToExclude.includes(container.get('id')))
        ) {
          disabled = true;
          details = disabledText;
        }

        const depth = container.get('depth');
        return {
          isWorkspace: depth === 1 && container.has('children'),
          details,
          disabled,
          url: container.get('url'),
          label: container.get('displayName'),
          value: container.get('id'),
          depth,
        };
      }).toList();

    const canCreate = capabilities.getIn(['container', 'create'], false);
    if (allowCreate && canCreate) {
      return [
        { value: 'ADD_NEW_CONTAINER' },
        ...containerOptions.toArray(),
      ];
    }

    return containerOptions.toArray();
  }

  getDebouncedInput = () => {
    const { input, fetchContainers, capabilities } = this.props;
    const inputProps = {
      ...input,
    };
    const isSearchable = capabilities.getIn(['container', 'searchable']);
    if (isSearchable) {
      inputProps.onInputChange = debounce((value) => {
        fetchContainers(value);
      }, 500);
    }
    return inputProps;
  }

  renderOption = (option) => {
    const { terms } = this.props;
    const { isWorkspace, depth } = option;
    if (option.value === 'ADD_NEW_CONTAINER') {
      const containerTerm = terms.getIn(['container', 'singular'], 'project');
      return (
        <div>
          <div className="media">
            <div className="media-left">
              <IconWrapper>
                <Icon name="plus-square-o" className="fa-2x" />
              </IconWrapper>
            </div>
            <div className="media-body">
              Create a new { containerTerm }
            </div>
          </div>
        </div>
      );
    }

    const Option = isWorkspace ? TitleOption : ContainerOption;
    return (
      <Option>
        <DepthLine data-depth={ depth } />
        { option.label } { ' ' }
        { option.details && <span className="text-muted">({ option.details })</span> }
      </Option>
    );
  };

  filterOption = (option, searchString) => {
    if (option.isWorkspace || option.value === 'ADD_NEW_CONTAINER') {
      return true;
    }

    const compareString = `${option.label} ${option.value}`;
    // FIXME: the option.url thing is a hackish fix because the typeahead for jiraserver is on the project key and not project name
    const isSearchStringIncluded = compareString.toLowerCase().includes(searchString.toLowerCase())
      || option.url.split('/').map(item => item.toLowerCase()).includes(searchString.toLowerCase());

    return isSearchStringIncluded;
  }

  handleOnChange = (value) => {
    const { input } = this.props;
    if (value === 'ADD_NEW_CONTAINER') {
      this.openCreateNewContainerModal();
      return;
    }

    input.onChange(value);
  }

  closeCreateNewContainerModal = () => {
    this.setState({ showCreateNewContainerModal: false });
  }

  openCreateNewContainerModal = () => {
    this.setState({ showCreateNewContainerModal: true });
  }

  getFormattedSearchableKeys() {
    const { capabilities } = this.props;
    const searchableKeys = capabilities.getIn(['container', 'searchableOn'], List());
    return searchableKeys.size
      ? searchableKeys.slice(0, -1).join(', ').concat(searchableKeys.size > 1 ? ' or ' : '', searchableKeys.get(-1))
      : 'name';
  }

  render() {
    const {
      allowCreate,
      capabilities,
      containers,
      containerSide,
      fetchContainers,
      input,
      isLoading,
      providerIdentityId,
      terms,
      ...rest
    } = this.props;
    const { showCreateNewContainerModal } = this.state;

    const options = this.getOptions();
    const containerTerm = terms.getIn(['container', 'singular'], 'project');
    const containerPluralTerm = terms.getIn(['container', 'plural'], 'projects');
    const isSearchable = capabilities.getIn(['container', 'searchable']);
    const searchableKeys = isSearchable && this.getFormattedSearchableKeys();
    const noResultsText = isSearchable ? `Start typing the ${searchableKeys} of your ${containerTerm} ...` : 'No result found';
    const dropDownText = isLoading ? `Loading your ${containerPluralTerm}...` : noResultsText;
    const placeholder = this.props.placeholder
      || isSearchable ? `Start typing the ${searchableKeys} of your ${containerTerm} ...` : `Type or select the name of your ${containerTerm}`;

    // todo mwas fix this
    // /* eslint-disable jsx-a11y/no-autofocus */
    return (
      <span>
        <NewProjectModal
          isOpen={ showCreateNewContainerModal }
          containerSide={ containerSide }
          onRequestClose={ this.closeCreateNewContainerModal }
          onSuccess={ input.onChange }
          providerIdentityId={ providerIdentityId }
        />
        <SelectInput
          {...rest}
          allowCreate={ false }
          clearable={ false }
          filterOption={ this.filterOption }
          input={ this.getDebouncedInput() }
          isLoading={ isLoading }
          noResultsText={ dropDownText }
          onChange={ this.handleOnChange }
          onOpen={ isSearchable ? undefined : fetchContainers }
          optionRenderer={ this.renderOption }
          options={ options }
          placeholder={ placeholder }
          searchable
          simpleValue
        />
      </span>
    );
    // todo mwas fix this
    // /* eslint-enable jsx-ally/no-autofocus */
  }
}

const mapStateToProps = (state, ownProps) => ({
  capabilities: getProviderCapabilitiesByProviderIdentityId(state, ownProps, 'capabilities'),
  containers: getContainers(state, ownProps),
  isLoading: isLoadingContainers(state, ownProps),
  terms: getProviderCapabilitiesByProviderIdentityId(state, ownProps, 'terms'),
});

const mapDispatchToProps = (dispatch, { providerIdentityId, containerSide, fieldIndex }) => ({
  fetchContainers: (searchValue) => {
    dispatch(containerActions.getContainers(providerIdentityId, containerSide, fieldIndex, searchValue));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ContainersSelect);



// WEBPACK FOOTER //
// ./src/containers/ContainersSelect/ContainersSelect.jsx