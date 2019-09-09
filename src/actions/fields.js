import {
    fromJS
} from 'immutable';

import {
    fieldTypes,
    routes
} from '../consts';
import {
    getContainerFieldValue
} from '../reducers';


export const getWorkflows = containerSide => (dispatch, getState) => {
    const state = getState();
    const containerId = getContainerFieldValue(state, {
        containerSide
    }, 'containerId');
    const providerIdentityId = getContainerFieldValue(state, {
        containerSide
    }, 'providerIdentityId');

    dispatch({
        types: [
            fieldTypes.GET_WORKFLOWS_REQUEST,
            fieldTypes.GET_WORKFLOWS_SUCCESS,
            fieldTypes.GET_WORKFLOWS_FAILURE,
        ],
        meta: {
            containerSide,
            containerId,
            providerIdentityId,
        },
        url: routes.API_PATHS.GET_WORKFLOWS(providerIdentityId, containerId), // eslint-disable-line
    });
};

export const getCustomFields = ({
        containerSide,
        containerId,
        providerIdentityId
    }) =>
    (dispatch, getState) => {
        const state = getState();
        const cId = containerId || getContainerFieldValue(state, {
            containerSide
        }, 'containerId');
        const piId = providerIdentityId || getContainerFieldValue(state, {
            containerSide
        }, 'providerIdentityId');

        dispatch({
            types: [
                fieldTypes.GET_CUSTOM_FIELDS_REQUEST,
                fieldTypes.GET_CUSTOM_FIELDS_SUCCESS,
                fieldTypes.GET_CUSTOM_FIELDS_FAILURE,
            ],
            meta: {
                containerSide,
                containerId: cId,
                providerIdentityId: piId,
            },
            url: routes.API_PATHS.GET_CUSTOM_FIELDS(piId, cId), // eslint-disable-line
        });
    };

export const fetchFieldValue = ({
    containerSide,
    fieldId,
    fieldValueId,
    kind,
    ...rest
}) => (dispatch, getState) => {
    const state = getState();
    // containerId and providerIdentityId are passed directly in the multisync creation form
    // FIXME: Make all components calling fetchFieldValues pass the containerId and providerIdentityId as params
    const containerId = rest.containerId || getContainerFieldValue(state, {
        containerSide
    }, 'containerId');
    const providerIdentityId = rest.providerIdentityId || getContainerFieldValue(state, {
        containerSide
    }, 'providerIdentityId');
    return dispatch({
        types: [
            fieldTypes.GET_FIELD_VALUE_REQUEST,
            fieldTypes.GET_FIELD_VALUE_SUCCESS,
            fieldTypes.GET_FIELD_VALUE_FAILURE,
        ],
        url: routes.API_PATHS.GET_FIELD_VALUE( // eslint-disable-line
            providerIdentityId,
            containerId,
            fieldId,
            kind,
            fieldValueId,
        ),
        meta: {
            containerId,
            fieldId,
            fieldValueId,
            kind,
            providerIdentityId,
        },
    });
};

export const fetchFieldValues = ({
    category,
    containerSide,
    fieldId,
    kind,
    searchString,
    ...rest
}) => (dispatch, getState) => {
    const state = getState();
    // containerId and providerIdentityId are passed directly in the multisync creation form
    // FIXME: Make all components calling fetchFieldValues pass the containerId and providerIdentityId as params
    const containerId = rest.containerId || getContainerFieldValue(state, {
        containerSide
    }, 'containerId');
    const providerIdentityId = rest.providerIdentityId || getContainerFieldValue(state, {
        containerSide
    }, 'providerIdentityId');

    return dispatch({
        types: [
            fieldTypes.GET_FIELD_VALUES_REQUEST,
            fieldTypes.GET_FIELD_VALUES_SUCCESS,
            fieldTypes.GET_FIELD_VALUES_FAILURE,
        ],
        url: routes.API_PATHS.GET_FIELD_VALUES( // eslint-disable-line
            providerIdentityId,
            containerId,
            fieldId,
            kind,
            category,
            searchString,
        ),
        meta: {
            providerIdentityId,
            containerId,
            fieldId,
            kind,
            containerSide,
            category,
            searchString,
        },
    });
};

export const automapFieldValuesMapping = ({
    containerIdA,
    containerIdB,
    providerIdentityIdA,
    providerIdentityIdB,
    fieldAssociation,
    entity,
    fieldAssociationIndex,
    multisyncLeafSide,
}) => ({
    method: routes.METHODS.POST,
    types: [
        fieldTypes.AUTOMAP_FIELD_VALUES_REQUEST,
        fieldTypes.AUTOMAP_FIELD_VALUES_SUCCESS,
        fieldTypes.AUTOMAP_FIELD_VALUES_FAILURE,
    ],
    url: routes.API_PATHS.AUTOMAP_FIELD_VALUES,
    payload: {
        containerIdA,
        providerIdentityIdA,
        fieldIdA: fieldAssociation.getIn(['A', 'field']),
        kindA: fieldAssociation.getIn(['A', 'kind']),
        workflowA: fieldAssociation.getIn(['A', 'mappingCategory']) || 'default',
        containerIdB,
        providerIdentityIdB,
        fieldIdB: fieldAssociation.getIn(['B', 'field']),
        kindB: fieldAssociation.getIn(['B', 'kind']),
        workflowB: fieldAssociation.getIn(['B', 'mappingCategory']) || 'default',
    },
    meta: {
        containerIdA,
        containerIdB,
        providerIdentityIdA,
        providerIdentityIdB,
        fieldAssociation,
        entity,
        fieldAssociationIndex,
        multisyncLeafSide,
    },
});

