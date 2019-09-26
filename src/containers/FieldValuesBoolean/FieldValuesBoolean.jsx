import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';
import classnames from 'classnames';

import { RadioButton, RadioButtonGroup } from '../../components';
import { formUtils } from '../../utils';
import { fontWeight } from '../../theme';


const Label = styled.label`
  font-weight: ${fontWeight.medium};
  margin-bottom: 8px;
`;


class FieldValueBoolean extends Component {
  static propTypes = {
    labelFalse: PropTypes.string,
    labelTrue: PropTypes.string,
    helpText: PropTypes.string,
    input: PropTypes.object.isRequired,
    label: PropTypes.string,
  }

  static defaultProps = {
    labelTrue: 'True',
    labelFalse: 'False',
  }

  componentDidMount() {
    const { input } = this.props;

    if (formUtils.isEmpty(input.value)) {
      input.onChange(true);
    }
  }

  handleOnChange = (selectedValue) => {
    const { input } = this.props;
    input.onChange(selectedValue);
  }

  render() {
    const {
      labelFalse,
      labelTrue,
      className,
      helpText,
      input,
      label,
    } = this.props;
    const classNames = classnames('field-values-boolean', className);

    return (
      <div className={ classNames }>

        { label && <Label htmlFor={ input.name }>{ label }</Label> }

        <RadioButtonGroup
          {...input}
          inline
          onChange={ this.handleOnChange }
        >
          <RadioButton
            inline
            label={ labelTrue }
            value={ true }
          />
          <RadioButton
            inline
            label={ labelFalse }
            value={ false }
          />
        </RadioButtonGroup>

        { helpText && <div className="help-block">{ helpText }</div> }

      </div>
    );
  }
}

export default FieldValueBoolean;



// WEBPACK FOOTER //
// ./src/containers/FieldValuesBoolean/FieldValuesBoolean.jsx