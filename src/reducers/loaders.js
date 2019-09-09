import {
    Map,
} from 'immutable';

import {
    appTypes,
    containerTypes,
} from '../consts';

export const initialState = Map();

export default (state = initialState, action) => {
    const {
        type,
        meta
    } = action;
    const matches = /(.*)_(REQUEST|SUCCESS|FAILURE)/.exec(type);

    if (!matches || !meta) return state;

    const [, requestType, requestState] = matches;

    if (meta.loadingId) {
        const id = `${requestType}.${meta.loadingId}`;
        return state.setIn([requestType, id], requestState === 'REQUEST');
    }

    return state.set(requestType, requestState === 'REQUEST');
};

export const isLoading = (state, requestType, id) => {
    if (id) {
        return state.getIn([requestType, `${requestType}.${id}`], false);
    }

    return state.get(requestType, false);
};

export const isAnyOfRequestTypeLoading = (state, requestType) => {
    const loadersOfRequestType = state.get(requestType, false);
    if (loadersOfRequestType) {
        return loadersOfRequestType.valueSeq().some(v => v);
    }
    return false;
};

export const isLoadingContainers = (state, containerSide, fieldIndex) => {
    const loadingId = [containerSide, fieldIndex].join('.');
    return isLoading(state, containerTypes.GET_CONTAINERS, loadingId);
};

export const isAppConfigLoading = state => isLoading(state, appTypes.GET_APP_CONFIG);



// WEBPACK FOOTER //
// ./src/reducers/loaders.js