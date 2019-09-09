import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Card, Icon } from '../../components';
import { color } from '../../theme';


export default class CouponInfo extends Component {
  static propTypes = {
    couponName: PropTypes.string,
  };

  render() {
    const { couponName } = this.props;
    return (
      <div>
      {
        couponName
        && <Card padding="1em 2em" color={ color.brand.primary } lighten>
          {
            !!couponName && (
              <div>
                <Icon name="info-circle" /> Coupon <strong>{couponName}</strong> has been added and will be applied to your subscription.
              </div>
            )
          }
        </Card>
      }
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/CouponInfo/CouponInfo.jsx