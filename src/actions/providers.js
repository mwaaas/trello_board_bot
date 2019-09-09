/* eslint-disable import/prefer-default-export */

import {
    providerTypes,
    routes
} from '../consts';

export const getProviders = () => ({
    types: [
        providerTypes.GET_PROVIDERS_REQUEST,
        providerTypes.GET_PROVIDERS_SUCCESS,
        providerTypes.GET_PROVIDERS_FAILURE,
    ],
    url: routes.API_PATHS.PROVIDERS,
});
/* eslint-disable import/prefer-default-export */



// WEBPACK FOOTER //
// ./src/actions/providers.js