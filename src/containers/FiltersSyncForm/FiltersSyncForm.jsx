import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { reduxForm } from 'redux-form';

import {
  Button,
  Section,
  StickyButtonToolbar,
  Subheading,
  Title,
} from '../../components';
import { ContainersSync, SideFilters } from '../../containers';



class FiltersSyncForm extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func,
    isEdit: PropTypes.bool,
    onCancel: PropTypes.func.isRequired,
    onPrevious: PropTypes.func,
  };

  static defaultProps = {
    isEdit: false,
  };

  componentWillMount() {
    if (!this.props.isEdit) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    const {
      handleSubmit, isEdit, onCancel, onPrevious,
    } = this.props;

    return (
      <div>
        <Title type="h2">
          Configure filters
        </Title>

        <Section>
          <Subheading>
            You don't have to sync every task in a project!<br />
            Use filters to control which tasks sync. Filters are dynamic,
            so you can change your settings at any time to include or exclude certain tasks.
          </Subheading>
        </Section>

        <Section>
          <ContainersSync isEdit={ isEdit }/>
        </Section>

        <form>
          <div className="row">
            <div className="col-xs-6">
              <SideFilters containerSide="A" />
            </div>
            <div className="col-xs-6">
              <SideFilters containerSide="B" />
            </div>
          </div>

          <StickyButtonToolbar>
            <Button
              btnStyle="dark"
              onClick={ onCancel }
              pullLeft
              reverse
            >
              Cancel
            </Button>
            <Button
              btnStyle={ isEdit ? 'primary' : 'dark' }
              onClick={ handleSubmit }
              pullRight
            >
              { isEdit ? 'Save and sync' : 'Next' }
            </Button>
            {
              !isEdit && (
                <Button
                  btnStyle="link"
                  onClick={ onPrevious }
                  pullRight
                >
                  Back
                </Button>
              )
            }
          </StickyButtonToolbar>
        </form>
      </div>
    );
  }
}
FiltersSyncForm = reduxForm({
  form: 'syncForm',
  asyncBlurFields: [],
  destroyOnUnmount: false,
})(FiltersSyncForm)

export default FiltersSyncForm;



// WEBPACK FOOTER //
// ./src/containers/FiltersSyncForm/FiltersSyncForm.jsx