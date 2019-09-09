import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map } from 'immutable';
import Popout from 'react-popout';
import moment from 'moment';

import { Title } from '../../components';
import { toLocaleAmount, getPopupTopLeftValues } from '../../utils';


export default class Invoice extends Component {
  static propTypes = {
    invoice: PropTypes.instanceOf(Map).isRequired,
    plans: PropTypes.instanceOf(Map).isRequired,
    customer: PropTypes.instanceOf(Map).isRequired,
    onClose: PropTypes.func.isRequired,
  };

  getDiscount(discount, subtotal) {
    const percentOff = discount.getIn(['coupon', 'percentOff']);
    let amountOff;
    if (percentOff) {
      amountOff = subtotal * percentOff / 100;
    } else {
      amountOff = discount.getIn(['coupon', 'amountOff']);
    }

    return `-${toLocaleAmount(amountOff)}`;
  }

  render() {
    const {
      invoice, plans, customer, onClose,
    } = this.props;
    const width = 930;
    const height = 840;
    const { left, top } = getPopupTopLeftValues(width, height);
    const formattedDate = moment.unix(invoice.get('created')).format('YYYY-MM-DD');

    return (
      <Popout
        url="/templates/invoice.html"
        title={ `Invoice-${formattedDate}` }
        options={ {
          width: `${width}px`, height: `${height}px`, top: `${top}px`, left: `${left}px`,
        } }
        onClosing={ onClose }
      >
        <div className="container-fluid invoice">
          <div className="invoice__header">
            <div className="media">
              <div className="media-left media-middle">
                <img alt="Unito logo" className="invoice__logo" src="/images/logo-color-vertical.svg" width="75" />
              </div>
              <div className="media-body">
                <Title type="h2" className="media-heading">Unito Inc.</Title>
                <address className="invoice__unito-address">
                  3 place Ville-Marie, Suite 400<br/>
                  Montréal (Québec), Canada <br />
                  H3B 2E3<br/>
                  <strong>GST #: </strong> 824064562RC0001 <br/>
                  <strong>QST #: </strong> 1222716078TQ0001 <br/>
                </address>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-xs-12 invoice__client-address">
              <Title type="h3">{ customer.get('email') }</Title>
              <address>
                { invoice.getIn(['charge', 'source', 'name']) }<br/>
                { invoice.getIn(['charge', 'source', 'addressLine1']) }<br/>
                { invoice.getIn(['charge', 'source', 'addressZip']) }, { invoice.getIn(['charge', 'source', 'addressCity']) }<br/>
                { invoice.getIn(['charge', 'source', 'addressState']) } { invoice.getIn(['charge', 'source', 'addressCountry']) }
              </address>
            </div>
          </div>

          <div className="row invoice__table">
            <table className="table">
            <caption>
              <span>Invoice { invoice.get('id') }</span>
              <br/>
              <span>{ formattedDate }</span>
            </caption>
              <thead>
                <tr>
                  <td>Description</td>
                  <td>Start</td>
                  <td>End</td>
                  <td>Price</td>
                </tr>
              </thead>
              <tbody>
              {
                invoice.get('lines').map((line) => {
                  const planName = plans.getIn([line.get('plan'), 'nickname']) || plans.getIn([line.get('plan'), 'name'], '');
                  return (
                    <tr key={ line.get('id') }>
                      <td>{ line.get('description') || `Subscription to plan: ${planName}` }</td>
                      <td>{ moment.unix(line.getIn(['period', 'start'])).format('MMM Do, YYYY') }</td>
                      <td>{ moment.unix(line.getIn(['period', 'end'])).format('MMM Do, YYYY') }</td>
                      <td>{ toLocaleAmount(line.get('amount')) }</td>
                    </tr>
                  );
                }).toArray()
              }
              </tbody>
            </table>
          </div>
          <div className="row">
            <div className="col-xs-offset-1 col-xs-2">
              <span>SUBTOTAL</span>
              <br/>
              <Title type="h3">{ toLocaleAmount(invoice.get('subtotal')) }</Title>
            </div>
            <div className="col-xs-2">
              {
                invoice.tax_percent ? (
                  <span>TAXES({ invoice.get('tax_percent', 0) }%)</span>
                ) : (
                  <span>TAXES</span>
                )
              }
              <br/>
              <Title type="h3">{ toLocaleAmount(invoice.get('tax')) }</Title>
            </div>
            <div className="col-xs-2">
              {
                invoice.get('discount')
                && <div className="invoice__discount">
                  DISCOUNT
                  <Title type="h3">{ this.getDiscount(invoice.get('discount'), invoice.get('subtotal')) }</Title>
                </div>
              }
            </div>
            <div className="col-xs-offset-1 col-xs-4">
              <div className="invoice__grand-total">
                TOTAL
                <Title>{ toLocaleAmount(invoice.get('total')) }</Title>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12 text-right">
              <strong>Thank You!</strong> The Unito Team
            </div>
          </div>
        </div>
      </Popout>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/Invoice/Invoice.jsx