import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { routes } from '../../consts';
import {
    Title,
    Subheading,
    Card,
    Href,
    LinkList,
    LinkItemLoading,
    MultisyncList
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
     static propTypes = {
         embedName: PropTypes.string.isRequired,
         isLoading: PropTypes.bool.isRequired,
         linkList: PropTypes.instanceOf(List).isRequired,
         multisyncList: PropTypes.instanceOf(List).isRequired,
         isSiteAdmin: PropTypes.bool,
         userId: PropTypes.string.isRequired,
     };

     renderSyncs = () => {
         const {
             isLoading,
             linkList,
             multisyncList,
             isSiteAdmin,
             userId,
             syncsByMultisyncId,
             embedName
    } = this.props;

    if (isLoading) {
      return (
        <div>
          <LinkItemLoading />
          <LinkItemLoading />
          <LinkItemLoading />
          <LinkItemLoading />
        </div>
      );
    }

    if (linkList.isEmpty() && multisyncList.isEmpty()) {
      return (
        <Card className="link-list link-list--empty text-center">
          <Subheading>
            Don't know where to start? Have a look at our { ' ' }
            <Href
              href={ routes.HELP_PATHS.UNITO_HELP_URL }
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

    return (
      <div>
        <MultisyncList
          multisyncList={ multisyncList }
          syncsByMultisyncId={ syncsByMultisyncId }
          isSiteAdmin={ isSiteAdmin }
          userId={ userId }
        />
        <LinkList
          embedName={ embedName }
          isSiteAdmin={ isSiteAdmin }
          linkList={ linkList }
          userId={ userId }
        />
      </div>

    );
  };

     render() {
        const {
            linkList,
            multisyncList,
            isLoading,
            userFullName
        } = this.props;
        return (
            <Content className="sync-list container">
                <Title type="h1">
                    <strong>Welcome</strong> { userFullName }!
                </Title>

                {linkList.isEmpty() && multisyncList.isEmpty() && !isLoading && (
                    <Subheading>
                        Don’t know where to start? Have a look at our { ' ' }
                        <Href
                            href={ routes.HELP_PATHS.UNITO_HELP_URL }
                            data-test="header__btn--help"
                        >
                            User guide
                        </Href>.
                    </Subheading>
                )
                }
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
    userFullName: "Francis Mwangi",
    isLoading: false,
    linkList: List(),
    multisyncList: List(),
    userId: "mwaside",
    isSiteAdmin: false,
    syncsByMultisyncId: "213",
    embedName: 'trello'
});

const mapDispatchToProps = dispatch => ({
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SyncList));
