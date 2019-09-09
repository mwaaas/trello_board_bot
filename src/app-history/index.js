import {
    createHashHistory
} from 'history';
import ReactDOM from 'react-dom';
import React from 'react';
import {
    destroy
} from 'redux-form';

import {
    Modal
} from '../components';
import store from '../store';


const history = createHashHistory({
    getUserConfirmation: (message, callback) => {
        const modal = document.createElement('div');
        document.body.appendChild(modal);

        const withCleanup = (answer) => {
            // FIXME: Once updated to React 16, the setTimeout can be removed
            // https://github.com/facebook/react/issues/6232
            setTimeout(() => ReactDOM.unmountComponentAtNode(modal), 0);
            document.body.removeChild(modal);
            callback(answer);
        };

        ReactDOM.render( <
            Modal isOpen title = {
                message
            }
            onCancel = {
                () => withCleanup(false)
            }
            onConfirm = {
                () => withCleanup(true)
            }
            />,
            modal,
        );
    },
});

/**
 * Indicates if the current location pathname is an embedded url
 * @param {object} location - The location object
 * @returns {boolean} - True pathname is embed
 */
function isEmbed(location) {
    return location.pathname.startsWith('/embed/');
}

/* Required to support embedded dashboard */
const {
    location: initialLocation
} = history;
let lastLocation = initialLocation;

const isDashboardEmbed = isEmbed(initialLocation);
const [, embed, providerName] = initialLocation.pathname.split('/');

/**
 * Indicates if the location should be an embed path instead.
 * This verifies that:
 *  - The initialLocation is embed.
 *  - The "to" location is not embed
 *  - That the location action is not a POP (we only change the pathname if it's a PUSH or REPLACE)
 *    POP is used internally by other libraries.
 * @param {object} location - The location object
 * @returns {boolean} - True if the given location should be replaced by an
 *                      embedded location
 */
function requiresEmbedPath(nextLocation, nextAction) {
    return isDashboardEmbed && !isEmbed(nextLocation) && nextAction !== 'POP';
}

/* Listen to history transitions and changes the transition to pathname, if
 * the initial location was a embedded route.
 * This allows to replace the location pathname by an embedded one.
 *
 * We need to overwrite embedded pathnames because we use the same children components
 * for Embedded Dashboards and Dashboard containers.
 * Link components and replace/push in actions take an absolute path as parameter,
 * this means that we can only have one absolute path in all the components/actions.
 * We want to avoid duplication of components and actions
 * (the only difference between them would be the routes)
 */
history.listen((location, action) => {
    /*
     * When navigating out of the links/add or links/edit page
     * Destroy the sync form.
     */
    const reLink = RegExp('dashboard/links/(add|edit)');
    if (lastLocation && reLink.test(lastLocation.pathname)) {
        store.dispatch(destroy('syncForm'));
    }

    if (requiresEmbedPath(location, action)) {
        history.replace({
            pathname: `/${embed}/${providerName}${location.pathname}`,
            search: location.search
        });
    }

    // Keep the last location so it can be compared with the current location on the next event
    // In this case to be able to clear the syncForm on listenBefore
    lastLocation = location;

    window.analytics.page(location.pathname);

    store.dispatch({
        type: 'NAVIGATE',
        location,
        action,
    });
});

export default history;



// WEBPACK FOOTER //
// ./src/app-history/index.js