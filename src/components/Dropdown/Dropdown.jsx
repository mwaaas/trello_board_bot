import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import onClickOutside from 'react-onclickoutside';
import styled from 'styled-components';

import { Href, Icon } from '../';
import { color, fontSize } from '../../theme';
import './Dropdown.scss';

export const DropdownDivider = () => (
  <li role="separator" className="divider" />
);

export const DropdownItem = ({
  children,
  href,
  onClick,
  to,
  ...rest
}) => {
  const needsHref = to || href || onClick;

  if (!needsHref) {
    return (
      <li data-test={rest['data-test']} className="dropdown-header">
        {children}
      </li>
    );
  }

  return (
    <li>
      <Href to={to} href={href} data-test={rest['data-test']} onClick={onClick}>
        {children}
      </Href>
    </li>
  );
};

const Subtitle = styled.div`
  color: ${color.dark.secondary};
  font-size: ${fontSize.small};
`;

export class DropdownHeader extends Component {
  static propTypes = {
    onClick: PropTypes.func,
    title: PropTypes.node,
    subtitle: PropTypes.node,
  };

  render() {
    const {
      children,
      subtitle,
      title,
      onClick,
    } = this.props;

    const MediaElement = children ? Href : 'div';
    const classNames = classnames({ 'dropdown-header': !children });

    return (
      <li
        onClick={onClick}
        onKeyDown={onClick}
        className={classNames}
      >
        <MediaElement className="media">
          <div className="media-body">
            <strong>{ title }</strong>
            <Subtitle>{ subtitle }</Subtitle>
          </div>
          {children && (
            <div className="media-right media-middle">
              <div className="media-object">
                <Icon name="chevron-right" style={{ marginLeft: '.5rem' }} />
              </div>
            </div>
          )}
        </MediaElement>
      </li>
    );
  }
}

// todo annotation
// @onClickOutside
class Dropdown extends Component {
  static propTypes = {
    'data-test': PropTypes.string,
    alignRight: PropTypes.bool,
    btnContent: PropTypes.node,
    button: PropTypes.element,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    isOpen: PropTypes.bool,
  };

  static defaultProps = {
    alignRight: false,
    disabled: false,
    tag: 'div',
  };

  state = {
    activeChild: null,
    isOpen: false,
  };

  isActive = () => {
    if (this.props.isOpen !== undefined) {
      return this.props.isOpen;
    }

    return this.state.isOpen;
  };

  handleClickOutside = () => {
    this.close();
  };

  open = () => {
    const { disabled } = this.props;
    if (disabled) {
      return;
    }

    this.setState({ isOpen: true });
  };

  close = () => {
    this.setState({ isOpen: false, activeChild: null });
  };

  toggle = () => {
    const { disabled } = this.props;
    if (disabled) {
      return;
    }

    const isOpen = this.isActive();
    if (isOpen) {
      this.close();
      return;
    }

    this.open();
  };

  renderSubDropdown = (children) => {
    const { activeChild } = this.state;
    const dropdownParent = children[activeChild];
    const backButton = (
      <DropdownItem key={ `${dropdownParent.key}-back` } onClick={() => this.setState({ activeChild: null })}>
        <Icon name="chevron-left" style={{ marginLeft: '-1rem' }}/> <strong>{ dropdownParent.props.subtitle }</strong>
      </DropdownItem>
    );

    const dropdown = dropdownParent.props.children;
    return [
      backButton,
      ...dropdown.props.children,
    ];
  }

  renderChildren = () => {
    const { children } = this.props;
    const { activeChild } = this.state;

    // Remove children that are not dropdown items
    const childrenArray = React.Children.toArray(children)
      .filter(child => ![null, false, undefined].includes(child));

    if (activeChild) {
      return this.renderSubDropdown(childrenArray);
    }

    return childrenArray.map((child, index) => {
      const hasDropdownChild = (child.type === DropdownHeader)
        && (React.Children.count(child.props.children) === 1);

      const hasOnClick = child.props.onClick || hasDropdownChild;
      return React.cloneElement(child, {
        onClick: hasOnClick ? (event) => {
          child.props.onClick && child.props.onClick(event);
          if (hasDropdownChild) {
            this.setState({ activeChild: index });
          } else {
            this.toggle();
          }
        } : undefined,
      });
    });
  };

  render() {
    const {
      alignRight,
      btnContent,
      button,
      className,
      tag,
      'data-test': dataTest,
    } = this.props;
    const dropdownClasses = classnames('dropdown', className, 'btn-group', {
      open: this.isActive(),
    });
    const dropdownListClasses = classnames('dropdown-menu', { 'dropdown-menu-right': alignRight });
    const buttonProps = {
      onClick: this.toggle,
      onKeyDown: this.toggle,
      type: 'menu',
    };
    const Element = tag;

    return (
      <Element data-test={dataTest} className={dropdownClasses} ref="dropdown" role="menu" tabIndex={0}>
        {button ? (
          React.cloneElement(button, buttonProps)
        ) : (
          <Href
            {...buttonProps}
            title="More Options"
            className="dropdown__btn"
            data-test={this.props['data-test']}
          >
            {btnContent || <Icon name="chevron-down" />}
          </Href>
        )}
        <ul className={dropdownListClasses}>
          {this.renderChildren()}
        </ul>
      </Element>
    );
  }
}

Dropdown = onClickOutside(Dropdown);
export default Dropdown;

// WEBPACK FOOTER //
// ./src/components/Dropdown/Dropdown.jsx