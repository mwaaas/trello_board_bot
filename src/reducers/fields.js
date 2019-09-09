import {
    Map,
    fromJS
} from 'immutable';
import {
    actionTypes
} from 'redux-form';

import {
    fieldTypes
} from '../consts';
import {
    normalizeEntitiesById
} from '../utils';


const {
    CUSTOM_FIELD,
    PCD_FIELD
} = fieldTypes.KINDS;

export const initialState = Map({
    [CUSTOM_FIELD]: Map(),
    [PCD_FIELD]: Map(),
    isLoaded: Map({
        A: Map(),
        B: Map(),
    }),
    isLoading: Map({
        A: Map(),
        B: Map(),
    }),
    loadingFieldValues: Map({
        A: Map(),
        B: Map(),
    }),
    workflows: Map({
        A: Map(),
        B: Map(),
    }),
});

export default (state = initialState, action) => {
    switch (action.type) {
        case fieldTypes.GET_FIELD_VALUES_REQUEST:
        case fieldTypes.AUTOMAP_FIELD_VALUES_REQUEST:
            {
                const {
                    containerSide,
                    fieldId
                } = action.meta;
                return state.setIn(['loadingFieldValues', containerSide, fieldId], true);
            }

        case fieldTypes.GET_FIELD_VALUES_FAILURE:
        case fieldTypes.AUTOMAP_FIELD_VALUES_FAILURE:
            {
                const {
                    containerSide,
                    fieldId
                } = action.meta;

                return state.deleteIn(['loadingFieldValues', containerSide, fieldId]);
            }

        case fieldTypes.GET_CUSTOM_FIELDS_FAILURE:
            {
                const {
                    meta: {
                        containerSide
                    },
                } = action;

                return state.setIn(['isLoading', containerSide, CUSTOM_FIELD], false);
            }

        case fieldTypes.GET_CUSTOM_FIELDS_REQUEST:
            {
                const {
                    meta: {
                        containerSide
                    },
                } = action;

                return state.setIn(['isLoading', containerSide, CUSTOM_FIELD], true);
            }

        case fieldTypes.GET_CUSTOM_FIELDS_SUCCESS:
            {
                const {
                    payload,
                    meta: {
                        containerSide
                    },
                } = action;

                const customFields = normalizeEntitiesById(fromJS(payload.customFields));

                return state
                    .setIn([CUSTOM_FIELD, containerSide], customFields)
                    .setIn(['isLoading', containerSide, CUSTOM_FIELD], false)
                    .setIn(['isLoaded', containerSide, CUSTOM_FIELD], true);
            }

        case fieldTypes.GET_FIELD_VALUES_SUCCESS:
            {
                const {
                    containerSide,
                    fieldId,
                    kind
                } = action.meta;
                const fieldValues = fromJS(action.payload.fieldValues);
                const entitiesById = normalizeEntitiesById(fieldValues);

                let path = [kind, containerSide, fieldId];

                if (kind === CUSTOM_FIELD) {
                    path = [...path, 'values'];
                }

                return state
                    .mergeIn(path, entitiesById)
                    .deleteIn(['loadingFieldValues', containerSide, fieldId]);
            }

        case fieldTypes.AUTOMAP_FIELD_VALUES_SUCCESS:
            {
                const {
                    meta: {
                        fieldAssociation
                    },
                    payload
                } = action;
                const fieldIdA = fieldAssociation.getIn(['A', 'field']);
                const fieldIdB = fieldAssociation.getIn(['B', 'field']);
                const kindA = fieldAssociation.getIn(['A', 'kind']);
                const kindB = fieldAssociation.getIn(['B', 'kind']);
                let pathA = [kindA, 'A', fieldIdA];
                let pathB = [kindB, 'B', fieldIdB];
                if (kindA === CUSTOM_FIELD) {
                    pathA = [...pathA, 'values'];
                }
                if (kindB === CUSTOM_FIELD) {
                    pathB = [...pathB, 'values'];
                }
                const valuesA = normalizeEntitiesById(fromJS(payload.A.values));
                const valuesB = normalizeEntitiesById(fromJS(payload.B.values));

                return state
                    .setIn(pathA, valuesA)
                    .setIn(pathB, valuesB)
                    .merge({
                        isLoadingFieldValues: false
                    });
            }

        case fieldTypes.ADD_FIELD_ASSOCIATION_GROUP:
            {
                const {
                    fieldValueA,
                    fieldValueB,
                } = action.payload;

                let pathA = [fieldValueA.kind, 'A', fieldValueA.fieldId];
                if (fieldValueA.kind === CUSTOM_FIELD) {
                    pathA = [...pathA, 'values'];
                }

                let pathB = [fieldValueB.kind, 'B', fieldValueB.fieldId];
                if (fieldValueB.kind === CUSTOM_FIELD) {
                    pathB = [...pathB, 'values'];
                }

                return state
                    .mergeIn([...pathA, fieldValueA.id], fromJS(fieldValueA))
                    .mergeIn([...pathB, fieldValueB.id], fromJS(fieldValueB));
            }

        case fieldTypes.GET_WORKFLOWS_SUCCESS:
            {
                const {
                    payload,
                    meta: {
                        containerSide
                    },
                } = action;

                if (payload.workflows.length > 0) {
                    const workflows = fromJS(payload.workflows);
                    return state.setIn(['workflows', containerSide, 'status'], normalizeEntitiesById(workflows));
                }

                return state;
            }

        case actionTypes.DESTROY:
            {
                const forms = action.meta.form || [];
                if (forms.includes('syncForm') || forms.includes('multisyncForm')) {
                    return state.clear().merge(initialState);
                }
                return state;
            }

        default:
            {
                return state;
            }
    }
};