export const addFieldAssociation = (A, B, target, entity, containerId = null) => ({
    type: fieldTypes.ADD_FIELD_ASSOCIATION,
    payload: {
        fieldAssociation: fromJS({
            A,
            B,
            target
        }),
        entity,
        containerId,
    },
});

export const deleteFieldAssociation = (index, entity, containerId = null) => ({
    type: fieldTypes.DELETE_FIELD_ASSOCIATION,
    payload: {
        index,
        entity,
        containerId,
    },
});

export const addItem = ({
    fieldAssociationIndex,
    containerSide,
    groupIndex,
    fieldId,
    entity,
    containerIdA,
    containerIdB,
    multisyncLeafSide,
}) => ({
    type: fieldTypes.ADD_FIELD_ASSOCIATION_ITEM,
    payload: {
        fieldAssociationIndex,
        containerSide,
        groupIndex,
        fieldId,
        entity,
        containerIdA,
        containerIdB,
        multisyncLeafSide,
    },
});

export const unmapItem = ({
    containerIdA,
    containerIdB,
    containerSide,
    entity,
    fieldAssociationIndex,
    groupIndex,
    itemIndex,
    multisyncLeafSide,
}) => ({
    type: fieldTypes.UNMAP_FIELD_ASSOCIATION_ITEM,
    payload: {
        containerIdA,
        containerIdB,
        containerSide,
        entity,
        fieldAssociationIndex,
        groupIndex,
        itemIndex,
        multisyncLeafSide,
    },
});

export const addNewGroup = ({
    fieldAssociationIndex,
    fieldValueA,
    fieldValueB,
    entity,
    containerIdA,
    containerIdB,
    multisyncLeafSide,
}) => ({
    type: fieldTypes.ADD_FIELD_ASSOCIATION_GROUP,
    payload: {
        fieldAssociationIndex,
        fieldValueA,
        fieldValueB,
        entity,
        containerIdA,
        containerIdB,
        multisyncLeafSide,
    },
});

export const removeGroup = ({
    fieldAssociationIndex,
    groupIndex,
    entity,
    containerIdA,
    containerIdB,
    multisyncLeafSide,
}) => ({
    type: fieldTypes.REMOVE_FIELD_ASSOCIATION_GROUP,
    payload: {
        fieldAssociationIndex,
        groupIndex,
        entity,
        containerIdA,
        containerIdB,
        multisyncLeafSide,
    },
});

export const makeDefaultItem = ({
    containerIdA,
    containerIdB,
    containerSide,
    entity,
    fieldAssociationIndex,
    groupIndex,
    itemIndex,
    multisyncLeafSide,
}) => ({
    type: fieldTypes.MAKE_DEFAULT_FIELD_ASSOCIATION_ITEM,
    payload: {
        containerIdA,
        containerIdB,
        containerSide,
        entity,
        fieldAssociationIndex,
        groupIndex,
        itemIndex,
        multisyncLeafSide,
    },
});

export const changeFieldAssociationTarget = ({
    containerIdA,
    containerIdB,
    entity,
    index,
    multisyncLeafSide,
    target,
}) => ({
    type: fieldTypes.CHANGE_FIELD_ASSOCIATION_TARGET,
    payload: {
        containerIdA,
        containerIdB,
        entity,
        index,
        multisyncLeafSide,
        target,
    },
});

export const generateDefaultFieldAssociations = (A, B) => ({
    method: routes.METHODS.POST,
    types: [
        fieldTypes.GENERATE_FIELD_ASSOCIATIONS_REQUEST,
        fieldTypes.GENERATE_FIELD_ASSOCIATIONS_SUCCESS,
        fieldTypes.GENERATE_FIELD_ASSOCIATIONS_FAILURE,
    ],
    url: routes.API_PATHS.GENERATE_FIELD_ASSOCIATIONS,
    payload: {
        A: {
            providerIdentityId: A.providerIdentityId,
        },
        B: {
            providerIdentityId: B.providerIdentityId,
        },
    },
    meta: {
        A,
        B
    },
});

export const createFieldValue = ({
    containerId,
    displayName,
    fieldId,
    kind,
    providerIdentityId,
    color,
}) => ({
    displayError: false,
    method: routes.METHODS.POST,
    types: [
        fieldTypes.CREATE_FIELD_VALUE_REQUEST,
        fieldTypes.CREATE_FIELD_VALUE_SUCCESS,
        fieldTypes.CREATE_FIELD_VALUE_FAILURE,
    ],
    url: routes.API_PATHS.CREATE_FIELD_VALUE,
    payload: {
        color,
        containerId,
        displayName,
        fieldId,
        kind,
        providerIdentityId,
    },
    meta: {
        color,
        containerId,
        displayName,
        fieldId,
        kind,
        providerIdentityId,
    },
});



// WEBPACK FOOTER //
// ./src/actions/fields.js