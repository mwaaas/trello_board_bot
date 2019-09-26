import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map } from 'immutable';
import { reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';

import { linkActions } from '../../actions';
import Trackable from '../../components/TrackableHoC/TrackableHoC';
import {
  Button,
  Card,
  ContainerIcon,
  ReconnectProviderIdentity,
  Section,
  Subheading,
  Title,
} from '../../components';
import { OpenIntercomBubble } from '../../containers';
import {
  getCurrentSyncOwner,
  getProvider,
  getUserId,
} from '../../reducers';
import { color } from '../../theme';




class LinkErrorsContainer extends Component {
  static propTypes = {
    linkErrors: PropTypes.instanceOf(Map).isRequired,
    linkName: PropTypes.string.isRequired,
    linkOwner: PropTypes.instanceOf(Map).isRequired,
    providerA: PropTypes.instanceOf(Map).isRequired,
    providerB: PropTypes.instanceOf(Map).isRequired,
    reloadLink: PropTypes.func.isRequired,
    updateProviderIdentity: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
  };

  getHelpMessage = () => {
    const { linkErrors, linkName } = this.props;

    let errors = '';
    linkErrors.get('identities').map((identity) => {
      errors = `${errors + identity.get('errorMessage')}\n`;
      return identity;
    });
    linkErrors.get('containers').map((container) => {
      errors = `${errors + container.get('errorMessage')}\n`;
      return container;
    });
    return `Hello Unito! \n\nMy sync "${linkName}" is disabled and I need your help fixing the following issue(s):\n\n${errors}`;
  }

  render() {
    const {
      linkErrors,
      linkOwner,
      linkName,
      providerA,
      providerB,
      reloadLink,
      updateProviderIdentity,
      userId,
    } = this.props;

    const issuesCount = linkErrors.get('identities').size + linkErrors.get('containers').size;

    return (
      <div className="sync-container__form">
        <Title type="h2">{ linkName }</Title>

        {
          issuesCount > 0
          && <Subheading>
            <Card color={ color.brand.warning }>
              {
                issuesCount === 1
                  ? 'Oh no! There is an issue with your sync. If you want to continue syncing, fix the issue below. '
                  : 'Oh no! There are some issues with your sync. If you want to continue syncing, fix the issues below. '
              }
              <br />
              If you require assistance, <OpenIntercomBubble message={ this.getHelpMessage() }>we are here</OpenIntercomBubble> to help.
            </Card>
          </Subheading>

        }

        {
          linkErrors.get('identities').count() > 0
          && <Section>
            <Title type="h3">Disconnected connectors</Title>
            <Card borderless color={ color.dark.quiet }>
              <div className="row">
                {
                  linkErrors.get('identities').map((providerIdentity, containerSide) => (
                    <Section key={ containerSide } className="col-xs-6 col-xs-offset-3">
                      <Field
                        key={ containerSide }
                        component={ ReconnectProviderIdentity }
                        props={{
                          containerSide,
                          linkOwner,
                          provider: containerSide === 'A' ? providerA : providerB,
                          providerIdentity,
                          updateProviderIdentity,
                          userId,
                        }}
                        name={ `${containerSide}.providerIdentityId` }
                      />
                    </Section>
                  )).toArray()
                }
              </div>
            </Card>
          </Section>
        }

        {
          linkErrors.get('containers').count() > 0
          && <Section>
            <Title type="h3">Inaccessible projects</Title>
            <Card borderless color={ color.dark.quiet }>
              <div className="row">
                {
                  linkErrors.get('containers').map((container, containerSide) => (
                    <Section key={ containerSide } className="col-xs-6 col-xs-offset-3">
                      <ContainerIcon
                        provider={ containerSide === 'A' ? providerA : providerB }
                        container={ container }
                        isNewContainer={ false }
                        showName
                        iconSize="sm"
                      />
                      <Button pullRight onClick={ reloadLink }>
                        Retry
                      </Button>

                      <div className="help-block">
                        { container.get('errorMessage') }
                      </div>
                    </Section>
                  )).toArray()
                }
              </div>
            </Card>
          </Section>
        }
      </div>
    );
  }
}

LinkErrorsContainer = reduxForm({
  form: 'syncForm',
  destroyOnUnmount: false,
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
})(LinkErrorsContainer);

LinkErrorsContainer = Trackable(LinkErrorsContainer, 'customize/link-errors');


const mapStateToProps = state => ({
  linkOwner: getCurrentSyncOwner(state),
  providerA: getProvider(state, { containerSide: 'A' }),
  providerB: getProvider(state, { containerSide: 'B' }),
  userId: getUserId(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateProviderIdentity: (providerIdentityId, containerSide) => {
    const formData = {
      [containerSide]: {
        providerIdentity: providerIdentityId,
      },
    };
    dispatch(linkActions.updateLinkProviderIdentity(ownProps.linkId, formData));
  },
  reloadLink: () => {
    dispatch(linkActions.getLink(ownProps.linkId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(LinkErrorsContainer);



// WEBPACK FOOTER //
// ./src/containers/LinkErrorsContainer/LinkErrorsContainer.jsx