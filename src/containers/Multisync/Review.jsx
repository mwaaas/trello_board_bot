import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { Map } from 'immutable';
import styled from 'styled-components';
import { Prompt } from 'react-router';

import appHistory from '../../app-history';
import {
  Button,
  StickyButtonToolbar,
  Card,
  Icon,
  LinkItem,
  Section,
  TextInput,
  Title,
} from '../../components';
import {
  getFieldValue,
  getProviderByProviderIdentityId,
  getContainerById,
  getContainersById,
} from '../../reducers';
import { multisyncActions, linkActions } from '../../actions';
import { color } from '../../theme';
import { formUtils } from '../../utils';
import { multisyncTypes, trackingTypes, routes } from '../../consts';

import { TextWrapper } from '.';


const TakeAways = styled.ul`
  margin-top: 1rem;
`;

const validate = (values) => {
  const errors = {};
  const { multisyncName } = values;

  if (formUtils.isEmpty(multisyncName)) {
    errors.multisyncName = 'Required';
  }

  return errors;
};

const PAGE_INDEX = 3;

// todo annotation
// @reduxForm({
//   form: 'multisyncForm',
//   validate,
//   destroyOnUnmount: false,
// })
class Review extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    rootContainer: PropTypes.instanceOf(Map).isRequired,
    leavesContainers: PropTypes.instanceOf(Array).isRequired,
    leavesProvider: PropTypes.instanceOf(Map).isRequired,
    rootProvider: PropTypes.instanceOf(Map).isRequired,
    pristine: PropTypes.bool.isRequired,
    trackEvent: PropTypes.func.isRequired,
  };

  state = {
    submitHasBeenClicked: false,
  }

  isReadOnly = (leafContainerId) => {
    const { leaves } = this.props;
    const leaf = leaves.find(l => l.containerId === leafContainerId);
    return leaf.syncDirection === multisyncTypes.SYNC_DIRECTION.ONE_WAY;
  }

  onSubmit = async (formValues) => {
    const { trackEvent, onSubmit } = this.props;
    trackEvent(trackingTypes.FORM_ACTIONS.SUBMIT, PAGE_INDEX, { formValues });

    await onSubmit(formValues);
    this.setState({ submitHasBeenClicked: true }, () => appHistory.replace({ pathname: routes.ABSOLUTE_PATHS.DASHBOARD }));
  }

  render() {
    const {
      handleSubmit,
      leavesContainers,
      leavesProvider,
      rootContainer,
      rootProvider,
      submitting,
      topology,
      trackEvent,
      pristine,
    } = this.props;

    return (
      <div>
        <form className="create-mutisync-container__review" onSubmit={ handleSubmit(this.onSubmit) }>
          <div className="row">
            <TextWrapper className="col-sm-6">
              <Field
                name="multisyncName"
                component={ TextInput }
                placeholder="Enter your Multi-sync name"
                label="Name your Multi-sync"
                defaultValue={ `${rootContainer.get('displayName')} multisync` }
              />
            </TextWrapper>
          </div>
          <hr />
          <Section>
            <TextWrapper>
              You are about to create a Multi-sync made of the following individual syncs:
            </TextWrapper>
            {
              leavesContainers.map((leavesContainer) => {
                const providerA = topology === multisyncTypes.TOPOLOGIES.SPLIT ? rootProvider : leavesProvider;
                const providerB = topology === multisyncTypes.TOPOLOGIES.SPLIT ? leavesProvider : rootProvider;
                const containerA = topology === multisyncTypes.TOPOLOGIES.SPLIT ? rootContainer : leavesContainer;
                const containerB = topology === multisyncTypes.TOPOLOGIES.SPLIT ? leavesContainer : rootContainer;
                const syncName = `${containerA.get('displayName')} - ${containerB.get('displayName')}`;

                return (
                  <LinkItem
                    key={leavesContainer.get('id')}
                    providerIdA={ providerA.get('_id') }
                    providerIdB={ providerB.get('_id') }
                    containerA={ containerA }
                    containerB={ containerB }
                    readOnlyA={ this.isReadOnly(leavesContainer.get('id')) }
                    readOnlyB={ false }
                    syncName={ syncName }
                  />
                );
              })
            }
            <Card borderless color={ color.brand.lightGreen }>
              <Title type="h4">
                <Icon name="info-circle" /> { ' ' }
                Key Takeaways
              </Title>
              <TakeAways className="fa-ul">
                {
                  !leavesProvider.hasIn(['capabilities', 'fields', 'labels']) && (
                    <li>
                      <Icon name="check" className="fa-li" color={ color.brand.primary } />
                      <strong>
                        Tasks that already exist in the destination projects will be synced up in the main project if you didn't apply an incoming tag
                      </strong>.
                      <br />
                      Once the Multi-sync is created, edit the individual syncs and add filters if you don’t want the existing tasks to be synced.
                    </li>
                  )
                }
                <li>
                  <Icon name="check" className="fa-li" color={ color.brand.primary } />
                  After the multi-sync is created you’ll be able to edit every individual sync
                </li>
                <li>
                  <Icon name="check" className="fa-li" color={ color.brand.primary } />
                  The syncs will be in manual mode: trigger syncs with the “Sync now” button
                </li>
                <li>
                  <Icon name="check" className="fa-li" color={ color.brand.primary } />
                  Turn on auto-sync when you’re ready, and updates will synchronize every few minutes
                </li>
                <li>
                  <Icon name="check" className="fa-li" color={ color.brand.primary } />
                  The initial sync might take some time depending on the size of your projects
                </li>
              </TakeAways>
            </Card>
          </Section>

          <StickyButtonToolbar>
            <Button
              type="href"
              btnStyle="dark"
              reverse
              to="/dashboard"
              onClick={ () => pristine && trackEvent(trackingTypes.FORM_ACTIONS.CANCEL, PAGE_INDEX) }
            >
              Cancel
            </Button>
            <Button
              onClick={ handleSubmit(this.onSubmit) }
              btnStyle="dark"
              disabled={ submitting || this.props.invalid }
              pullRight
              type="submit"
            >
              { submitting ? 'Creating Multi-sync ...' : 'Create Multi-sync' }
            </Button>
            <Button
              onClick={ () => trackEvent(trackingTypes.FORM_ACTIONS.BACK, PAGE_INDEX) }
              pullRight
              type="href"
              btnStyle="link"
              to="map-fields"
            >
              Back
            </Button>
          </StickyButtonToolbar>
        </form>

        <Prompt
          message={ location => location.pathname.includes('/dashboard/multisyncs/add/') ? true : 'Discard unsaved changes?' } // eslint-disable-line
          when={ !this.state.submitHasBeenClicked }
        />
      </div>
    );
  }
}
Review = reduxForm(Review, {
  form: 'multisyncForm',
  validate,
  destroyOnUnmount: false,
});

