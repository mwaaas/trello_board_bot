import {
    flagTypes,
    routes
} from '../consts';

export const getUserFlags = () => ({
    types: [
        flagTypes.GET_FLAGS_REQUEST,
        flagTypes.GET_FLAGS_SUCCESS,
        flagTypes.GET_FLAGS_FAILURE,
    ],
    meta: {
        type: flagTypes.TYPES.USER,
    },
    url: routes.API_PATHS.GET_FLAGS(flagTypes.TYPES.USER),
});

export const getCohortFlags = () => ({
    types: [
        flagTypes.GET_FLAGS_REQUEST,
        flagTypes.GET_FLAGS_SUCCESS,
        flagTypes.GET_FLAGS_FAILURE,
    ],
    meta: {
        type: flagTypes.TYPES.COHORT,
    },
    url: routes.API_PATHS.GET_FLAGS(flagTypes.TYPES.COHORT),
});



// WEBPACK FOOTER //
// ./src/actions/flags.js