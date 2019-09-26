import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { List } from 'immutable';
import { reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';
import styled from 'styled-components';


import { mappingActions } from '../../actions';
import {
  Card,
  IconHoverTooltip,
  MappingList,
  Section,
  Title,
  ToggleFormInput,
} from '../../components';
import {
  ContainersSync,
  FeatureFlag,
  FeatureFlagVariant,
  OpenIntercomBubble,
} from '../../containers';
import {
  getCurrentUserMappingError,
  getMappedUsers,
  getUnmappedUsers,
  isLoadedUsers,
} from '../../reducers';
import { color } from '../../theme';
import Trackable from '../../components/TrackableHoC/TrackableHoC';
import './UserMappingList.scss';


const ErrorBlock = styled.div`
  padding-bottom: 30px;
  padding-top: 10px;
  text-align: center;
`;



class UserMappingList extends Component {
  static propTypes = {
    hasError: PropTypes.bool.isRequired,
    isEdit: PropTypes.bool,
    isLoading: PropTypes.bool.isRequired,
    mapUsers: PropTypes.func.isRequired,
    mappedUsers: PropTypes.instanceOf(List).isRequired,
    unmapUsers: PropTypes.func.isRequired,
    unmappedUsersA: PropTypes.instanceOf(List).isRequired,
    unmappedUsersB: PropTypes.instanceOf(List).isRequired,
  };

  static defaultProps = {
    isEdit: false,
  };

  userFilterFunction = (user, searchString) => {
    const sString = searchString.toLowerCase();

    return user.get('displayName', '').toLowerCase().includes(sString)
           || user.get('username', '').toLowerCase().includes(sString)
           || user.get('emails', List()).filter(email => email.toLowerCase().includes(sString)).size > 0;
  }

  render() {
    const {
      hasError,
      isEdit,
      isLoading,
      mappedUsers,
      unmappedUsersA,
      unmappedUsersB,
    } = this.props;

    if (hasError) {
      return (
        <ErrorBlock>
          <Title>Unito was unable to retreive your projects' users.</Title>
          <p>
            Please try again later or <OpenIntercomBubble>contact support</OpenIntercomBubble>
            { ' ' } if the problem persists. <br/>
            You can continue to configure the other settings of your sync in the meantime.
          </p>
        </ErrorBlock>
      );
    }

    return (
      <div className="user-mapping-list">
        <Section>
          <ContainersSync isEdit={ isEdit } />
        </Section>

        <Section>
          <MappingList
            isLoading={ isLoading }
            mappedUsers={ mappedUsers }
            unmappedA={ unmappedUsersA }
            unmappedB={ unmappedUsersB }
            mapItems={ this.props.mapUsers }
            unmapItems={ this.props.unmapUsers }
            filterFunction={ this.userFilterFunction }
          />
        </Section>

        <FeatureFlag name="display-automap-users-toggle">
          <FeatureFlagVariant value={ true }>
            <Section>
              <Card borderless color={ color.dark.quiet }>
                <div className="row">
                  <div className="col-xs-8 col-xs-offset-2">
                    <Title type="h3">User auto mapping</Title>
                    <Field component={ ToggleFormInput } name="automapUsers">
                      Every hour, discover and automatically map users { ' ' }
                      <IconHoverTooltip placement="top">
                        Automatically map people with identical email addresses or similar names. <br />
                        If turned off, you will need to manually map users so people get correctly assigned across tools.
                      </IconHoverTooltip>
                    </Field>
                  </div>
                </div>
              </Card>
            </Section>
          </FeatureFlagVariant>
        </FeatureFlag>
      </div>
    );
  }
}
UserMappingList = reduxForm({
  form: 'syncForm',
  destroyOnUnmount: false,
})(UserMappingList);

UserMappingList = Trackable(UserMappingList, 'customize/people');

const mapStateToProps = state => ({
  hasError: getCurrentUserMappingError(state),
  isLoading: !isLoadedUsers(state),
  mappedUsers: getMappedUsers(state),
  unmappedUsersA: getUnmappedUsers(state, { containerSide: 'A' }),
  unmappedUsersB: getUnmappedUsers(state, { containerSide: 'B' }),
});

const mapDispatchToProps = dispatch => ({
  mapUsers: (idA, idB) => dispatch(mappingActions.mapUsers(idA, idB)),
  unmapUsers: index => dispatch(mappingActions.unmapUsers(index)),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserMappingList);



// WEBPACK FOOTER //
// ./src/containers/UserMappingList/UserMappingList.jsx