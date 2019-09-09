/**
 * Combines all actions into a single one.
 * This allows to separate actions into different files (by concerns),
 * so we don't end up with a single gigantic actions.js file.
 *
 * If an action file becomes too big, do not hesitate to split it into separate files
 * and give the new files a descriptive name.
 *
 * More info about actions: http://rackt.org/redux/docs/basics/Actions.html
 * All actions need to have at least a type.
 */

import * as appActions from './app';
import * as authActions from './auth';
// import * as billingActions from './billing';
import * as containerActions from './containers';
import * as flagActions from './flags';
import * as fieldActions from './fields';
// import * as inviteActions from './invites';
import * as linkActions from './links';
import * as mappingActions from './mapping';
import * as multisyncActions from './multisyncs';
import * as organizationActions from './organizations';
import * as providerActions from './providers';
import * as providerIdentityActions from './providerIdentity';
import * as trackingActions from './tracking';

export {
    appActions,
    authActions,
    // billingActions,
    containerActions,
    flagActions,
    fieldActions,
    // inviteActions,
    linkActions,
    mappingActions,
    multisyncActions,
    organizationActions,
    providerIdentityActions,
    providerActions,
    trackingActions
}

// WEBPACK FOOTER //
// ./src/actions/index.js