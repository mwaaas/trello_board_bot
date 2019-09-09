import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import onClickOutside from 'react-onclickoutside';
import styled from 'styled-components';

import { Icon, Title } from '../../components';
import { color } from '../../theme';


const FormGroup = styled.div`
  margin: 0;
`;

const SyncName = styled.div`
  .title {
    line-height: 38px;
  }

  .fa {
    cursor: pointer;
    margin-left: 8px;
  }
`;

// todo annotation
// @onClickOutside
class SyncNameInput extends Component {
  static propTypes = {
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
  };

  state = {
    isEditingName: false,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.meta.invalid) {
      this.setState({ isEditingName: true });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const element = ReactDOM.findDOMNode(this.refs.input);
    if (element && this.state.isEditingName && !prevState.isEditingName) {
      element.focus();
      element.setSelectionRange(0, element.value.length);
    }
  }

  handleStartEditing = () => {
    this.setState({ isEditingName: true });
  }

  handleClickOutside = () => {
    this.handleDoneEditing();
  }

  handleDoneEditing = () => {
    const { meta } = this.props;
    this.setState({ isEditingName: meta.invalid });
  }

  handleKeyDown = (event) => {
    // 13: Enter key
    // 27: ESC key
    if ([13, 27].includes(event.keyCode)) {
      this.handleDoneEditing();
    }
  };

  render() {
    const { meta, input } = this.props;
    const error = meta.touched && meta.error;

    return (
      <div className="text-center">
        {
          this.state.isEditingName ? (
            <FormGroup className={ classnames('form-group', { 'has-error': error }) }>
              <div className={ classnames({ 'input-group': error }) }>
                { error && <span className="input-group-addon">Required</span> }
                <input
                  {...input}
                  ref="input"
                  className="form-control text-center"
                  onKeyDown={ this.handleKeyDown }
                />
              </div>
            </FormGroup>
          ) : (
            <SyncName>
              <Title
                onClick={ this.handleStartEditing }
                onKeyPress={ this.handleStartEditing }
                title="Click to edit your sync name"
                type="h4"
              >
                { input.value } <Icon name="pencil" color={ color.dark.hint } />
              </Title>
            </SyncName>
          )
        }
      </div>
    );
  }
}
SyncNameInput = onClickOutside(SyncNameInput);
export default SyncNameInput;

// WEBPACK FOOTER //
// ./src/components/SyncNameInput/SyncNameInput.jsx