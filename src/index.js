import React from 'react';
import ReactDOM from 'react-dom';

import {
    Root
} from './containers';
import {
    authActions
} from './actions';
import appHistory from './app-history';
import store from './store';


const target = document.getElementById('root');
const node = ( <
    Root // eslint-disable-line
    history = {
        appHistory
    }
    store = {
        store
    }
    debug = {
        process.env.REACT_APP_DEBUG === 'true'
    }
    />
);

store.dispatch(authActions.rehydrateAuthState());

ReactDOM.render(node, target);

// WEBPACK FOOTER //
// ./src/index.js