import {
    List,
    Map,
    fromJS
} from 'immutable';
import {
    fieldTypes,
    multisyncTypes
} from '../consts';
import {
    normalizeEntitiesById
} from '../utils';

const initialCurrent = Map({
    defaultFieldAssociations: List(),
    defaultFieldAssociationsLoaded: false,
    fieldAssociationsByContainerId: Map(),
    id: null,
});

export const initialState = Map({
    entities: Map(),
    current: initialCurrent,
    isLoaded: false,
});

export default (state = initialState, action) => {
    switch (action.type) {
        case multisyncTypes.GET_MULTISYNCS_SUCCESS:
            {
                const multisyncs = fromJS(action.payload.multisyncs);
                const entities = normalizeEntitiesById(multisyncs);
                return state
                    .merge({
                        isLoaded: true
                    })
                    .set('entities', fromJS(entities));
            }

        case multisyncTypes.GET_MULTISYNCS_FAILURE:
            {
                return state.merge({
                    isLoaded: true
                });
            }

        case multisyncTypes.GET_MULTISYNC_SUCCESS:
            {
                const {
                    multisync
                } = action.payload;
                return state.mergeDeep(fromJS({
                    current: {
                        ...multisync,
                    },
                }));
            }

        case multisyncTypes.DELETE_MULTISYNC_SUCCESS:
            {
                const {
                    multisync
                } = action.payload;
                return state.merge({
                    entities: state.get('entities').delete(`${multisync._id}`),
                });
            }

        case fieldTypes.ADD_FIELD_ASSOCIATION:
            {
                const {
                    fieldAssociation,
                    entity,
                    containerId
                } = action.payload;
                if (entity !== multisyncTypes.ENTITY_NAME) {
                    return state;
                }

                const path = containerId ?
                    ['current', 'fieldAssociationsByContainerId', containerId] :
                    ['current', 'defaultFieldAssociations'];
                const fieldAssociations = state.getIn(path) || List();
                const updatedFieldAssociations = fieldAssociations.unshift(fieldAssociation);
                return state.setIn(path, updatedFieldAssociations);
            }

        case fieldTypes.DELETE_FIELD_ASSOCIATION:
            {
                const {
                    index,
                    entity,
                    containerId
                } = action.payload;
                if (entity !== multisyncTypes.ENTITY_NAME) {
                    return state;
                }

                const path = containerId ?
                    ['current', 'fieldAssociationsByContainerId', containerId, index] :
                    ['current', 'defaultFieldAssociations', index];
                return state.deleteIn(path);
            }

        case multisyncTypes.COPY_DEFAULT_FIELD_ASSOCIATIONS:
            {
                const {
                    containerId,
                    target
                } = action.payload;

                if (state.getIn(['current', 'fieldAssociationsByContainerId', containerId])) {
                    return state;
                }

                let defaultFieldAssociations = state.getIn(['current', 'defaultFieldAssociations'], List());

                if (target) {
                    defaultFieldAssociations = defaultFieldAssociations.map((association) => {
                        if (association.get('target') === fieldTypes.TARGET.BOTH) {
                            return association.set('target', target);
                        }
                        return association;
                    });
                }

                return state.setIn(
                    ['current', 'fieldAssociationsByContainerId', containerId],
                    defaultFieldAssociations,
                );
            }

        case fieldTypes.CHANGE_FIELD_ASSOCIATION_TARGET:
            {
                const {
                    index,
                    target,
                    entity,
                    multisyncLeafSide,
                } = action.payload;

                if (entity !== multisyncTypes.ENTITY_NAME) {
                    return state;
                }

                const pathToTarget = multisyncLeafSide ?
                    ['current', 'fieldAssociationsByContainerId', action.payload[`containerId${multisyncLeafSide}`], index, 'target'] :
                    ['current', 'defaultFieldAssociations', index, 'target'];

                return state.setIn(pathToTarget, target);
            }

        case multisyncTypes.CHANGE_ALL_FIELD_ASSOCIATION_TARGET_MULTISYNC:
            {
                const {
                    leafContainerId,
                    target,
                } = action.payload;

                const pathToFieldAssociations = ['current', 'fieldAssociationsByContainerId', leafContainerId];
                const customFieldAssociations = state.getIn(pathToFieldAssociations, List());

                if (customFieldAssociations.isEmpty()) {
                    return state;
                }

                const newFieldAssociations = customFieldAssociations.map((association) => {
                    if (association.getIn(['A', 'field']) !== fieldTypes.DESCRIPTION_FOOTER &&
                        association.getIn(['B', 'field']) !== fieldTypes.DESCRIPTION_FOOTER) {
                        return association.set('target', target);
                    }
                    return association;
                });

                return state.setIn(pathToFieldAssociations, newFieldAssociations);
            }

        case fieldTypes.GENERATE_FIELD_ASSOCIATIONS_SUCCESS:
            {
                const {
                    fieldAssociations
                } = action.payload;

                return state
                    .setIn(['current', 'defaultFieldAssociationsLoaded'], true)
                    .setIn(['current', 'defaultFieldAssociations'], fromJS(fieldAssociations));
            }

        case fieldTypes.AUTOMAP_FIELD_VALUES_SUCCESS:
            {
                const {
                    meta: {
                        fieldAssociationIndex,
                        entity,
                        multisyncLeafSide,
                    },
                    payload,
                } = action;

                if (entity !== multisyncTypes.ENTITY_NAME) {
                    return state;
                }

                const pathToFieldAssociations = ['current', 'fieldAssociationsByContainerId', action.meta[`containerId${multisyncLeafSide}`]];
                const updatedState = state.mergeDeepIn(
                    [...pathToFieldAssociations, fieldAssociationIndex, 'A'],
                    fromJS({
                        mapping: payload.A.mappingIds
                    }),
                );

                return updatedState.mergeDeepIn(
                    pathToFieldAssociations.concat([fieldAssociationIndex, 'B']),
                    fromJS({
                        mapping: payload.B.mappingIds
                    }),
                );
            }

        case multisyncTypes.CLEAN_UP_CURRENT_MULTISYNC:
            {
                return state.set('current', initialCurrent);
            }

        case fieldTypes.ADD_FIELD_ASSOCIATION_GROUP:
            {
                const {
                    fieldAssociationIndex,
                    fieldValueA,
                    fieldValueB,
                    entity,
                    multisyncLeafSide,
                } = action.payload;

                if (entity !== multisyncTypes.ENTITY_NAME) {
                    return state;
                }

                const pathToAssociation = [
                    'current',
                    'fieldAssociationsByContainerId',
                    action.payload[`containerId${multisyncLeafSide}`],
                    fieldAssociationIndex,
                ];

                const newMappingValuesA = state.getIn([...pathToAssociation, 'A', 'mapping']).unshift(List([fieldValueA.id]));
                const newMappingValuesB = state.getIn([...pathToAssociation, 'B', 'mapping']).unshift(List([fieldValueB.id]));

                return state
                    .setIn([...pathToAssociation, 'A', 'mapping'], newMappingValuesA)
                    .setIn([...pathToAssociation, 'B', 'mapping'], newMappingValuesB);
            }

        case fieldTypes.REMOVE_FIELD_ASSOCIATION_GROUP:
            {
                const {
                    fieldAssociationIndex,
                    groupIndex,
                    entity,
                    multisyncLeafSide,
                } = action.payload;

                if (entity !== multisyncTypes.ENTITY_NAME) {
                    return state;
                }

                const pathToAssociation = [
                    'current',
                    'fieldAssociationsByContainerId',
                    action.payload[`containerId${multisyncLeafSide}`],
                    fieldAssociationIndex,
                ];
                return state
                    .deleteIn([...pathToAssociation, 'A', 'mapping', groupIndex])
                    .deleteIn([...pathToAssociation, 'B', 'mapping', groupIndex]);
            }

        case fieldTypes.ADD_FIELD_ASSOCIATION_ITEM:
            {
                const {
                    containerSide,
                    entity,
                    fieldAssociationIndex,
                    fieldId,
                    groupIndex,
                    multisyncLeafSide,
                } = action.payload;

                if (entity !== multisyncTypes.ENTITY_NAME) {
                    return state;
                }

                const pathToGroup = [
                    'current',
                    'fieldAssociationsByContainerId',
                    action.payload[`containerId${multisyncLeafSide}`],
                    fieldAssociationIndex,
                    containerSide,
                    'mapping',
                    groupIndex,
                ];

                const newGroupValues = state.getIn(pathToGroup).push(fieldId);

                return state.setIn(pathToGroup, newGroupValues);
            }

        case fieldTypes.UNMAP_FIELD_ASSOCIATION_ITEM:
            {
                const {
                    fieldAssociationIndex,
                    containerSide,
                    multisyncLeafSide,
                    groupIndex,
                    itemIndex,
                    entity,
                } = action.payload;

                if (entity !== multisyncTypes.ENTITY_NAME) {
                    return state;
                }

                const containerId = action.payload[`containerId${multisyncLeafSide}`];
                const otherSide = containerSide === 'A' ? 'B' : 'A';
                const pathToSide = [
                    'current',
                    'fieldAssociationsByContainerId',
                    containerId,
                    fieldAssociationIndex,
                    containerSide,
                    'mapping',
                    groupIndex,
                ];
                const pathToOtherSide = [
                    'current',
                    'fieldAssociationsByContainerId',
                    containerId,
                    fieldAssociationIndex,
                    otherSide,
                    'mapping',
                    groupIndex,
                ];
                const newState = state.deleteIn([...pathToSide, itemIndex]);

                // If no more items in the group mapping, remove it
                const sideGroup = newState.getIn(pathToSide);
                const otherSideGroup = newState.getIn(pathToOtherSide);
                if (sideGroup.isEmpty() && otherSideGroup.isEmpty()) {
                    return newState.deleteIn(pathToSide).deleteIn(pathToOtherSide);
                }

                return newState;
            }

        case fieldTypes.MAKE_DEFAULT_FIELD_ASSOCIATION_ITEM:
            {
                const {
                    containerSide,
                    fieldAssociationIndex,
                    groupIndex,
                    itemIndex,
                    entity,
                    multisyncLeafSide,
                } = action.payload;

                if (entity !== multisyncTypes.ENTITY_NAME) {
                    return state;
                }

                const pathToGroup = [
                    'current',
                    'fieldAssociationsByContainerId',
                    action.payload[`containerId${multisyncLeafSide}`],
                    fieldAssociationIndex,
                    containerSide,
                    'mapping',
                    groupIndex,
                ];

                const newDefaultItem = state.getIn([...pathToGroup, itemIndex]);
                const newMapping = state.getIn(pathToGroup).delete(itemIndex).unshift(newDefaultItem);
                return state.setIn(pathToGroup, newMapping);
            }

        default:
            return state;
    }
};

export const isLoaded = state => state.get('isLoaded');

export const getFieldAssociationsByContainerId = (state, containerId) =>
    state.getIn(['current', 'fieldAssociationsByContainerId', containerId], List());

export const getDefaultFieldAssociations = state =>
    state.getIn(['current', 'defaultFieldAssociations'], List());

export const isLoadedDefaultFieldAssociations = state =>
    state.getIn(['current', 'defaultFieldAssociationsLoaded'], false);

export const getSortedMultisyncs = (state) => {
    const multisyncs = List(state.get('entities').toArray());
    return multisyncs.sortBy(multisync => multisync.get('name').toLowerCase());
};

export const getCurrentMultisync = state => state.get('current', Map());



// WEBPACK FOOTER //
// ./src/reducers/multisyncs.js