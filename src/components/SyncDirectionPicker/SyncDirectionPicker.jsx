import React, { Component } from 'react';
import styled from 'styled-components';
import { Button, Icon, Tooltip } from '../../components';
import PropTypes from 'prop-types';
import { color } from '../../theme';

import { fieldTypes } from '../../consts';

const BtnGroup = styled.div`
  .btn {
    margin-left: 5px;
    margin-right: 5px;
  }
`;

export default class SyncDirectionPicker extends Component {
  // Button component's props can be added as needed
  static propTypes = {
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
    btnStyle: PropTypes.oneOf([...Object.keys(color.brand), 'subtleLink']),
    onClick: PropTypes.func,
    selectedTarget: PropTypes.oneOf(Object.values(fieldTypes.TARGET)),
    displayToolTip: PropTypes.func,
  }

  static defaultProps = {
    size: 'md',
    btnStyle: 'primary',
    onClick: () => null,
    selectedTarget: 'both',
    displayToolTip: null,
  }

  state = {
    tooltipToShow: null,
  };

  handleMouseOver = (target) => {
    this.setState({ tooltipToShow: target });
  }

  handleMouseOut = () => {
    this.setState({ tooltipToShow: null });
  }

  isDirectionSelected = (target) => {
    const { selectedTarget } = this.props;
    return selectedTarget === target;
  }

  render() {
    const {
      size,
      btnStyle,
      onClick,
      displayToolTip,
    } = this.props;

    const { tooltipToShow } = this.state;

    return (
      <BtnGroup className="text-center">
        {
          // Display icons in this order
          ['both', 'B', 'A'].map((target) => {
            let iconName;

            switch (target) {
              case fieldTypes.TARGET.A: {
                iconName = 'long-arrow-left';
                break;
              }

              case fieldTypes.TARGET.B: {
                iconName = 'long-arrow-right';
                break;
              }

              case fieldTypes.TARGET.BOTH:
              default: {
                iconName = 'exchange';
              }
            }

            return (
              <Button
                key={ target }
                size={ size }
                btnStyle={ this.isDirectionSelected(target) ? btnStyle : 'linkHoverWithBorder' }
                onClick={ () => onClick(target) }
                onMouseOver={ () => this.handleMouseOver(target) }
                onMouseOut={ this.handleMouseOut }
                color={ color.brand.dark }
                ref={ target }
              >
                <Icon name={ iconName } />
              </Button>
            );
          })
        }

        {
          displayToolTip
            && <Tooltip placement="top" show={ !!tooltipToShow } target={ this.refs[tooltipToShow] }>
            { displayToolTip(tooltipToShow) }
          </Tooltip>
        }
      </BtnGroup>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/SyncDirectionPicker/SyncDirectionPicker.jsx