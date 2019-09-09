import {
    fromJS,
    Map
} from 'immutable';
import {
    actionTypes
} from 'redux-form';

import {
    linkTypes
} from '../consts';
import {
    formUtils
} from '../utils';

export default {
    syncForm: (state, action) => {
        switch (action.type) {
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
                        if (['A.containerId', 'A.workspaceId'].includes(field)) {
                            const A = {
                                ...state.values.A,
                                filters: [],
                                closedTasks: false,
                            };

                            return {
                                ...state,
                                values: { ...state.values,
                                    A
                                },
                            };
                        }

                        if (['B.containerId', 'B.workspaceId'].includes(field)) {
                            const B = {
                                ...state.values.B,
                                filters: [],
                                closedTasks: false,
                            };

                            return {
                                ...state,
                                values: { ...state.values,
                                    B
                                },
                            };
                        }
                    }

                    return state;
                }

            case linkTypes.GET_LINK_SUCCESS:
                {
                    const sync = fromJS(action.payload.link);

                    const providerIdentityA = sync.getIn(['A', 'providerIdentity']);
                    const providerIdentityB = sync.getIn(['B', 'providerIdentity']);

                    const providerIdA = sync.getIn(['A', 'providerIdentity', 'providerId']);
                    const providerIdB = sync.getIn(['B', 'providerIdentity', 'providerId']);

                    const containerIdA = sync.getIn(['A', 'container', 'id']);
                    const containerIdB = sync.getIn(['B', 'container', 'id']);
                    const syncSettings = sync.get('syncSettings', Map());
                    const manualOptions = syncSettings.get('manualOptions', Map()).toJS();
                    const displayNameA = sync.getIn(['A', 'container', 'displayName']);
                    const displayNameB = sync.getIn(['B', 'container', 'displayName']);
                    const readOnlyA = syncSettings.getIn(['A', 'readOnly']);
                    const readOnlyB = syncSettings.getIn(['B', 'readOnly']);

                    // Older links do not have a name attribute
                    // Generate the default name here so the editName component does not break.
                    const syncName = sync.get('name') || formUtils.generateDefaultLinkName(displayNameA, displayNameB, readOnlyA, readOnlyB);

                    return {
                        ...state,
                        values: {
                            A: {
                                providerId: providerIdA,
                                providerIdentityId: providerIdentityA.get('_id'),
                                containerId: containerIdA,
                                filters: formUtils.getFilters(syncSettings, 'A'),
                                tweaks: formUtils.getPcdOptions(syncSettings, 'A'),
                                multisyncDiscriminants: formUtils.getMultisyncDiscriminants(syncSettings, 'A'),
                                readOnly: readOnlyA,
                                closedTasks: syncSettings.getIn(['A', 'closedTasks']),
                                onFilterOut: syncSettings.getIn(['A', 'onFilterOut']),
                            },
                            B: {
                                providerId: providerIdB,
                                providerIdentityId: providerIdentityB.get('_id'),
                                containerId: containerIdB,
                                filters: formUtils.getFilters(syncSettings, 'B'),
                                tweaks: formUtils.getPcdOptions(syncSettings, 'B'),
                                multisyncDiscriminants: formUtils.getMultisyncDiscriminants(syncSettings, 'B'),
                                readOnly: readOnlyB,
                                closedTasks: syncSettings.getIn(['B', 'closedTasks']),
                                onFilterOut: syncSettings.getIn(['B', 'onFilterOut']),
                            },
                            automapUsers: sync.getIn(['syncSettings', 'automapUsers']),
                            // Use the original isAutoSync value - if user customized its sync
                            isAutoSync: sync.get('isAutoSync') || !!action.meta.originalIsAutoSync,
                            isMultiSync: sync.get('isMultiSync') || false,
                            manualOptions: formUtils.getFormattedManualOptions(manualOptions),
                            name: syncName,
                        },
                    };
                }

            default:
                {
                    return state;
                }
        }
    },
};



// WEBPACK FOOTER //
// ./src/reducers/form.js