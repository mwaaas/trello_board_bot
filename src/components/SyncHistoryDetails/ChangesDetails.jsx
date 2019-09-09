import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map, List } from 'immutable';
import styled from 'styled-components';


const Operation = styled.div`
  margin-bottom: 12px;
  text-transform: capitalize;
`;


export default class ChangesDetails extends Component {
  static propTypes = {
    sync: PropTypes.instanceOf(Map).isRequired,
    termsA: PropTypes.instanceOf(Map).isRequired,
    termsB: PropTypes.instanceOf(Map).isRequired,
  };

  render() {
    const { sync, termsA, termsB } = this.props;
    const isResync = sync.get('resync');

    return (
      <div className="row">
        {
          ['A', 'B'].map(side => (
            <div key={ side } className="col-xs-6">
              {
                sync
                  .getIn(['operations', side])
                  .map((operations, itemName) => {
                    let taskTerm = itemName;
                    if (itemName === 'tasks') {
                      taskTerm = this.props[`terms${side}`].getIn(['task', 'plural'], itemName);
                    }

                    let operationsQty = operations;
                    // Only display errors in resync
                    if (isResync) {
                      operationsQty = operations.filter((qty, operationName) => operationName === 'errors');
                    }

                    return (
                      <Operation key={ itemName }>
                        <strong>{ taskTerm }: </strong>
                        <div>
                          {
                            operationsQty
                              .map((qty, operationName) => (`${operationName}: ${qty}`))
                              .toArray()
                              .join('; ')
                          }
                        </div>
                      </Operation>
                    );
                  })
                  .toArray()
              }
            </div>
          ))
        }
        {
          !!sync.get('errorsCount') && (
            <div className="col-xs-12 sync-history-item__errors">
              <strong>Errors:</strong>
              <ul>
                {
                  sync
                    .get('errorDetails', List())
                    .map((errorDetail, index) => {
                      const taskUrlA = errorDetail.getIn(['url', 'A']);
                      const taskUrlB = errorDetail.getIn(['url', 'B']);
                      const taskTermA = termsA.getIn(['task', 'singular']);
                      const taskTermB = termsB.getIn(['task', 'singular']);

                      return (
                        <li key={ index }>
                          <div>
                            {
                              taskUrlA && (
                                <span className="sync-history-item__error-message">
                                  <a href={ taskUrlA }>{ taskTermA }</a> could not be synced.
                                </span>
                              )
                            }
                            {
                              taskUrlB && (
                                <span className="sync-history-item__error-message">
                                  <a href={ taskUrlB }>{ taskTermB }</a> could not be synced.
                                </span>
                              )
                            }
                          </div>
                          {
                            errorDetail.get('message') && (
                              <span className="sync-history-item__error-reason">
                                <em>Reason:</em> { errorDetail.get('message') }
                              </span>
                            )
                          }
                        </li>
                      );
                    })
                    .toArray()
                }
              </ul>
            </div>
          )
        }
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/SyncHistoryDetails/ChangesDetails.jsx