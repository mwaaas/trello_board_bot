import React, { Component } from 'react';
import TrelloPowerUp from 'TrelloPowerUp';

export default class SectionPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      yellowstoneUrls: []
    };
  }

  componentDidMount() {
    /* global TrelloPowerUp */

    const t = TrelloPowerUp.iframe();

    // you can access arguments passed to your iframe like so
    // unlike logic that lives inside t.render() this will only
    // be passed once, so don't rely on this for information that
    // could change, for example what attachments you want to show
    // in this section
    const arg = t.arg('arg');

    console.log(arg);

    t.render(() => {
      // make sure your rendering logic lives here, since we will
      // recall this method as the user adds and removes attachments
      // from your section
      t.card('attachments')
        .get('attachments')
        .filter((attachment) => {
          return attachment.url.indexOf('http://www.nps.gov/yell/') === 0;
        })
        .then((yellowstoneAttachments) => {
          const yellowstoneUrls = yellowstoneAttachments.map((a) => { return a.url; })
          this.setState({ yellowstoneUrls });
        })
        .then(() => {
          return t.sizeTo('#content');
        });
    });

  }

  render() {
    return (
      <div id="content">
        <p>Tips for using attachment-sections</p>
        <ol>
          <li>Make sure your section feels at home on the card. It should fit in with the rest of the card and not stick out.</li>
          <li>You can specify a height when you claim the section, and also use t.sizeTo() to make sure your section is the perfect height.</li>
          <li>Try to keep the height of your sections to a minimum.</li>
          <li>It should be obvious to the user what attachments went into your section. They shouldn't be left wondering were one of their attachments disappeared to.</li>
        </ol>
        <p className="u-quiet">Claimed attachment urls:
          <span id="urls">
            {this.state.yellowstoneUrls.join(', ')}
          </span>
        </p>
      </div>
    );
  }
}