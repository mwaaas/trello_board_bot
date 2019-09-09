import {
    Map,
    List,
    fromJS
} from 'immutable';
import {
    actionTypes
} from 'redux-form';

import {
    containerTypes,
    fieldTypes,
    linkTypes,
    mappingTypes,
    providerIdentityTypes,
} from '../consts';

import {
    normalizeAndMergeEntitiesBy,
    normalizeEntitiesById
} from '../utils';


const initialCurrent = Map({
    allowedProviderIdentities: Map(),
    mappings: Map(),
    syncSettings: Map({
        fieldAssociations: List(),
    }),
    isLoaded: false,
    isLoading: false,
    isReviewing: false,
});

export const initialState = Map({
    entities: Map(),
    current: initialCurrent,
    isSavingSync: false,
    isFetchingSyncStates: false,
    isLoaded: false,
    diagnostic: Map({
        result: undefined,
        isLoading: false,
    }),
});

export default (state = initialState, action) => {
    switch (action.type) {
        case linkTypes.GET_LINKS_REQUEST:
            return state.merge({
                isLoaded: false
            });

        case linkTypes.GET_LINKS_SUCCESS:
            {
                const linksById = {};
                action.payload.links.forEach((link) => {
                    linksById[link._id] = link;
                });
                return state
                    .merge({
                        isLoaded: true
                    })
                    .set('entities', fromJS(linksById));
            }

        case linkTypes.GET_LINKS_FAILURE:
            {
                return state.merge({
                    isLoaded: true
                });
            }

        case linkTypes.ADD_LINK_REQUEST:
        case linkTypes.SAVE_LINK_REQUEST:
        case linkTypes.SET_AUTO_SYNC_LINK_REQUEST:
        case linkTypes.SET_MANUAL_SYNC_LINK_REQUEST:
            return state.merge({
                isSavingSync: true
            });

        case linkTypes.ADD_LINK_SUCCESS:
        case linkTypes.SET_MANUAL_SYNC_LINK_SUCCESS:
        case linkTypes.SET_AUTO_SYNC_LINK_SUCCESS:
            {
                const {
                    link
                } = action.payload;
                return state
                    .merge({
                        isSavingSync: false
                    })
                    .merge({
                        entities: state.get('entities').mergeIn([`${link._id}`], fromJS(link)),
                    });
            }

        case linkTypes.ADD_LINK_FAILURE:
        case linkTypes.SET_AUTO_SYNC_LINK_FAILURE:
        case linkTypes.SET_MANUAL_SYNC_LINK_FAILURE:
            return state.merge({
                isSavingSync: false
            });

        case linkTypes.SAVE_LINK_SUCCESS:
            {
                const {
                    link
                } = action.payload;
                return state
                    .merge({
                        isLoaded: true,
                        isSavingSync: false,
                        entities: state.get('entities').mergeIn([`${link._id}`], fromJS(link)),
                    })
                    .mergeIn(['current', 'isLoaded'], true);
            }

        case mappingTypes.MAP_USERS:
            {
                const {
                    idA,
                    idB
                } = action.payload;

                const mappingPathA = ['current', 'syncSettings', 'A', 'user', 'mapping'];
                const mappingPathB = ['current', 'syncSettings', 'B', 'user', 'mapping'];

                const newMappingA = state.getIn(mappingPathA, List()).push(List([idA]));
                const newMappingB = state.getIn(mappingPathB, List()).push(List([idB]));

                return state
                    .setIn(mappingPathA, newMappingA)
                    .setIn(mappingPathB, newMappingB);
            }

        case mappingTypes.UNMAP_USERS:
            {
                const {
                    index
                } = action.payload;

                return state
                    .deleteIn(['current', 'syncSettings', 'A', 'user', 'mapping', index])
                    .deleteIn(['current', 'syncSettings', 'B', 'user', 'mapping', index]);
            }

        case linkTypes.GET_LINK_SUCCESS:
            {
                const {
                    link,
                    syncHistory
                } = action.payload;

                return state.mergeDeep(fromJS({
                    current: {
                        isLoading: false,
                        isLoaded: true,
                        ...link,
                        syncHistory,
                    },
                }));
            }

            // TODO: Remove me when syncHistory is stored in MongoDB
        case linkTypes.GET_LINK_DASHBOARD_SUCCESS:
            {
                const {
                    payload: {
                        syncHistory
                    },
                    meta: {
                        linkId
                    },
                } = action;

                return state
                    .setIn(['entities', linkId, 'syncHistory'], fromJS(syncHistory))
                    .setIn(['entities', linkId, 'syncHistoryHasLoaded'], true)
                    .setIn(['entities', linkId, 'syncHistoryUpdatedAt'], Date.now());
            }

        case linkTypes.DELETE_LINK_SUCCESS:
            {
                const {
                    link
                } = action.payload;
                return state.merge({
                    entities: state.get('entities').delete(`${link._id}`),
                });
            }

        case linkTypes.SYNC_LINK_SUCCESS:
            {
                const {
                    link
                } = action.payload;
                if (!link) {
                    return state;
                }

                return state.merge({
                    entities: state.get('entities').set(link._id, fromJS(link))
                });
            }

        case linkTypes.GET_LINK_REQUEST:
            {
                return state
                    .set('current', initialCurrent)
                    .setIn(['current', 'isLoading'], true);
            }

        case linkTypes.GET_LINK_FAILURE:
            {
                return state.set('current', initialCurrent);
            }

        case actionTypes.CHANGE:
            {
                const {
                    payload,
                    meta: {
                        field,
                        form
                    },
                } = action;

                if (form === 'syncForm' && payload) {
                    if (['A.containerId', 'A.workspaceId', 'B.containerId', 'B.workspaceId'].includes(field)) {
                        return state.set('current', initialCurrent);
                    }
                }

                return state;
            }

        case actionTypes.DESTROY:
            {
                const forms = action.meta.form || [];
                if (forms.includes('syncForm')) {
                    return state.set('current', initialCurrent);
                }
                return state;
            }

        case providerIdentityTypes.GET_ALLOWED_PROVIDER_IDENTITIES_SUCCESS:
            {
                const {
                    meta: {
                        containerId,
                        providerIdentityId,
                        formName
                    },
                    payload: {
                        providerIdentityIds
                    },
                } = action;

                if (formName === 'syncForm') {
                    return state.setIn(
                        ['current', 'allowedProviderIdentities', containerId],
                        // We need to add the original provider identity to the allowed ones.
                        // Otherwise it might disappear from the list, if the provider identity is disconnected
                        fromJS([providerIdentityId, ...providerIdentityIds]),
                    );
                }

                return state;
            }

        case fieldTypes.AUTOMAP_FIELD_VALUES_SUCCESS:
            {
                const {
                    meta: {
                        fieldAssociationIndex,
                        entity,
                    },
                    payload,
                } = action;

                if (entity !== linkTypes.ENTITY_NAME) {
                    return state;
                }

                const pathToFieldAssociations = ['current', 'syncSettings', 'fieldAssociations'];
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

        case fieldTypes.ADD_FIELD_ASSOCIATION:
            {
                const {
                    fieldAssociation,
                    entity
                } = action.payload;
                if (entity !== linkTypes.ENTITY_NAME) {
                    return state;
                }

                const fieldAssociations = state.getIn(['current', 'syncSettings', 'fieldAssociations']) || List();
                const updatedFieldAssociations = fieldAssociations.unshift(fieldAssociation);

                return state.setIn(
                    ['current', 'syncSettings', 'fieldAssociations'],
                    updatedFieldAssociations,
                );
            }

        case fieldTypes.DELETE_FIELD_ASSOCIATION:
            {
                const {
                    index,
                    entity
                } = action.payload;
                if (entity !== linkTypes.ENTITY_NAME) {
                    return state;
                }

                return state.deleteIn(['current', 'syncSettings', 'fieldAssociations', index]);
            }

        case fieldTypes.CHANGE_FIELD_ASSOCIATION_TARGET:
            {
                const {
                    index,
                    target,
                    entity
                } = action.payload;
                if (entity !== linkTypes.ENTITY_NAME) {
                    return state;
                }

                const pathToTarget = [
                    'current',
                    'syncSettings',
                    'fieldAssociations',
                    index,
                    'target',
                ];
                return state.setIn(pathToTarget, target);
            }

        case linkTypes.CHANGE_ALL_FIELD_ASSOCIATION_TARGET:
            {
                const {
                    target
                } = action.payload;
                const pathToFieldAssociations = [
                    'current',
                    'syncSettings',
                    'fieldAssociations',
                ];

                const fieldAssociations = state.getIn(pathToFieldAssociations);
                const newFieldAssociations = fieldAssociations.map((association) => {
                    if (association.getIn(['A', 'field']) !== fieldTypes.DESCRIPTION_FOOTER &&
                        association.getIn(['B', 'field']) !== fieldTypes.DESCRIPTION_FOOTER) {
                        return association.set('target', target);
                    }
                    return association;
                });

                return state.setIn(pathToFieldAssociations, newFieldAssociations);
            }

        case linkTypes.GET_LINKS_SYNC_STATES_REQUEST:
            {
                return state.merge({
                    isFetchingSyncStates: true,
                });
            }

        case linkTypes.GET_LINKS_SYNC_STATES_FAILURE:
            {
                return state.merge({
                    isFetchingSyncStates: false,
                });
            }

        case linkTypes.GET_LINKS_SYNC_STATES_SUCCESS:
            {
                const {
                    linkStates
                } = action.payload;
                const normalizedLinks = normalizeEntitiesById(fromJS(linkStates));
                const updatedLinks = state.get('entities').mergeDeep(normalizedLinks);
                return state.merge({
                    entities: updatedLinks,
                    isFetchingSyncStates: false,
                });
            }

        case fieldTypes.UNMAP_FIELD_ASSOCIATION_ITEM:
            {
                const {
                    fieldAssociationIndex,
                    containerSide,
                    groupIndex,
                    itemIndex,
                    entity,
                } = action.payload;

                if (entity !== linkTypes.ENTITY_NAME) {
                    return state;
                }

                const otherSide = containerSide === 'A' ? 'B' : 'A';
                const pathToSide = [
                    'current',
                    'syncSettings',
                    'fieldAssociations',
                    fieldAssociationIndex,
                    containerSide,
                    'mapping',
                    groupIndex,
                ];
                const pathToOtherSide = [
                    'current',
                    'syncSettings',
                    'fieldAssociations',
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
                    entity,
                    fieldAssociationIndex,
                    groupIndex,
                    itemIndex,
                } = action.payload;

                if (entity !== linkTypes.ENTITY_NAME) {
                    return state;
                }

                const pathToGroup = [
                    'current',
                    'syncSettings',
                    'fieldAssociations',
                    fieldAssociationIndex,
                    containerSide,
                    'mapping',
                    groupIndex,
                ];
                const newDefaultItem = state.getIn([...pathToGroup, itemIndex]);
                const newMapping = state.getIn(pathToGroup).delete(itemIndex).unshift(newDefaultItem);
                return state.setIn(pathToGroup, newMapping);
            }

        case fieldTypes.ADD_FIELD_ASSOCIATION_ITEM:
            {
                const {
                    fieldAssociationIndex,
                    containerSide,
                    fieldId,
                    groupIndex,
                    entity,
                } = action.payload;

                if (entity !== linkTypes.ENTITY_NAME) {
                    return state;
                }

                const pathToGroup = [
                    'current',
                    'syncSettings',
                    'fieldAssociations',
                    fieldAssociationIndex,
                    containerSide,
                    'mapping',
                    groupIndex,
                ];

                const newGroupValues = state.getIn(pathToGroup).push(fieldId);

                return state.setIn(pathToGroup, newGroupValues);
            }

        case fieldTypes.ADD_FIELD_ASSOCIATION_GROUP:
            {
                const {
                    fieldAssociationIndex,
                    fieldValueA,
                    fieldValueB,
                    entity,
                } = action.payload;

                if (entity !== linkTypes.ENTITY_NAME) {
                    return state;
                }

                const pathToAssociation = [
                    'current',
                    'syncSettings',
                    'fieldAssociations',
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
                    entity
                } = action.payload;

                if (entity !== linkTypes.ENTITY_NAME) {
                    return state;
                }

                const pathToAssociation = [
                    'current',
                    'syncSettings',
                    'fieldAssociations',
                    fieldAssociationIndex,
                ];
                return state
                    .deleteIn([...pathToAssociation, 'A', 'mapping', groupIndex])
                    .deleteIn([...pathToAssociation, 'B', 'mapping', groupIndex]);
            }

        case linkTypes.LINK_REVIEW_REQUEST:
            {
                return state.setIn(['current', 'isReviewing'], true);
            }

        case linkTypes.LINK_REVIEW_FAILURE:
            {
                return state.setIn(['current', 'isReviewing'], false);
            }

        case linkTypes.LINK_REVIEW_SUCCESS:
            {
                const {
                    multiSync
                } = action.payload;
                return state
                    .setIn(['current', 'isMultiSync'], multiSync)
                    .setIn(['current', 'isReviewing'], false);
            }

        case containerTypes.GET_LINK_CONTAINER_BY_SIDE_SUCCESS:
            {
                const {
                    side
                } = action.meta;
                return state.setIn(['current', side, 'container', 'checked'], true);
            }

        case containerTypes.GET_LINK_CONTAINER_BY_SIDE_FAILURE:
            {
                const {
                    side
                } = action.meta;
                const newState = state.setIn(['current', side, 'container', 'checked'], true);

                if ([403, 404, 410].includes(action.error.code)) {
                    return newState
                        .setIn(['current', 'state'], linkTypes.LINK_STATES.INACCESSIBLE)
                        .setIn(['current', side, 'container', 'state'], containerTypes.STATE.INACCESSIBLE)
                        .setIn(['current', side, 'container', 'errorMessage'], action.error.message);
                }

                if (action.error.code === 401) {
                    return newState
                        .setIn(['current', 'state'], linkTypes.LINK_STATES.DISCONNECTED)
                        .setIn(['current', side, 'providerIdentity', 'state'], providerIdentityTypes.STATE.DISABLED)
                        .setIn(['current', side, 'providerIdentity', 'errorMessage'], action.error.message);
                }

                return newState;
            }

        case linkTypes.DIAGNOSE_LINK_REQUEST:
            {
                return state.setIn(['diagnostic', 'result'], undefined).setIn(['diagnostic', 'isLoading'], true);
            }
        case linkTypes.DIAGNOSE_LINK_SUCCESS:
            {
                const {
                    result
                } = action.payload;
                return state.setIn(['diagnostic', 'result'], result).setIn(['diagnostic', 'isLoading'], false);
            }
        case linkTypes.DIAGNOSE_LINK_FAILURE:
            {
                return state.setIn(['diagnostic', 'result'], {
                    error: 'error'
                }).setIn(['diagnostic', 'isLoading'], false);
            }
        case linkTypes.RESET_DIAGNOSTIC:
            {
                return state.setIn(['diagnostic', 'result'], undefined).setIn(['diagnostic', 'isLoading'], false);
            }

        default:
            {
                return state;
            }
    }
};

export const getAllowedProviderIdentities = (state, containerId, defaultProviderIdentityId) => state.getIn(
    ['current', 'allowedProviderIdentities', containerId],
    List([defaultProviderIdentityId]),
);

export const getCurrentSyncId = state => state.getIn(['current', '_id'], '');

export const getCurrentLinkName = (state) => {
    const linkName = state.getIn(['current', 'name'], '');
    const fallBackContainerNameA = state.getIn(['current', 'A', 'container', 'displayName'], '');

    // Older links that did not have names used containerNameA as a display.
    return linkName || fallBackContainerNameA;
};

export const getCurrentLinkKind = state => state.getIn(['current', 'kind']);

export const getCurrentSyncOwner = state => state.getIn(['current', 'user'], Map());

export const getCurrentLinkState = state => state.getIn(['current', 'state'], '');

export const getCurrentSyncHistory = (state) => {
    const syncHistory = state
        .getIn(['current', 'syncHistory'], List())
        .sortBy(sync => sync.get('endTime'))
        .reverse()
        .map((sync) => {
            const operationsCount = sync.getIn(['operations', 'A', 'comments', 'created'], 0) +
                sync.getIn(['operations', 'A', 'comments', 'updated'], 0) +
                sync.getIn(['operations', 'A', 'tasks', 'created'], 0) +
                sync.getIn(['operations', 'A', 'tasks', 'updated'], 0) +
                sync.getIn(['operations', 'B', 'comments', 'created'], 0) +
                sync.getIn(['operations', 'B', 'comments', 'updated'], 0) +
                sync.getIn(['operations', 'B', 'tasks', 'created'], 0) +
                sync.getIn(['operations', 'B', 'tasks', 'updated'], 0);

            const errorsCount = sync.get('errorDetails', List()).size;

            return sync
                .set('operationsCount', operationsCount)
                .set('errorsCount', errorsCount);
        })
        .reduce((compactSyncHistory, sync) => {
            const operationsCount = sync.get('operationsCount');
            const errorsCount = sync.get('errorsCount');
            const previousOperationsCount = compactSyncHistory.getIn([-1, 'operationsCount']);
            const previousErrorsCount = compactSyncHistory.getIn([-1, 'errorsCount']);

            const syncSummary = Map({
                id: sync.get('id'),
                endTime: sync.get('endTime'),
            });

            const shouldAddEntry = !!operationsCount ||
                !!errorsCount ||
                !!previousOperationsCount ||
                !!previousErrorsCount ||
                compactSyncHistory.isEmpty();

            let currentSync = sync;
            // Adding an entry to syncHistory
            if (shouldAddEntry) {
                // Adding sync list to no-changes entry
                if (!operationsCount && !errorsCount) {
                    currentSync = sync.set('syncs', List([syncSummary]));
                }

                return compactSyncHistory.push(currentSync);
            }

            // Update last (no-changes) entry.
            return compactSyncHistory.update(-1,
                lastSync => lastSync
                .set('syncs', lastSync.get('syncs', List()).push(syncSummary))
                .set('startTime', sync.get('startTime')));
        }, List())
        .filterNot((sync) => {
            const isNoChangesEntry = sync.get('syncs');
            const duration = sync.get('endTime') - sync.get('startTime');

            // Removes no-changes entries that are shorter than 15 minutes.
            return isNoChangesEntry && duration <= 1000 * 60 * 15;
        })
        .filter((sync, index) => index < 12);

    return syncHistory;
};

export const getFieldAssociationByIndex = (state, index) => state.getIn(['current', 'syncSettings', 'fieldAssociations', index], Map());

export const getFieldIdsAssociationByIndex = (state, index) => {
    const fieldAssociation = state.getIn(['current', 'syncSettings', 'fieldAssociations', index], Map());
    return Map({
        A: fieldAssociation.getIn(['A', 'field']),
        B: fieldAssociation.getIn(['B', 'field']),
    });
};

export const getMappingIdsAssociationByIndex = (state, index) => {
    const fieldAssociation = state.getIn(['current', 'syncSettings', 'fieldAssociations', index], Map());
    return Map({
        A: fieldAssociation.getIn(['A', 'mapping']),
        B: fieldAssociation.getIn(['B', 'mapping']),
    });
};

export const getSyncSettings = (state, containerSide) => {
    if (containerSide) {
        return state.getIn(['current', 'syncSettings', containerSide], Map());
    }

    return state.getIn(['current', 'syncSettings'], Map());
};

export const getFieldAssociations = state => state.getIn(['current', 'syncSettings', 'fieldAssociations']) || List();

export const getFieldAssociationByName = (state, name) =>
    getFieldAssociations(state).find(association => association.getIn(['A', 'field']) === name) || Map();

export const getUserMapping = (state, containerSide) => state.getIn(['current', 'syncSettings', containerSide, 'user', 'mapping'], List());

export const isFetchingSyncStates = state => state.get('isFetchingSyncStates');

export const getLinks = state => state.get('entities');

export const getSortedLinks = state => state.get('entities').sortBy((link) => {
    const nameB = link.get('name') || link.getIn(['A', 'container', 'displayName']) || '';
    return nameB.toLowerCase();
});

export const getSyncingLinkIds = state => state.get('entities')
    .filter(link => link.get('syncState') === linkTypes.LINK_SYNC_STATES.SYNCING)
    .map(link => link.get('_id'));

export const isCurrentLoaded = (state) => {
    const linkLoaded = state.getIn(['current', 'isLoaded'], false);
    const containerAChecked = state.getIn(['current', 'A', 'container', 'checked'], false);
    const containerBChecked = state.getIn(['current', 'B', 'container', 'checked'], false);

    return linkLoaded && containerAChecked && containerBChecked;
};

export const getCurrentManualOptions = state => state.getIn(['current', 'syncSettings', 'manualOptions'], Map());

// FIXME: Why do we have this?? #Nilo
export const getCurrentUserMappingError = state => state.getIn(['current', 'mappings', 'user', 'hasError'], false);

export const isMultiSync = state => state.getIn(['current', 'isMultiSync']);

export const isGrandfathered = state => state.getIn(['current', 'isGrandfathered']);

export const isReviewing = state => state.getIn(['current', 'isReviewing']);

export const isSameProviderInstance = (state) => {
    const providerNameA = state.getIn(['current', 'A', 'providerIdentity', 'providerName']);
    const providerNameB = state.getIn(['current', 'B', 'providerIdentity', 'providerName']);
    const domainA = state.getIn(['current', 'A', 'providerIdentity', 'domain']);
    const domainB = state.getIn(['current', 'B', 'providerIdentity', 'domain']);
    return providerNameA === providerNameB && domainA === domainB;
};

export const isLoaded = state => state.get('isLoaded');

export const getDiagnosticResult = state => state.getIn(['diagnostic', 'result']);

export const isDiagnosticLoading = state => state.getIn(['diagnostic', 'isLoading']);

export const isSavingSync = state => state.get('isSavingSync');

export const getCurrentLink = state => state.get('current');

export const getCurrentProviderIdentityBySide = (state, containerSide) => state.getIn(['current', containerSide, 'providerIdentity'], Map());

export const getContainerUsers = (state, containerSide) => state.getIn(['current', containerSide, 'users'], List());

export const getLinkById = (state, linkId) => state.getIn(['entities', linkId], new Map());

export const linkSyncHistoryHasLoaded = (state, linkId) => state.getIn(['entities', linkId, 'syncHistoryHasLoaded'], false);

export const getSyncHistoryUpdatedAt = (state, linkId) => state.getIn(['entities', linkId, 'syncHistoryUpdatedAt'], null);

export const getLinkSortedSyncHistory = (state, linkId) => {
    const link = getLinkById(state, linkId);

    return link
        .get('syncHistory', List())
        .sortBy(sync => sync.get('endTime'))
        .reverse();
};

export const areAllSyncsAutoSync = (state, multisyncId) => {
    const syncs = getSortedSyncsByMultisyncId(state).get(multisyncId, List());
    return !syncs.isEmpty() && syncs.every(sync => sync.get('isAutoSync'));
};

export const areAllSyncsSyncing = (state, multisyncId) => {
    const syncs = getSortedSyncsByMultisyncId(state).get(multisyncId, List());
    return !syncs.isEmpty() && syncs.every(sync => sync.get('syncState') === linkTypes.LINK_SYNC_STATES.SYNCING);
};

export const getSortedSyncsWithoutMultisync = (state) => {
    const allSyncs = getLinks(state);
    const syncsWithoutMulti = allSyncs.filterNot(sync => sync.get('multisync'));
    return syncsWithoutMulti.sortBy((sync) => {
        const syncName = sync.get('name') || sync.getIn(['A', 'container', 'displayName']) || '';
        return syncName.toLowerCase();
    }).toList();
};

export const getSortedSyncsByMultisyncId = (state) => {
    const allSyncs = getLinks(state);
    const syncsWithMulti = allSyncs.filter(sync => sync.get('multisync'));
    return normalizeAndMergeEntitiesBy('multisync', syncsWithMulti, 'name');
};

export const getMultisyncDiscriminantBySide = (state, containerSide) => {
    const syncSettings = getSyncSettings(state, containerSide);
    const options = syncSettings
        .filter(field => Map.isMap(field))
        .filter(field => field.has('multisyncDiscriminant'));

    const fieldValue = options.first();
    if (!fieldValue) {
        return fieldValue;
    }

    const fieldId = options.keySeq().first();
    return fieldValue.merge({
        fieldId
    });
};


export const getMultisyncDiscriminantId = (state, containerSide, fieldId) => {
    const syncSettings = getSyncSettings(state, containerSide);
    return syncSettings.getIn([fieldId, 'multisyncDiscriminant']);
};



// WEBPACK FOOTER //
// ./src/reducers/links.js