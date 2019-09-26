import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, reset, Field } from 'redux-form';

import { Button, Modal, TextInput } from '../../components';
import { billingActions } from '../../actions';
import { billingTypes } from '../../consts';


export default class AddCouponForm extends Component {
  static propTypes = {
    customerId: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    currentCouponName: PropTypes.string,
  };

  state = {
    isModalOpen: false,
    couponId: null,
  };

  onSubmit = (formData) => {
    const { dispatch, currentCouponName } = this.props;
    const { couponId } = formData;
    if (currentCouponName === couponId) {
      dispatch(reset(billingTypes.COUPON_FORM_NAME));
    } else if (currentCouponName) {
      this.setState({
        isModalOpen: true,
        couponId,
      });
    } else {
      this.addCoupon(couponId);
    }
  }

  closeModal = () => {
    this.setState({
      isModalOpen: false,
      couponId: null,
    });
  }

  replaceCoupon = () => {
    this.addCoupon(this.state.couponId);
    this.closeModal();
  }

  addCoupon = (couponId) => {
    const { dispatch, customerId } = this.props;
    dispatch(billingActions.addCoupon(customerId, couponId));
  }

  render() {
    const {
      currentCouponName, handleSubmit, pristine, submitting,
    } = this.props;

    return (
      <form className="add-coupon-form" onSubmit={ handleSubmit(this.onSubmit) }>
        <Modal
          confirmLabel="Continue"
          isOpen={ this.state.isModalOpen }
          onCancel={ this.closeModal }
          onConfirm={ this.replaceCoupon }
          onRequestClose={ this.closeModal }
          title="Replace coupon?"
        >
          Your coupon <span className="label label-default">{ currentCouponName }</span> will be replaced { ' ' }
          by <span className="label label-default">{ this.state.couponId }</span>.
        </Modal>

        <div className="input-group">
          <Field
            name="couponId"
            component={ TextInput }
            placeholder="Enter your coupon"
            props={{
              id: 'billing-container__coupon-input',
            }}
          />
          <span className="input-group-btn">
            <Button
              btnStyle="dark"
              disabled={ submitting || pristine }
              pullRight
              type="submit"
            >
              Redeem
            </Button>
          </span>
        </div>
      </form>
    );
  }
}
AddCouponForm = reduxForm({ form: billingTypes.COUPON_FORM_NAME })(AddCouponForm)



// WEBPACK FOOTER //
// ./src/containers/AddCouponForm/AddCouponForm.jsx