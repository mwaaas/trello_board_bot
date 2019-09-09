import {
    containerTypes,
    routes
} from '../consts';
import {
    otherSide as getOtherSide
} from '../utils';

export const clearContainers = containerSide => ({
    type: containerTypes.CLEAR_CONTAINERS,
    meta: {
        containerSide,
    },
});

export const getContainerById = (providerIdentityId, containerId, containerSide) => ({
    types: [
        containerTypes.GET_CONTAINER_REQUEST,
        containerTypes.GET_CONTAINER_SUCCESS,
        containerTypes.GET_CONTAINER_FAILURE,
    ],
    meta: {
        providerIdentityId,
        containerId,
        containerSide,
    },
    url: routes.API_PATHS.GET_CONTAINER(providerIdentityId, containerId),
});

export const getLinkContainerBySide = (link, side) => (dispatch) => {
    dispatch({
        types: [
            containerTypes.GET_LINK_CONTAINER_BY_SIDE_REQUEST,
            containerTypes.GET_LINK_CONTAINER_BY_SIDE_SUCCESS,
            containerTypes.GET_LINK_CONTAINER_BY_SIDE_FAILURE,
        ],
        meta: {
            providerIdentityId: link[side].providerIdentity._id,
            containerId: link[side].container.id,
            side,
        },
        url: routes.API_PATHS.GET_CONTAINER(link[side].providerIdentity._id, link[side].container.id), // eslint-disable-line
        onFailure: () => {},
    });
};

export const getContainers = (providerIdentityId, containerSide, index, searchValue) => ({
    types: [
        containerTypes.GET_CONTAINERS_REQUEST,
        containerTypes.GET_CONTAINERS_SUCCESS,
        containerTypes.GET_CONTAINERS_FAILURE,
    ],
    meta: {
        providerIdentityId,
        containerSide,
        loadingId: [containerSide, index].join('.'),
        searchValue,
    },
    url: routes.API_PATHS.GET_CONTAINERS(providerIdentityId, searchValue),
    shouldCallAPI: () => ([undefined, null].includes(searchValue) ? true : searchValue.trim().length > 1),
});

export const getWorkspaces = (providerIdentityId, containerSide) => ({
    types: [
        containerTypes.GET_WORKSPACES_REQUEST,
        containerTypes.GET_WORKSPACES_SUCCESS,
        containerTypes.GET_WORKSPACES_FAILURE,
    ],
    meta: {
        providerIdentityId,
        containerSide,
    },
    url: routes.API_PATHS.GET_WORKSPACES(providerIdentityId),
});

export const getContainerPlugins = ({
    containerId,
    providerIdentityId
}) => ({
    types: [
        containerTypes.GET_CONTAINER_PLUGINS_REQUEST,
        containerTypes.GET_CONTAINER_PLUGINS_SUCCESS,
        containerTypes.GET_CONTAINER_PLUGINS_FAILURE,
    ],
    meta: {
        containerId,
    },
    url: routes.API_PATHS.GET_CONTAINER_PLUGINS(providerIdentityId, containerId),
});

export const createContainer = ({
    A,
    B
}, containerSide) => (dispatch) => {
    const sides = {
        A,
        B
    };
    const sideValues = sides[containerSide];
    const otherSideValues = sides[getOtherSide(containerSide)];

    const createPayload = {
        providerIdentityId: sideValues.providerIdentityId,
        container: {
            workspaceId: sideValues.containerId,
            displayName: sideValues.newContainerName,
        },
    };

    if (otherSideValues) {
        createPayload.otherSide = {
            providerIdentityId: otherSideValues.providerIdentityId,
            containerId: otherSideValues.containerId,
            existingContainer: otherSideValues.existingContainer,
        };
    }

    return dispatch({
        types: [
            containerTypes.CREATE_CONTAINER_REQUEST,
            containerTypes.CREATE_CONTAINER_SUCCESS,
            containerTypes.CREATE_CONTAINER_FAILURE,
        ],
        meta: {
            providerIdentityId: createPayload.providerIdentityId,
            containerSide,
        },
        method: routes.METHODS.POST,
        payload: createPayload,
        url: routes.API_PATHS.CREATE_CONTAINER,
    });
};



// WEBPACK FOOTER //
// ./src/actions/containers.js