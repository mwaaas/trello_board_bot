import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import debounce from 'lodash.debounce';

import { trackingActions } from '../../actions';
import { Button, ProgressBar, Icon } from '../../components';
import { trackingTypes, routes } from '../../consts';
import { getUserFullName } from '../../reducers';
import { color } from '../../theme';
import Page0 from './Page0';
import Page1 from './Page1';
import Page2 from './Page2';
import Page3 from './Page3';


const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  background: white;
  min-height: calc(100vh - 66px);
  padding: 4em 6em;
`;

const Chevron = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  cursor: pointer;
`;

const Content = styled.div`
  margin-left: 50px;
  margin-right: 50px;
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4%;
`;

const Index = styled.div`
  font-size: 12px;
  margin-right: 10px;
`;

const TotalPages = styled.span`
  color: ${color.dark.secondary};
`;

const navigation = {
  NEXT_PAGE: 1,
  PREVIOUS_PAGE: -1,
};


class WelcomeContainer extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    userFullName: PropTypes.string.isRequired,
    trackEvent: PropTypes.func.isRequired,
  };

  state = {
    activePage: 0,
    numberOfPages: 4,
  };

  componentDidMount() {
    const { trackEvent } = this.props;
    const { activePage } = this.state;
    trackEvent(trackingTypes.WELCOME_ACTIONS.START, activePage);
    window.addEventListener('wheel', this.handleWheel, false);
  }

  componentWillUnmount() {
    window.removeEventListener('wheel', this.handleWheel, false);
  }

  handleWheel = debounce((event) => {
    const direction = Math.sign(event.deltaY) * -1;
    this.switchPage(direction);
  }, 100);

  switchPage = (direction) => {
    this.setState((state) => {
      const { activePage, numberOfPages } = state;
      const newActivePage = Math.min(Math.max(activePage + direction, 0), numberOfPages - 1);
      return { activePage: newActivePage };
    });
  }

  handleSkip = () => {
    const { trackEvent } = this.props;
    const { activePage } = this.state;
    trackEvent(trackingTypes.WELCOME_ACTIONS.SKIP, activePage);
  }

  render() {
    const { activePage, numberOfPages } = this.state;
    const { userFullName, trackEvent } = this.props;
    const progression = activePage / (numberOfPages - 1) * 100;

    return (
      <Container ref="container" className="container">
        {
          activePage === 0
          || <Chevron
              onClick={() => this.switchPage(navigation.PREVIOUS_PAGE)}
             >
              <Icon
                size="xl"
                className="fa-chevron-left"
                name="left"
                color={ color.dark.hint }
              />
            </Chevron>
        }

        <Content>
          {
            activePage !== numberOfPages - 1
            && <Button
              btnStyle="dark"
              onClick={this.handleSkip}
              pullRight
              reverse
              size="sm"
              to={ routes.ABSOLUTE_PATHS.ADD_LINK }
              type="href"
            >
              Skip tutorial
            </Button>
          }

          {activePage === 0 && <Page0 />}

          {activePage === 1 && <Page1 />}

          {activePage === 2 && <Page2 />}

          {activePage === 3 && <Page3 userFullName={userFullName} trackEvent={trackEvent} />}

          <ProgressContainer>
            <Index>
              <strong>{ `0${activePage + 1}` }</strong>
              <TotalPages> { `/ 0${numberOfPages}` } </TotalPages>
            </Index>
            <ProgressBar
              progression={progression || 2}
              type="horizontal"
              color={color.brand.dark}
            />
          </ProgressContainer>
        </Content>

        {
          activePage === numberOfPages - 1
          || <Chevron
              onClick={() => this.switchPage(navigation.NEXT_PAGE)}
             >
              <Icon
                size="xl"
                className="fa-chevron-right"
                name="right"
                color={color.dark.hint}
              />
            </Chevron>
        }

      </Container>
    );
  }
}

const mapStateToProps = state => ({
  userFullName: getUserFullName(state),
});

const mapDispatchToProps = dispatch => ({
  trackEvent: (action, activePage) => {
    const eventName = `USER_WELCOME_${activePage}_${action}`;
    dispatch(trackingActions.trackEvent(eventName));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(WelcomeContainer);



// WEBPACK FOOTER //
// ./src/containers/WelcomeContainer/WelcomeContainer.jsx