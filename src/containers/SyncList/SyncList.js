import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import styled from 'styled-components';
import {
    Title,
    Subheading,
    Card,
    Href,
    // MultisyncList
} from '../../components'

const Content = styled.div`
  background: white;
  min-height: calc(100vh - 66px);
  padding: 4em 6em;
`;

const SyncItems = styled.div`
  margin-top: 3em;
`;

 class SyncList extends Component {
     renderSyncs = () => {
         const {
             multiSyncList,
             syncsByMultiSyncId
         } = this.props;


    if ( multiSyncList.isEmpty()) {
      return (
        <Card className="link-list link-list--empty text-center">
          <Subheading>
            Don't know where to start? Have a look at our { ' ' }
            <Href
              href="http://comming_soon"
              data-test="header__btn--help"
            >
              User guide
            </Href>.
            <br />
            Or get started by adding your first sync.
          </Subheading>
        </Card>
      );
    }

    // return (
    //   <div>
    //     <MultisyncList
    //       multisyncList={ multiSyncList }
    //       syncsByMultisyncId={ syncsByMultiSyncId }
    //     />
    //   </div>
    //
    // );
  };
     render() {
        const {
            userFullName
        } = this.props;
        return (
            <Content className="sync-list container">
                <Title type="h1">
                    <strong>Welcome</strong> { userFullName }!
                </Title>

                <SyncItems>
                    <Title type="h2">
                        Your syncs
                    </Title>
                </SyncItems>

                { this.renderSyncs() }

            </Content>
        );
    };
}



const mapStateToProps = state => ({
  userFullName: "Francis Mwangi"
});

const mapDispatchToProps = dispatch => ({
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SyncList));