export const isLoadedUsers = (state) => {
    const isLoadedA = !!state.getIn([PCD_FIELD, 'A', 'users']);
    const isLoadedB = !!state.getIn([PCD_FIELD, 'B', 'users']);

    return isLoadedA && isLoadedB;
};

export const getMappingCategories = (state, containerSide) => {
    if (containerSide) {
        return state.getIn(['workflows', containerSide], Map());
    }

    return state.get('workflows', Map());
};

export const getCustomFields = (state, containerSide) => {
    if (containerSide) {
        return state.getIn([CUSTOM_FIELD, containerSide], Map());
    }
    return state.get(CUSTOM_FIELD, Map());
};

export const getCustomFieldValuesById = (state, customFieldId, containerSide) => {
    const customFields = getCustomFields(state, containerSide);
    return customFields.getIn([customFieldId, 'values'], Map());
};

export const getPcdFieldValuesByName = (state, pcdName, containerSide) => state.getIn([PCD_FIELD, containerSide, pcdName], Map());

export const getFieldValues = (state, kind, fieldId, containerSide) => {
    if (kind === PCD_FIELD) {
        return getPcdFieldValuesByName(state, fieldId, containerSide);
    }

    return getCustomFieldValuesById(state, fieldId, containerSide);
};

export const getDefaultWorkflowId = (state, containerSide, fieldId) => {
    const workflows = state.getIn(['workflows', containerSide, fieldId], Map());
    const workflow = workflows.find(w => w.get('default'), undefined, Map());
    return workflow.get('id', 'default');
};

export const isLoadedCustomFields = (state, {
    containerSide
}) => state.getIn(['isLoaded', containerSide, CUSTOM_FIELD], false);

export const isLoadingFieldValue = (state, containerSide, fieldId) => !!state.getIn(['loadingFieldValues', containerSide, fieldId]);

export const isLoadingFieldValues = state => !state.getIn(['loadingFieldValues', 'A'], Map()).isEmpty() ||
    !state.getIn(['loadingFieldValues', 'B'], Map()).isEmpty();

export const getIsCustomFieldsLoading = state => state.getIn(['isLoading', 'A', CUSTOM_FIELD], false) ||
    state.getIn(['isLoading', 'B', CUSTOM_FIELD], false);



// WEBPACK FOOTER //
// ./src/reducers/fields.js