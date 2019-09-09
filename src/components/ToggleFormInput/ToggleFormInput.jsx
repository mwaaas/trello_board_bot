import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import styled from 'styled-components';
import Toggle from 'react-toggle';

import { formUtils } from '../../utils';
import { Tooltip } from '../../components';


const HelpBlock = styled.div`
  margin-top: 0;
`;

export default class ToggleFormInput extends Component {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    helpText: PropTypes.string,
    defaultValue: PropTypes.bool,
    input: PropTypes.object.isRequired,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  };

  state = {
    isToggleHovered: false,
  };

  componentWillMount() {
    const { input, defaultValue } = this.props;
    // If the ToggleFormInput does not originate from the form-data (isAutoSync and automapUsers in add sync)
    // Trigger an onChange with the default value so it is added to the form-data
    if (formUtils.isEmpty(input.value) && !!defaultValue) {
      this.props.input.onChange(!!defaultValue);
    }
  }

  handleOnMouseOver = () => {
    this.setState({ isToggleHovered: true });
  }

  handleOnMouseLeave = () => {
    this.setState({ isToggleHovered: false });
  }

  render() {
    const {
      children,
      className,
      disabled,
      helpText,
      input,
      label,
    } = this.props;
    const { isToggleHovered } = this.state;
    const classNames = classnames('toggle-form-input', 'row', className);
    const toggleWrapperClassNames = classnames({ 'toggle-form-input__toggle--help': !!helpText });
    return (
      <div className={ classNames }>
        <div className="col-xs-6 col-md-9">
          <label htmlFor={ input.name } className={ classnames({ disabled }) }>
            { label || children }
          </label>
          {
            helpText
            && <HelpBlock className="help-block">
              { helpText }
            </HelpBlock>
          }
        </div>
        <div className="col-xs-6 col-md-3 text-right">
          <div
            className={ toggleWrapperClassNames }
            onMouseOver={ this.handleOnMouseOver }
            onMouseLeave={ this.handleOnMouseLeave }
          >
            <Toggle
              checked={ !!input.value }
              disabled={ !!disabled }
              id={ input.name }
              name={ input.name }
              onChange={ input.onChange }
              ref='autosync'
              data-test='dashboard__btn--autosync'
            />
            <Tooltip
              show={ isToggleHovered }
              target={ this.refs.autosync }
            >
              Activating auto-sync will allow Unito to sync changes based on your plan speed.
              By deactivating auto-sync, changes will no longer sync automatically.
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/ToggleFormInput/ToggleFormInput.jsx