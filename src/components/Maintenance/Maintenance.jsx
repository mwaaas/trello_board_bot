import React, { Component } from 'react';
import { Icon, Header, Title } from '../';
import './Maintenance.scss';


export default class Loading extends Component {
  render() {
    return (
      <div className="page">
        <Header dark />
        <div className="container">
          <div className="row">
            <div className="col-md-6 col-sm-12">
              <div className="page-header">
                <Title>We’ll be back soon!</Title>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-6">
              <div className="alert alert-warning">
                <p>
                  Sorry for the inconvenience but we’re performing some maintenance at the moment. If you need to, you can always { ' ' }
                  <a href="mailto:support@unito.io">contact us</a>
                  , otherwise we’ll be back online shortly!</p>
                <p>— Unito Team</p>
              </div>
            </div>
            <div className="col-sm-6">
              <Icon name="gears" className="super-awesome" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/Maintenance/Maintenance.jsx