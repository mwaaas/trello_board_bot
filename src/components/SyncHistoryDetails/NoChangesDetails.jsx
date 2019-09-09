import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { List } from 'immutable';
import moment from 'moment';
import styled from 'styled-components';

import {
  fontFamily, fontSize, fontWeight, lineHeight,
} from '../../theme';
import { Button } from '../../components';


const Title = styled.div`
  font-family: ${fontFamily.secondary};
  font-size: ${fontSize.h2};
  line-height: ${lineHeight.h2};
`;

const SyncIds = styled.div`
  margin-bottom: 12px;
  margin-left: 8px;
`;

const Timestamp = styled.div`
  font-weight: ${fontWeight.medium};
  margin-right: 16px;
  display: inline-block;
`;


export default class NoChangesDetails extends Component {
  static propTypes = {
    syncs: PropTypes.instanceOf(List).isRequired,
  };

  state = {
    displayCount: 12,
  };

  displayMoreSyncs = () => {
    const displayCount = this.state.displayCount + 12;
    this.setState({ displayCount });
  }

  render() {
    const { syncs } = this.props;

    return (
      <div>
        <Title>Sync Ids</Title>
        <SyncIds>
          {
            syncs
              .filter((sync, index) => index < this.state.displayCount)
              .map(sync => (
                <div key={ sync.get('id') }>
                  <Timestamp>
                    { moment(sync.get('endTime')).format('MMM Do, HH:mm:ss') }
                  </Timestamp>
                  { sync.get('id') }
                </div>
              ))
              .toArray()
          }
        </SyncIds>

        {
          this.state.displayCount < syncs.size
            && <Button btnStyle="link" onClick={ this.displayMoreSyncs }>
              Display more...
            </Button>
        }
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/SyncHistoryDetails/NoChangesDetails.jsx