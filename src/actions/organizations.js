import {
    organizationTypes,
    routes
} from '../consts';
import {
    getSelectedOrganizationId
} from '../reducers';


export const getOrganizations = () => ({
    types: [
        organizationTypes.GET_ORGANIZATIONS_REQUEST,
        organizationTypes.GET_ORGANIZATIONS_SUCCESS,
        organizationTypes.GET_ORGANIZATIONS_FAILURE,
    ],
    url: routes.API_PATHS.GET_ORGANIZATIONS,
});

export const getCollaborators = () => (dispatch, getState) => {
    const state = getState();
    const organizationId = getSelectedOrganizationId(state);

    return dispatch({
        types: [
            organizationTypes.GET_COLLABORATORS_REQUEST,
            organizationTypes.GET_COLLABORATORS_SUCCESS,
            organizationTypes.GET_COLLABORATORS_FAILURE,
        ],
        url: routes.API_PATHS.GET_COLLABORATORS(organizationId),
    });
};


export const getMembers = organizationId => ({
    types: [
        organizationTypes.GET_MEMBERS_REQUEST,
        organizationTypes.GET_MEMBERS_SUCCESS,
        organizationTypes.GET_MEMBERS_FAILURE,
    ],
    meta: {
        organizationId
    },
    url: routes.API_PATHS.GET_ORGANIZATION_MEMBERS(organizationId), // eslint-disable-line
});


export const getCoworkers = organizationId => ({
    types: [
        organizationTypes.GET_COWORKERS_REQUEST,
        organizationTypes.GET_COWORKERS_SUCCESS,
        organizationTypes.GET_COWORKERS_FAILURE,
    ],
    url: routes.API_PATHS.GET_ORGANIZATION_COWORKERS(organizationId), // eslint-disable-line
    meta: {
        organizationId
    },
});

export const patchOrganization = (organizationId, payload) => ({
    types: [
        organizationTypes.UPDATE_ORGANIZATION_REQUEST,
        organizationTypes.UPDATE_ORGANIZATION_SUCCESS,
        organizationTypes.UPDATE_ORGANIZATION_FAILURE,
    ],
    url: routes.API_PATHS.UPDATE_ORGANIZATION(organizationId), // eslint-disable-line
    method: routes.METHODS.PATCH,
    meta: {
        organizationId
    },
    payload,
});

export const patchCollaborator = (organizationId, payload) => ({
    types: [
        organizationTypes.PATCH_COLLABORATOR_REQUEST,
        organizationTypes.PATCH_COLLABORATOR_SUCCESS,
        organizationTypes.PATCH_COLLABORATOR_FAILURE,
    ],
    method: routes.METHODS.PATCH,
    payload,
    url: routes.API_PATHS.PATCH_COLLABORATOR(organizationId), // eslint-disable-line
    meta: {
        organizationId,
        ...payload
    },
});

export const includeCollaborator = (organizationId, collaboratorId) => dispatch =>
    dispatch(patchCollaborator(organizationId, {
        collaboratorId,
        status: 'included'
    }));

export const excludeCollaborator = (organizationId, collaboratorId) => dispatch =>
    dispatch(patchCollaborator(organizationId, {
        collaboratorId,
        status: 'excluded'
    }));



// WEBPACK FOOTER //
// ./src/actions/organizations.js