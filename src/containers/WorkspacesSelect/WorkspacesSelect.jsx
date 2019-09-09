import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';

import { containerActions } from '../../actions';
import { SelectInput } from '../../components';
import {
  getWorkspaces,
  getProviderCapabilitiesByProviderIdentityId,
} from '../../reducers';
import { formUtils } from '../../utils';


class WorkspacesSelect extends Component {
  static propTypes = {
    label: PropTypes.string,
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    simpleValue: PropTypes.bool,
    terms: PropTypes.instanceOf(Map).isRequired,
    workspaces: PropTypes.instanceOf(Map).isRequired,
    workspaceIdsToDisable: PropTypes.arrayOf(PropTypes.string),
  };

  static defaultProps = {
    simpleValue: true,
    workspaceIdsToDisable: [],
  };

  state = {
    isLoading: false,
  };

  componentDidMount() {
    if (!formUtils.isEmpty(this.props.input.value)) {
      this.fetchWorkspaces();
    }
  }

  fetchWorkspaces = async () => {
    this.setState({ isLoading: true });
    await this.props.fetchWorkspaces();
    this.setState({ isLoading: false });
  }

  getOptions = () => {
    const { workspaces, workspaceIdsToDisable } = this.props;

    return workspaces
      .map(workspace => ({
        label: workspace.get('displayName'),
        value: workspace.get('id'),
        disabled: workspaceIdsToDisable.includes(workspace.get('id')),
      }))
      .toArray();
  };

  getPlaceholder() {
    const { terms } = this.props;
    const { isLoading } = this.state;
    const workspacePluralTerm = terms.getIn(['workspace', 'plural'], '');
    const workspaceTerm = terms.getIn(['workspace', 'singular']);

    if (isLoading) {
      return `Loading your ${workspacePluralTerm}...`;
    }

    if (terms.isEmpty()) {
      return '';
    }

    return `Type or select the name of your ${workspaceTerm}`;
  }

  render() {
    const {
      terms,
      input,
      simpleValue,
      ...rest
    } = this.props;
    const { isLoading } = this.state;
    const options = this.getOptions();
    const workspaceTerm = terms.getIn(['workspace', 'singular']);
    const workspacePluralTerm = terms.getIn(['workspace', 'plural']);
    const noResultsText = isLoading ? `Loading your ${workspacePluralTerm}...` : 'No result found';
    const placeholder = this.getPlaceholder();
    const label = this.props.label || `Project ${workspaceTerm}`;

    // todo mwas fix this
    // /* eslint-disable jsx-a11y/no-autofocus */
    return (
      <SelectInput
        {...rest}
        clearable={false}
        input={input}
        isLoading={isLoading}
        label={label}
        noResultsText={noResultsText}
        onOpen={this.fetchWorkspaces}
        options={options}
        placeholder={placeholder}
        simpleValue={ simpleValue }
      />
    );
    // todo mwas fix this
    // /* eslint-enable jsx-ally/no-autofocus */
  }
}

const mapStateToProps = (state, ownProps) => ({
  workspaces: getWorkspaces(state, ownProps),
  terms: getProviderCapabilitiesByProviderIdentityId(state, ownProps, 'terms'),
});

const mapDispatchToProps = (dispatch, { providerIdentityId, containerSide }) => ({
  fetchWorkspaces: () =>
    dispatch(containerActions.getWorkspaces(providerIdentityId, containerSide)),
});

export default connect(mapStateToProps, mapDispatchToProps)(WorkspacesSelect);



// WEBPACK FOOTER //
// ./src/containers/WorkspacesSelect/WorkspacesSelect.jsx