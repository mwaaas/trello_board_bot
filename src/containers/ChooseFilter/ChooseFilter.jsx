import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';

import { AddFilter, AppliedFilters } from '../../containers';
import { getFieldsWithFilterCapability } from '../../reducers';


class ChooseFilter extends Component {
  static propTypes = {
    containerName: PropTypes.string.isRequired,
    containerSide: PropTypes.oneOf(['A', 'B']).isRequired,
    fields: PropTypes.object.isRequired,
    fieldsWithFilterCapability: PropTypes.instanceOf(Map).isRequired,
  };

  render() {
    const {
      containerName,
      containerSide,
      fields,
      fieldsWithFilterCapability,
    } = this.props;

    return (
      <div className="choose-filter">
        <AppliedFilters
          allContainerFields={ fieldsWithFilterCapability }
          containerSide={ containerSide }
          fields={ fields }
          containerName={ containerName }
        />
        <AddFilter
          allContainerFields={ fieldsWithFilterCapability }
          containerSide={ containerSide }
          fields={ fields }
        />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  fieldsWithFilterCapability: getFieldsWithFilterCapability(state, ownProps),
});

export default connect(mapStateToProps)(ChooseFilter);



// WEBPACK FOOTER //
// ./src/containers/ChooseFilter/ChooseFilter.jsx