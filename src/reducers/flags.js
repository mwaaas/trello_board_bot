import {
    Map,
    fromJS
} from 'immutable';
import {
    createSelector
} from 'reselect';

import {
    flagTypes
} from '../consts';

const {
    COHORT,
    USER
} = flagTypes.TYPES;

const initialState = fromJS({
    isLoaded: {
        [COHORT]: false,
        [USER]: false,
    },
    isLoading: {
        [COHORT]: false,
        [USER]: false,
    },
    [COHORT]: {},
    [USER]: {},
});


export default (state = initialState, action) => {
    switch (action.type) {
        case flagTypes.GET_FLAGS_REQUEST:
            return state.setIn(['isLoading', action.meta.type], true);

        case flagTypes.GET_FLAGS_SUCCESS:
            {
                const {
                    type
                } = action.meta;
                const flags = fromJS(action.payload.flags);

                return state
                    .set(type, flags)
                    .setIn(['isLoaded', type], true)
                    .setIn(['isLoading', type], false);
            }

        case flagTypes.GET_FLAGS_FAILURE:
            return state.setIn(['isLoading', action.meta.type], false);

        default:
            return state;
    }
};

export const getAll = (state, type) => state.get(type, Map());
export const getFlagValue = (state, flagName, type) => state.getIn([type, flagName]);

export const getIsLoadingSelector = state => state.get('isLoading');

export const getIsLoadedSelector = state => state.get('isLoaded');

export const isSomethingLoading = state => state.getIn(['isLoading', COHORT]) || state.getIn(['isLoading', USER]);

export const isEverythingLoaded = createSelector(
    getIsLoadedSelector,
    loadedTypes => loadedTypes.reduce((acc, loadedType) => acc && loadedType, true),
);



// WEBPACK FOOTER //
// ./src/reducers/flags.js