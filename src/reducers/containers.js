import {
    Map,
    List,
    OrderedMap,
    fromJS,
} from 'immutable';
import {
    actionTypes
} from 'redux-form';

import {
    containerTypes,
    linkTypes
} from '../consts';
import {
    containerGenerator
} from '../utils';

export const initialState = Map({
    containers: Map({
        A: Map(),
        B: Map(),
    }),
    workspaces: Map(),
});

export default (state = initialState, action) => {
    switch (action.type) {
        case containerTypes.CREATE_CONTAINER_SUCCESS:
            {
                const {
                    meta: {
                        providerIdentityId,
                        containerSide
                    },
                    payload: {
                        container
                    },
                } = action;

                return state.setIn(
                    ['containers', containerSide, container.id],
                    fromJS({ ...container,
                        providerIdentityId
                    }),
                );
            }

        case containerTypes.GET_CONTAINER_REQUEST:
            {
                const {
                    meta: {
                        containerId,
                        containerSide
                    }
                } = action;
                return state.setIn(['containers', containerSide, containerId, 'isLoading'], true);
            }

        case containerTypes.GET_CONTAINER_FAILURE:
            {
                const {
                    meta: {
                        containerId,
                        containerSide
                    }
                } = action;
                return state.setIn(['containers', containerSide, containerId, 'isLoading'], false);
            }

        case containerTypes.GET_CONTAINER_SUCCESS:
            {
                const {
                    meta: {
                        providerIdentityId,
                        containerSide,
                        containerId
                    },
                    payload: {
                        container
                    },
                } = action;

                return state.setIn(
                    ['containers', containerSide, containerId],
                    fromJS({ ...container,
                        providerIdentityId,
                        isLoading: false
                    }),
                );
            }

        case containerTypes.GET_CONTAINER_PLUGINS_SUCCESS:
            {
                const {
                    meta: {
                        containerId
                    },
                    payload: plugins,
                } = action;

                return state.setIn(
                    ['pluginsByContainerId', containerId],
                    fromJS(plugins),
                );
            }

        case containerTypes.GET_CONTAINERS_SUCCESS:
            {
                const {
                    meta: {
                        providerIdentityId,
                        containerSide,
                        searchValue
                    },
                    payload: {
                        containers
                    },
                } = action;

                const containersTree = Array.from(containerGenerator(containers));
                let containersById = OrderedMap();
                containersTree.forEach((container) => {
                    containersById = containersById.set(container.id, fromJS({ ...container,
                        providerIdentityId
                    }));
                });

                // This is required in the case of a typeahead multisync
                // Otherwise if the user searches for a different project name, it removes previous selected containers
                // from the state and are no longered displayed in the select input
                if (searchValue) {
                    return state.mergeIn(['containers', containerSide], containersById);
                }

                return state.setIn(['containers', containerSide], containersById);
            }

        case containerTypes.GET_WORKSPACES_SUCCESS:
            {
                const {
                    meta: {
                        providerIdentityId
                    },
                    payload: {
                        workspaces
                    },
                } = action;

                let workspacesById = OrderedMap();
                workspaces.forEach((workspace) => {
                    workspacesById = workspacesById.set(workspace.id, fromJS({
                        ...workspace,
                        selectable: true,
                    }));
                });

                return state.setIn(['workspaces', providerIdentityId], workspacesById);
            }

        case linkTypes.GET_LINK_SUCCESS:
            {
                const {
                    link: {
                        A,
                        B
                    }
                } = action.payload;

                const containers = state.get('containers')
                    .mergeIn(['A', A.container.id], fromJS(A.container))
                    .mergeIn(['B', B.container.id], fromJS(B.container));

                return state.merge({
                    containers
                });
            }

        case containerTypes.GET_LINK_CONTAINER_BY_SIDE_SUCCESS:
            {
                const {
                    providerIdentityId,
                    containerId,
                    side
                } = action.meta;
                return state.mergeIn(['containers', side, containerId], { ...action.payload.container,
                    providerIdentityId
                });
            }

        case actionTypes.DESTROY:
            {
                const forms = action.meta.form || [];
                if (forms.includes('syncForm')) {
                    return state.set('containers', initialState.get('containers'));
                }

                return state;
            }

        case containerTypes.CLEAR_CONTAINERS:
            {
                const {
                    containerSide
                } = action.meta;
                return state.setIn(['containers', containerSide], Map());
            }

        default:
            return state;
    }
};

/**
 * SELECTORS
 */

export const getWorkspaces = (state, providerIdentityId) => state.getIn(['workspaces', providerIdentityId], Map());

export const getWorkspaceById = (state, providerIdentityId, containerId) => state.getIn(['workspaces', providerIdentityId, containerId], Map());

export const getContainers = (state, containerSide) => state.getIn(['containers', containerSide], Map());

export const getContainerById = (state, containerSide, containerId) => state.getIn(['containers', containerSide, containerId], Map());

export const getContainerPlugins = (state, containerId) => state.getIn(['pluginsByContainerId', containerId], List());



// WEBPACK FOOTER //
// ./src/reducers/containers.js