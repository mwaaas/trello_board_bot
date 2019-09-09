import {
    fromJS
} from 'immutable';

import {
    multisyncTypes,
    routes
} from '../consts';
import {
    getMultisyncDefaultFieldAssociations,
    getDefaultParamContainerId,
    getContainerById,
    getFieldAssociationsByContainerId,
    getSelectedOrganizationId,
} from '../reducers';
import {
    otherSide as getOtherSide
} from '../utils';
import {
    buildMultisyncSyncsPayload
} from '../containers/Multisync';


export const copyDefaultFieldAssociationsByContainer = (containerId, target) => ({
    type: multisyncTypes.COPY_DEFAULT_FIELD_ASSOCIATIONS,
    payload: {
        containerId,
        target,
    },
});

export const changeAllFieldAssociationTarget = (leafContainerId, target) => ({
    type: multisyncTypes.CHANGE_ALL_FIELD_ASSOCIATION_TARGET_MULTISYNC,
    payload: {
        leafContainerId,
        target,
    },
});

export const cleanUpCurrentMultisync = () => ({
    type: multisyncTypes.CLEAN_UP_CURRENT_MULTISYNC,
});

export const addMultisync = ({ ...formData
}) => (dispatch, getState) => {
    const state = getState();
    const organizationId = getSelectedOrganizationId(state);

    const payload = fromJS({
        name: formData.multisyncName,
        state: formData.state || multisyncTypes.STATES.ACTIVE,
        topology: formData.topology,
        root: {
            containerId: formData.root.containerId,
            existingContainer: true,
            providerIdentityId: formData.root.providerIdentityId,
            discriminantField: {
                fieldId: formData.root.filter.fieldId,
                kind: formData.root.filter.kind,
            },
        },
        leaves: {
            providerIdentityId: formData.leaves.providerIdentityId,
        },
        defaultFieldAssociations: getMultisyncDefaultFieldAssociations(state),
        organizationId,
    });

    return dispatch({
        types: [
            multisyncTypes.ADD_MULTISYNC_REQUEST,
            multisyncTypes.ADD_MULTISYNC_SUCCESS,
            multisyncTypes.ADD_MULTISYNC_FAILURE,
        ],
        method: routes.METHODS.POST,
        url: routes.API_PATHS.MULTISYNCS,
        payload: payload.toJS(),
    });
};

export const getMultisyncs = () => (dispatch, getState) => {
    const state = getState();
    const selectedOrganizationId = getSelectedOrganizationId(state);

    return dispatch({
        types: [
            multisyncTypes.GET_MULTISYNCS_REQUEST,
            multisyncTypes.GET_MULTISYNCS_SUCCESS,
            multisyncTypes.GET_MULTISYNCS_FAILURE,
        ],
        url: routes.API_PATHS.GET_MULTISYNCS(selectedOrganizationId),
    });
};

export const deleteMultisync = multisyncId => ({
    types: [
        multisyncTypes.DELETE_MULTISYNC_REQUEST,
        multisyncTypes.DELETE_MULTISYNC_SUCCESS,
        multisyncTypes.DELETE_MULTISYNC_FAILURE,
    ],
    method: routes.METHODS.DELETE,
    url: routes.API_PATHS.DELETE_MULTISYNC(multisyncId), // eslint-disable-line
});

// FIXME: Seems to be pretty similar to addMultisyncLinks ...
export const saveMultisync = ({ ...formData
}) => async (dispatch, getState) => {
    const state = getState();
    const {
        multisyncId
    } = formData;
    const organizationId = getSelectedOrganizationId(state);
    const rootSide = formData.topology === multisyncTypes.TOPOLOGIES.SPLIT ? 'A' : 'B';
    const rootContainerName = getContainerById(state, rootSide, formData.root.containerId, 'displayName');
    const leavesSide = getOtherSide(rootSide);
    const syncsPayload = [];

    const newSyncsToCreate = formData.filters.filter(s => !s.existingSync);
    for (const sync of newSyncsToCreate) {
        const {
            containerId
        } = sync;
        const leafContainerName = getContainerById(state, leavesSide, containerId, 'displayName');
        const syncName = formData.topology === multisyncTypes.TOPOLOGIES.SPLIT ?
            `${rootContainerName} - ${leafContainerName}` :
            `${leafContainerName} - ${rootContainerName}`;
        let associations = getFieldAssociationsByContainerId(state, containerId);

        // if there are no custom Field Associations for this sync then set them to the default ones
        if (associations.isEmpty()) {
            associations = getMultisyncDefaultFieldAssociations(state);
        }

        const payload = buildMultisyncSyncsPayload(formData, sync, syncName, associations, multisyncId);
        syncsPayload.push(payload);
    }

    const payload = {
        name: formData.multisyncName,
        state: formData.state || multisyncTypes.STATES.ACTIVE,
        root: {
            providerIdentityId: formData.root.providerIdentityId,
        },
        leaves: {
            providerIdentityId: formData.leaves.providerIdentityId,
        },
        defaultFieldAssociations: getMultisyncDefaultFieldAssociations(state).toJS(),
        organizationId,
        syncs: syncsPayload,
    };

    return dispatch({
        types: [
            multisyncTypes.SAVE_MULTISYNC_REQUEST,
            multisyncTypes.SAVE_MULTISYNC_SUCCESS,
            multisyncTypes.SAVE_MULTISYNC_FAILURE,
        ],
        url: routes.API_PATHS.SAVE_MULTISYNC(multisyncId), // eslint-disable-line
        method: routes.METHODS.PUT,
        payload,
    });
};

export const getMultisync = multisyncId => ({
    types: [
        multisyncTypes.GET_MULTISYNC_REQUEST,
        multisyncTypes.GET_MULTISYNC_SUCCESS,
        multisyncTypes.GET_MULTISYNC_FAILURE,
    ],
    url: routes.API_PATHS.GET_MULTISYNC(multisyncId), // eslint-disable-line
});

export const searchMultisyncs = searchString => ({
    types: [
        multisyncTypes.GET_MULTISYNCS_REQUEST,
        multisyncTypes.GET_MULTISYNCS_SUCCESS,
        multisyncTypes.GET_MULTISYNCS_FAILURE,
    ],
    url: routes.API_PATHS.SEARCH_MULTISYNCS(searchString),
});

export const getContainerMultisyncs = () => (dispatch, getState) => {
    const state = getState();
    const containerId = getDefaultParamContainerId(state, 'A');

    return dispatch({
        types: [
            multisyncTypes.GET_MULTISYNCS_REQUEST,
            multisyncTypes.GET_MULTISYNCS_SUCCESS,
            multisyncTypes.GET_MULTISYNCS_FAILURE,
        ],
        url: routes.API_PATHS.CONTAINER_MULTISYNCS(containerId),
    });
};



// WEBPACK FOOTER //
// ./src/actions/multisyncs.js