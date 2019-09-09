import thunk from 'redux-thunk';
import {
    createLogger
} from 'redux-logger';
import {
    persistState
} from 'redux-devtools';
import {
    applyMiddleware,
    compose,
    createStore
} from 'redux';
import {
    createTracker
} from 'redux-segment';

// import { trackingTypes } from 'consts';
// import * as trackingActions from '../actions/tracking';
import rootReducer from '../reducers';

import {
    callAPIMiddleware,
    timestamper
} from './middlewares';
import DevTools from '../containers/DevTools/DevTools';

/*
const customMapper = {
  mapper: {
    [`${trackingTypes.UNITO_TRACKING}${trackingTypes.FORM_ACTIONS.SUBMIT}`]: trackingActions.,
    [`${trackingTypes.UNITO_TRACKING}${trackingTypes.FORM_ACTIONS.CANCEL}`]: trackingActions.,
  },
};
*/

export function configureStore(initialState, debug = false) {
    const tracker = createTracker();
    const logger = createLogger({
        collapsed: true,
        predicate: (getState, action) => debug, // eslint-disable-line
    });
    const middleware = applyMiddleware(thunk, callAPIMiddleware, timestamper, tracker, logger);

    let enhancers;
    if (debug) {
        enhancers = compose(
            middleware,
            DevTools.instrument(),
            persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/)),
        );
    } else {
        enhancers = compose(middleware);
    }

    const store = createStore(rootReducer, initialState, enhancers);
    if (module.hot) {
        module.hot.accept('../reducers', () => {
            const nextRootReducer = require('../reducers/index'); // eslint-disable-line
            store.replaceReducer(nextRootReducer);
        });
    }
    return store;
}

const store = configureStore(undefined, process.env.REACT_APP_DEBUG);

export default store;



// WEBPACK FOOTER //
// ./src/store/index.js