import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map } from 'immutable';
import moment from 'moment';

import { toLocaleAmount } from '../../utils';

import { Button, Invoice } from '../../components';
import './InvoiceListItem.scss';


export default class InvoiceListItem extends Component {
  static propTypes = {
    plans: PropTypes.instanceOf(Map).isRequired,
    invoice: PropTypes.instanceOf(Map).isRequired,
    customer: PropTypes.instanceOf(Map).isRequired,
  };

  state = {
    isPoppedOut: false,
  };

  openInvoice = () => {
    this.setState({ isPoppedOut: true });
  }

  closeInvoice = () => {
    this.setState({ isPoppedOut: false });
  }

  render() {
    const { plans, invoice, customer } = this.props;

    return (
      <div className="invoice-list-item">
        <div className="invoice-list-item__date">
          { moment.unix(invoice.get('created')).format('YYYY-MM-DD') }
        </div>
        <div className="invoice-list-item__amount">
          { toLocaleAmount(invoice.get('total')) }
        </div>
        <div className="invoice-list-item__action">
          {
            invoice.get('paid') ? (
              <Button btnStyle="dark" reverse size="sm" onClick={ this.openInvoice }>
                View invoice
              </Button>
            ) : (
              <Button btnStyle="error" size="sm" disabled>Past due</Button>
            )
          }
        </div>
        {
          this.state.isPoppedOut
          && <Invoice invoice={ invoice }
            plans={ plans }
            customer={ customer }
            onClose={ this.closeInvoice }
          />
        }
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/InvoiceListItem/InvoiceListItem.jsx