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
     static propTypes = {
         isLoading: PropTypes.bool.isRequired,
         linkList: PropTypes.instanceOf(List).isRequired,
         multisyncList: PropTypes.instanceOf(List).isRequired,
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

            </Content>
        );
    };
}



const mapStateToProps = state => ({
    userFullName: "Francis Mwangi",
    isLoading: false,
    linkList: List(),
    multisyncList: List(),
});

const mapDispatchToProps = dispatch => ({
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SyncList));
