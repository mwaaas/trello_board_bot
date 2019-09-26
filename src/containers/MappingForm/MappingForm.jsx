import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Map } from 'immutable';

import {
  Button,
  Href,
  NavTabs,
  Section,
  StickyButtonToolbar,
  Subheading,
  Title,
} from '../../components';
import { FieldMappingList, UserMappingList } from '../../containers';
import { fieldActions } from '../../actions';
import { fieldTypes } from '../../consts';
import { isSavingSync as getIsSavingSync, getProvider } from '../../reducers';



class MappingForm extends Component {
  static propTypes = {
    isEdit: PropTypes.bool,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    providerA: PropTypes.instanceOf(Map).isRequired,
    providerB: PropTypes.instanceOf(Map).isRequired,
  };

  static defaultProps = {
    isEdit: false,
  };

  state = {
    activeTab: 0,
  };

  componentWillMount() {
    if (!this.props.isEdit) {
      window.scrollTo(0, 0);
    }
  }

  componentDidMount() {
    this.props.fetchResources();
  }

  setPage = (index) => {
    this.setState({ activeTab: index });
  }

  getSubmitButton = () => {
    const { handleSubmit, isEdit, isSavingSync } = this.props;
    let text = isEdit ? 'Save and sync' : 'Create sync';

    if (isSavingSync) {
      text = 'Creating sync...';
    }

    return (
      <Button
        btnStyle="primary"
        disabled={ isSavingSync }
        onClick={ handleSubmit }
        pullRight
        v2
      >
        { text }
      </Button>
    );
  }

  render() {
    const {
      handleSubmit,
      isEdit,
      onCancel,
      onPrevious,
    } = this.props;
    const { activeTab } = this.state;

    const tabNames = ['Map fields', 'Map users'];

    return (
      <form onSubmit={ handleSubmit }>
        <Title type="h2">
          Map fields & workflows
        </Title>

        <Section>
          <Subheading>
            Map workflows across projects by connecting fields. Select a value on one side and map it to the other. <br />
            You can { ' ' }
            <Href href="https://guide.unito.io/hc/en-us/articles/226811628">visit our guide</Href> { ' ' }
            to learn more about mapping fields and building workflows across apps.
          </Subheading>
        </Section>

        {
          isEdit && (
            <Section>
              <NavTabs
                activeTab={ activeTab }
                onTabClick={ this.setPage }
                tabNames={ tabNames }
                tabStyle="underline"
              />
            </Section>
          )
        }

        { activeTab === 0 && <FieldMappingList isEdit={ isEdit } /> }

        { activeTab === 1 && isEdit && <UserMappingList isEdit /> }

        <StickyButtonToolbar>
          <Button
            btnStyle="dark"
            onClick={ onCancel }
            pullLeft
            reverse
            v2
          >
            Cancel
          </Button>
          { this.getSubmitButton() }
          {
            !isEdit && (
              <Button
                btnStyle="link"
                onClick={ onPrevious }
                pullRight
                v2
                >
                Back
              </Button>
            )
          }
        </StickyButtonToolbar>
      </form>
    );
  }
}
MappingForm = reduxForm({
  form: 'syncForm',
  asyncBlurFields: [],
  destroyOnUnmount: false,
})(MappingForm);
const mapStateToProps = state => ({
  providerA: getProvider(state, { containerSide: 'A' }),
  providerB: getProvider(state, { containerSide: 'B' }),
  isSavingSync: getIsSavingSync(state),
});

const mapDispatchToProps = dispatch => ({
  fetchResources: () => {
    ['A', 'B'].forEach((containerSide) => {
      dispatch(fieldActions.getCustomFields({ containerSide }));
      dispatch(fieldActions.getWorkflows(containerSide));
      dispatch(fieldActions.fetchFieldValues({
        containerSide,
        fieldId: fieldTypes.FIELD_VALUES_TYPE.USERS,
        kind: fieldTypes.KINDS.PCD_FIELD,
      }));
    });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MappingForm);



// WEBPACK FOOTER //
// ./src/containers/MappingForm/MappingForm.jsx