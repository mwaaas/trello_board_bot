import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';

import { billingTypes } from '../../consts';
import { fontSize, fontWeight, color } from '../../theme';
import {
  Button,
  Icon,
  IconHoverTooltip,
  Ribbon,
} from '../../components';

import SelectPlanButton from './SelectPlanButton';


const planColors = [color.dark.primary, color.brand.dark, color.brand.secondary, color.dark.subtle];

const Item = styled.div`
  background-color: ${color.light.primary};
  border: 1px solid ${color.dark.secondary};
  flex-basis: ${props => ((props.nbPlans) % 2 === 0 ? '23%' : '31.33%')};
  margin: 10px 1%;
  min-width: 150px;
  position: relative;
  text-align: center;
  border-radius: 12px 12px 0 0;

  &:hover {
    box-shadow: 0 0 16px ${color.dark.hint};
  }
`;


const Features = styled.ul`
  font-size: ${fontSize.small};
  list-style: none;
  margin: 24px 0 ;
  padding: 0 8px;
  text-align: left;

  li {
    border-bottom: 1px solid #ccc;
    margin-top: 5px;
  }
`;

const Tagline = styled.div`
  font-size: ${fontSize.small};
  min-height: 38px;
  padding: 0 4px;
  font-style: italic;
  line-height: 1.5em;
  margin-bottom: 12px;
`;

const Price = styled.div`
  font-size: 50px;
  font-weight: bold;
  line-height: 1em;

  sup {
    font-size: 50%;
    front-weight: normal;
    top: -0.75em;
  }

  sub {
    bottom: 0;
    font-size: 50%;
    front-weight: normal;
  }
`;

const Savings = styled.p`
  color: ${color.brand.primary};
  height: 32px;
`;

const Name = styled.div`
  background-color:  ${props => planColors[props.index] || color.brand.primary};
  color: ${color.light.gray};
  font-size: ${fontSize.h3};
  font-weight: ${fontWeight.medium};
  margin: 0 0 24px 0;
  padding: 12px 4px;
  border-radius: 11px 11px 0 0;
`;


class PlanDetails extends Component {
  static propTypes = {
    coupon: PropTypes.instanceOf(Map),
    hasPaymentSource: PropTypes.bool.isRequired,
    interval: PropTypes.oneOf(Object.values(billingTypes.PLAN_INTERVALS)),
    isCurrentPlan: PropTypes.bool.isRequired,
    nbPlans: PropTypes.number,
    onSelect: PropTypes.func,
    plan: PropTypes.instanceOf(Map).isRequired,
    planIdx: PropTypes.number,
    stripePublishableKey: PropTypes.string,
  };

  static defaultProps = {
    interval: billingTypes.PLAN_INTERVALS.MONTH,
  };

  render() {
    const {
      interval,
      isCurrentPlan,
      nbPlans,
      plan,
      planIdx,
    } = this.props;

    return (
      <Item nbPlans={ nbPlans }>
        <Name index={ planIdx - 1 } >
          { plan.get('nickname') || plan.get('name') }
        </Name>
        {
          // TODO: make the popular plan dynamic
          planIdx === 2
            && <Ribbon>Popular</Ribbon>
        }
        {
          plan.getIn(['metadata', 'tagLine']) && (
            <Tagline>{ plan.getIn(['metadata', 'tagLine']) }</Tagline>
          )
        }
        {
          interval === 'year' ? (
            <div>
              <Price>
                <sup>$</sup>{ plan.get('amount') / 100 / 12 }<sub>/mo</sub>
              </Price>
              <Savings>Save ${ plan.getIn(['metadata', 'yearlySaved']) } a year</Savings>
            </div>
          ) : (
            <Price>
              <sup>$</sup>{ plan.get('amount') / 100 }<sub>/mo</sub>
              <Savings />
            </Price>
          )
        }
        {
          isCurrentPlan ? (
            <Button disabled>
              <Icon name="check-circle" /> Selected
            </Button>
          ) : (
            <SelectPlanButton
              plan={ plan }
              { ...this.props }
            />
          )
        }

        <Features>
          {
            plan.get('features', List()).map(feature => (
              <li key={ feature.get('label') }>
                ✓ { feature.get('label') } {' '}
                <IconHoverTooltip placement="top">
                  { feature.get('helpText') }
                </IconHoverTooltip>
              </li>
            )).toArray()
          }
        </Features>
      </Item>
    );
  }
}

export default PlanDetails;



// WEBPACK FOOTER //
// ./src/containers/PricingContainer/PlanDetails.jsx