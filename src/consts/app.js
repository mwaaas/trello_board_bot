export const IS_MAINTENANCE_ENABLED_REQUEST = 'IS_MAINTENANCE_ENABLED_REQUEST';
export const IS_MAINTENANCE_ENABLED_SUCCESS = 'IS_MAINTENANCE_ENABLED_SUCCESS';
export const ENABLE_MAINTENANCE_REQUEST = 'ENABLE_MAINTENANCE_REQUEST';
export const ENABLE_MAINTENANCE_SUCCESS = 'ENABLE_MAINTENANCE_SUCCESS';
export const ENABLE_MAINTENANCE_FAILURE = 'ENABLE_MAINTENANCE_FAILURE';
export const DISABLE_MAINTENANCE_REQUEST = 'DISABLE_MAINTENANCE_REQUEST';
export const DISABLE_MAINTENANCE_SUCCESS = 'DISABLE_MAINTENANCE_SUCCESS';
export const DISABLE_MAINTENANCE_FAILURE = 'DISABLE_MAINTENANCE_FAILURE';
export const GET_QUERY_PARAMETERS = 'GET_QUERY_PARAMETERS';
export const GET_IS_EMBED = 'GET_IS_EMBED';
export const GET_APP_CONFIG = 'GET_APP_CONFIG';
export const GET_APP_CONFIG_REQUEST = `${GET_APP_CONFIG}_REQUEST`;
export const GET_APP_CONFIG_SUCCESS = `${GET_APP_CONFIG}_SUCCESS`;
export const GET_APP_CONFIG_FAILURE = `${GET_APP_CONFIG}_FAILURE`;
export const SET_SELECTED_ORGANIZATION = 'SET_SELECTED_ORGANIZATION';

export const LOCAL_STORAGE_ORGANIZATION_KEY = 'selectedOrganizationId';

export const EMBED = {
    TRELLO: 'trello',
    WRIKE: 'wrike',
};

export const PRODUCT_NAMES = {
    PROJECT_SYNC: 'projectSync',
    TASK_SYNC: 'taskSync',
};

export const LOCAL_STORAGE_NOTIFICATION = {
    id: 'localStorage',
    title: 'Local storage error',
    message: "Unito needs to access your browser's local storage for you to be able to switch organizations",
    dismissible: true,
    dismissAfter: 0,
    status: 'warning',
    position: 'tl',
};



// WEBPACK FOOTER //
// ./src/consts/app.js