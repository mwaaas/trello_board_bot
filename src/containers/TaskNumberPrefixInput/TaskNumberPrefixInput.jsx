import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';

import { fieldActions } from '../../actions';
import {
  Button, Icon, TaskNumberPrefixAdd, ToggleFormInput,
} from '../../components';
import { getFieldValues, isLoadingFieldValues } from '../../reducers';
import './TaskNumberPrefixInput.scss';


class TaskNumberPrefixInput extends Component {
  static propTypes = {
    className: PropTypes.string.isRequired,
    containerSide: PropTypes.oneOf(['A', 'B']).isRequired,
    getContainersTaskTypes: PropTypes.func.isRequired,
    input: PropTypes.object.isRequired,
    isLoading: PropTypes.bool.isRequired,
    meta: PropTypes.object,
    pcdOption: PropTypes.instanceOf(Map).isRequired,
    placeholder: PropTypes.string.isRequired,
    taskTypes: PropTypes.instanceOf(Map).isRequired,
  };

  state = {
    lastExistingPrefix: Map(),
  };

  componentDidMount() {
    const {
      taskTypes, getContainersTaskTypes, isLoading, pcdOption, input,
    } = this.props;

    this.setState({
      lastExistingPrefix: input.value || pcdOption.get('default'),
    });

    if (taskTypes.isEmpty() && !isLoading) {
      getContainersTaskTypes();
    }
  }

  onToggleClick = (event) => {
    const { input } = this.props;

    if (event.target && event.target.checked) {
      input.onChange(this.state.lastExistingPrefix);
    } else {
      this.setState({ lastExistingPrefix: input.value });
      input.onChange(null);
    }
  }

  onAddPrefix = (taskType, prefix) => {
    const { input } = this.props;
    const newValue = input.value.set(taskType.id, prefix);
    input.onChange(newValue);
  }

  onChangePrefix = taskType => (event) => {
    const { input } = this.props;
    const newValue = input.value.set(taskType, event.target.value);
    input.onChange(newValue);
  }

  onDeletePrefix = taskType => () => {
    const { input } = this.props;
    const newValue = input.value.delete(taskType);
    input.onChange(newValue);
  }

  render() {
    const {
      containerSide,
      helpText,
      input,
      label,
      pcdOption,
      taskTypes,
    } = this.props;

    return (
      <div className="task-number-prefix-input">
        <ToggleFormInput
          helpText={ helpText }
          label={ label }
          input={{ ...input, onChange: this.onToggleClick }}
        />
        {
          input.value && !input.value.isEmpty()
          && <div className="task-number-prefix-input__edit">
            {
              input.value.entrySeq().map(([issueType, issuePrefix]) => (
                <div key={ issueType } className="task-number-prefix-item">
                  <div className="task-number-prefix-item__issue-type">
                    { taskTypes.getIn([issueType, 'displayName'], issueType) }
                  </div>
                  <input
                    type="text"
                    defaultValue={ issuePrefix }
                    onChange={ this.onChangePrefix(issueType) }
                    className="form-control task-number-prefix-item__prefix"
                  />
                  {
                    issueType !== 'default'
                    && <Button
                      className="task-number-prefix-item__remove"
                      btnStyle="link"
                      onClick={ this.onDeletePrefix(issueType) }
                      size="xs"
                      title="Remove"
                    >
                      <Icon name="trash" />
                    </Button>
                  }
                  <div className="help-block">
                    Preview: <i>{issuePrefix}1234 - My title</i>
                  </div>
                </div>
              )).toArray()
            }
            <TaskNumberPrefixAdd
              containerSide={ containerSide }
              onAddPrefix={ this.onAddPrefix }
              pcdOption={ pcdOption }
              input={ input }
            />
          </div>
        }
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const otherSide = ownProps.containerSide === 'A' ? 'B' : 'A';

  return {
    taskTypes: getFieldValues(state, {
      ...ownProps,
      fieldId: ownProps.pcdOption.get('field'),
      containerSide: otherSide,
    }, true),
    isLoading: isLoadingFieldValues(state),
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  getContainersTaskTypes: () => {
    const {
      containerSide,
      pcdOption,
      kind,
    } = ownProps;
    const otherSide = containerSide === 'A' ? 'B' : 'A';
    dispatch(fieldActions.fetchFieldValues({ containerSide: otherSide, fieldId: pcdOption.get('field'), kind }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(TaskNumberPrefixInput);



// WEBPACK FOOTER //
// ./src/containers/TaskNumberPrefixInput/TaskNumberPrefixInput.jsx