const mapStateToProps = (state) => {
  const topology = getFieldValue(state, 'topology', 'multisyncForm');
  const rootProviderIdentityId = getFieldValue(state, 'root.providerIdentityId', 'multisyncForm');
  const leavesProviderIdentityId = getFieldValue(state, 'leaves.providerIdentityId', 'multisyncForm');
  const rootContainerId = getFieldValue(state, 'root.containerId', 'multisyncForm');
  const leaves = getFieldValue(state, 'filters', 'multisyncForm') || [];
  const rootContainer = getContainerById(state, topology === multisyncTypes.TOPOLOGIES.SPLIT ? 'A' : 'B', rootContainerId);
  const leavesContainers = getContainersById(state, topology === multisyncTypes.TOPOLOGIES.SPLIT ? 'B' : 'A', leaves.map(leaf => leaf.containerId));

  return {
    leaves,
    leavesContainers,
    leavesProvider: getProviderByProviderIdentityId(state, leavesProviderIdentityId),
    rootContainer,
    rootProvider: getProviderByProviderIdentityId(state, rootProviderIdentityId),
    topology,
  };
};

const mapDispatchToProps = dispatch => ({
  onSubmit: async (formData) => {
    const { multisync } = await dispatch(multisyncActions.addMultisync(formData));
    return dispatch(linkActions.addMultisyncLinks(formData, multisync._id));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Review);



// WEBPACK FOOTER //
// ./src/containers/Multisync/Review.jsx