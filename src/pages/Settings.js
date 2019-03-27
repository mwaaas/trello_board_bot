import React, { Component } from 'react';
import TrelloPowerUp from 'TrelloPowerUp';

const Promise = TrelloPowerUp.Promise;
const t = TrelloPowerUp.iframe();

export default class OverlayPage extends Component {

  constructor(props) {
    super(props);

    // Set default state of selects.
    this.state = {
      fruit: 'apple',
      vegetable: 'broccoli'
    }
  }

  componentDidMount() {
    t.render(() => {
      return Promise.all([
        t.get('board', 'shared', 'fruit'),
        t.get('board', 'private', 'vegetable')
      ])
        .spread((savedFruit, savedVegetable) => {
          if (savedFruit && /[a-z]+/.test(savedFruit)) {
            this.setState({ fruit: savedFruit })
          }
          if (savedVegetable && /[a-z]+/.test(savedVegetable)) {
            this.setState({ vegetable: savedVegetable })
          }
        })
        .then(() => {
          t.sizeTo('#content')
            .done();
        })
    });
  }

  handleSaveOnClick() {
    return t.set('board', 'private', 'vegetable', this.state.vegetable)
      .then(() => {
        return t.set('board', 'shared', 'fruit', this.state.fruit);
      })
      .then(() => {
        t.closePopup();
      })
  }

  handleFruitChange(e) {
    this.setState({ fruit: e.target.value });
  }

  handleVegetableChange(e) {
    this.setState({ vegetable: e.target.value });
  }

  render() {
    return (
      <div id="content">
        <p>Shared - Select a fruit</p>
        <select id="fruit" value={this.state.fruit} onChange={e => this.handleFruitChange(e)}>
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
          <option value="date">Date</option>
          <option value="lemon">Lemon</option>
          <option value="pineapple">Pineapple</option>
        </select>
        <p>Private - Select a vegetable</p>
        <select id="vegetable" value={this.state.vegetable} onChange={e => this.handleVegetableChange(e)}>
          <option value="broccoli">Broccoli</option>
          <option value="corn">Corn</option>
          <option value="kale">Kale</option>
          <option value="onion">Onion</option>
          <option value="spinach">Spinach</option>
        </select>
        <button id="save" className="mod-primary" onClick={this.handleSaveOnClick.bind(this)}>Save</button>
      </div>
    );
  }
}