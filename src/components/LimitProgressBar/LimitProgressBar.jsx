import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';
import classnames from 'classnames';

import { organizationTypes, routes } from '../../consts';
import {
  Href,
  IconHoverTooltip,
  Title,
} from '../../components';
import { color } from '../../theme';

const ProgressBar = styled.div`
  height: 12px;
  margin-bottom: 0;
  margin-top: 8px;

  .progress-bar {
    background-color: ${color.brand.lightPurple};
  }

  .progress-bar-danger {
    background-color: ${color.brand.lightRed};
  }
`;

export default class LimitProgressBar extends Component {
  static propTypes = {
    helpText: PropTypes.string,
    limitName: PropTypes.string.isRequired,
    limitValue: PropTypes.number,
    currentValue: PropTypes.number,
    organizationId: PropTypes.string,
    showDetailsLink: PropTypes.bool,
    trackEvent: PropTypes.func,
  };

  render() {
    const {
      helpText,
      limitName,
      limitValue,
      currentValue,
      organizationId,
      showDetailsLink,
      trackEvent,
    } = this.props;

    const limitPercentage = Number.parseInt(currentValue / limitValue * 100, 10) || 0;
    const isOverLimit = limitPercentage >= 100;

    return (
      <div>
        <div className="clearfix">
          <Title type="h5">
            { limitName }
            { ' ' }
            {
              helpText
              && <IconHoverTooltip placement="top">
                { helpText }
              </IconHoverTooltip>
            }
          </Title>
        </div>

        {
          !Number.isNaN(limitValue) && (
            <ProgressBar className="progress">
              <div
                className={ classnames('progress-bar', { 'progress-bar-danger': isOverLimit }) }
                role="progressbar"
                aria-valuenow={ limitPercentage }
                aria-valuemin="0"
                aria-valuemax="100"
                style={{ width: `${limitPercentage}%` }}
              >
                <span className="sr-only">{ limitPercentage }% Complete</span>
              </div>
            </ProgressBar>
          )
        }

        <div className="clearfix">
          <span className={ classnames({ 'pull-right': !Number.isNaN(limitValue) }) }>
            <strong>{ currentValue }</strong>{ !Number.isNaN(limitValue) && ` / ${limitValue}` }
          </span>
        </div>

        {
          showDetailsLink
          && <div className="clearfix">
            <Href
              className={ classnames({ 'pull-right': !Number.isNaN(limitValue) }) }
              onClick={() => trackEvent(
                isOverLimit
                  ? organizationTypes.EVENTS.USER_CLICKED_BILLING_GAUGE_UPGRADE_NOW
                  : organizationTypes.EVENTS.USER_CLICKED_BILLING_GAUGE_SEE_DETAILS,
              )}
              to={ `${routes.ABSOLUTE_PATHS.ORGANIZATIONS}/${organizationId}/billing` }
            >
              { isOverLimit ? 'Upgrade now' : 'See details' }
            </Href>
          </div>
        }
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/LimitProgressBar/LimitProgressBar.jsx