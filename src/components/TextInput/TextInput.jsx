import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import styled from 'styled-components';

import { color } from '../../theme';
import { formUtils } from '../../utils';
import Icon from '../Icon/Icon';


const InputGroup = styled.div`
  .input-group-addon {
    background-color: {color.light.primary};
    border-right: 0;
  }

  .form-control {
    border-left: 0;
  }
`;

const Input = styled.input`
  border-radius: 2px;

  &:focus {
    outline-color: ${color.brand.accent};
  }

  &&&::placeholder {
    color: #aaa;
    font-weight: 400;
  }
`;

const ErrorMessage = styled.div`
  color: ${color.brand.error};
  // prevents error message from bumping rest down
  margin-bottom: -24px;
`;


export default class TextInput extends Component {
  static propTypes = {
    defaultValue: PropTypes.string,
    helpText: PropTypes.string,
    iconProps: PropTypes.object,
    input: PropTypes.object.isRequired,
    inputClassName: PropTypes.string,
    label: PropTypes.node,
    maxLength: PropTypes.number,
    meta: PropTypes.object,
    subLabel: PropTypes.string,
  };

  static defaultProps = {
    meta: {},
  };

  componentDidMount() {
    const { defaultValue, input } = this.props;
    if (defaultValue && formUtils.isEmpty(input.value)) {
      input.onChange(defaultValue);
    }
  }

  render() {
    const {
      defaultValue,
      helpText,
      input,
      inputClassName,
      label,
      maxLength,
      meta,
      iconProps,
      subLabel,
      ...rest
    } = this.props;
    const error = meta.error || meta.asyncError;
    const classNames = classnames('form-group', { 'has-error': meta.touched && error });

    const inputField = iconProps
      ? (
        <InputGroup className="input-group">
          <span className="input-group-addon">
            <Icon {...iconProps} />
          </span>
          <Input
            {...rest}
            {...input}
            id={ input.name }
            className={ classnames('form-control', inputClassName) }
            maxLength={ maxLength }
          />
        </InputGroup>
      ) : (
        <Input
          {...rest}
          {...input}
          id={ input.name }
          className={ classnames('form-control', inputClassName) }
          maxLength={ maxLength }
        />
      );

    return (
      <div className={ classNames }>
        { label && <label htmlFor={ input.name }>{ label }</label> }
        { subLabel && <p>{ subLabel }</p> }
        { inputField }
        { helpText && <div className="help-block">{ helpText }</div> }
        { error && <ErrorMessage>{ error }</ErrorMessage> }
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/TextInput/TextInput.jsx