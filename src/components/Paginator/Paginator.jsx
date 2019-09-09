import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Range } from 'immutable';

import { Button, Icon } from '../';
import './Paginator.scss';


export default class Paginator extends Component {
  static propTypes = {
    numPages: PropTypes.number.isRequired,
    maxPages: PropTypes.number,
    onChangePage: PropTypes.func,
  };

  static defaultProps = {
    maxPages: 5,
  };

  state = {
    page: 1,
    paginatorIndex: 0,
  };

  componentWillReceiveProps(nextProps) {
    const { numPages } = this.props;

    if (numPages !== nextProps.numPages) {
      this.setState({ page: 1, paginatorIndex: 0 });
    }
  }

  onPageClick = page => () => {
    const { onChangePage } = this.props;

    if (onChangePage) {
      onChangePage(page);
    }

    this.setState({ page });
  }

  onArrowClick = paginatorIndex => () => {
    const { maxPages } = this.props;
    const firstPageOfPaginator = maxPages * paginatorIndex + 1;

    this.setState({ paginatorIndex });
    this.onPageClick(firstPageOfPaginator)();
  }

  getPageRange = () => {
    const { numPages, maxPages } = this.props;
    const { paginatorIndex } = this.state;

    if (numPages < maxPages) {
      return Range(1, numPages + 1).toArray();
    }

    const start = paginatorIndex * maxPages + 1;
    const end = (paginatorIndex + 1) * maxPages + 1;

    return Range(start, Math.min(end, numPages + 1)).toArray();
  }

  render() {
    const { maxPages, numPages } = this.props;
    const { page, paginatorIndex } = this.state;
    const indexes = this.getPageRange();

    const isLastPaginatorPage = numPages - maxPages * (paginatorIndex + 1) < 1;

    return (
      <div className="row paginator">
        <div className="text-center">
          <Button
            btnStyle="subtleLink"
            disabled={ paginatorIndex === 0 }
            onClick={ this.onArrowClick(paginatorIndex - 1) }
            size="sm"
          >
            <Icon name="chevron-circle-left" />
          </Button>
          {
            indexes.map(index => (
              <Button
                key={ index }
                btnStyle={ page === index ? 'secondary' : 'subtleLink' }
                onClick={ this.onPageClick(index) }
                size="sm"
              >
                { index }
              </Button>
            ))
          }
            <Button
              btnStyle="subtleLink"
              disabled={ isLastPaginatorPage }
              onClick={ this.onArrowClick(paginatorIndex + 1) }
              size="sm"
            >
              <Icon name="chevron-circle-right" />
            </Button>
        </div>
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/Paginator/Paginator.jsx