import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import styled from 'styled-components';

import { color, fontSize, fontWeight } from '../../theme';

const H1 = styled.h1`
  font-size: ${fontSize.h1};
  font-weight: ${fontWeight.regular};
  letter-spacing: .00735em;
  line-height: 2.5rem;
  margin-bottom: 2rem;
`;

const H2 = styled.h2`
  font-size: ${fontSize.h2};
  font-weight: ${fontWeight.regular};
  letter-spacing: normal;
  line-height: 2rem;
  margin-bottom: .5rem;
`;

const H3 = styled.h3`
  font-size: ${fontSize.h3};
  font-weight: ${fontWeight.medium};
  letter-spacing: .0125em;
  line-height: 2rem;
  margin-bottom: .5rem;
`;

const H4 = styled.h4`
  font-size: ${fontSize.h4};
  margin-bottom: .25rem;
`;

const H5 = styled.h5`
  font-size: ${fontSize.small};
  margin-bottom: 0rem;
`;


const Subtitle1 = styled.h6`
  color: ${color.dark.hint};
  font-size: ${fontSize.h4};
  font-weight: ${fontWeight.regular};
  line-height: 1.75rem;
  letter-spacing: .00937em;
  margin-bottom: .25rem;
  text-transform: uppercase;
`;

const Subtitle2 = styled.h6`
  color: ${color.dark.hint};
  font-size: ${fontSize.h4};
  font-weight: ${fontWeight.regular};
  line-height: 1.75rem;
  letter-spacing: .00937em;
  margin-bottom: .5rem;
`;

const Subtitle3 = styled.h6`
  color: ${color.dark.hint};
  font-size: ${fontSize.subheading};
  font-weight: ${fontWeight.regular};
  line-height: 1.75rem;
  letter-spacing: .00937em;
  margin-bottom: .5rem;
`;

const elements = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  subtitle1: Subtitle1,
  subtitle2: Subtitle2,
  subtitle3: Subtitle3,
};

export default class Title extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    inverse: PropTypes.bool,
    type: PropTypes.oneOf(Object.keys(elements)),
    uppercase: PropTypes.bool,
  };

  static defaultProps = {
    type: 'h1',
    inverse: false,
    uppercase: false,
  }

  render() {
    const {
      children,
      className,
      inverse,
      type,
      uppercase,
      ...rest
    } = this.props;

    const Element = elements[type];
    const classNames = classnames('title', type, className, {
      'title--uppercase': uppercase,
      'title--inverse': inverse,
    });

    return (
      <Element className={ classNames } {...rest}>
        { children }
      </Element>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/Title/Title.jsx