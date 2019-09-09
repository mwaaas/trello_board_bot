import {
    List,
    Map,
    fromJS
} from 'immutable';
import {
    actionTypes
} from 'redux-form';

import {
    trackingTypes
} from '../consts';

export const initialState = Map({
    isRecording: false,
    records: List(),
});

export const recorderWhitelist = [
    trackingTypes.UNITO_TRACKING,
    actionTypes.CHANGE,
    actionTypes.ARRAY_PUSH,
    actionTypes.ARRAY_REMOVE,
    actionTypes.ARRAY_REMOVE_ALL,
    actionTypes.CLEAR_FIELDS,
];

export default (state = initialState, action) => {
    const {
        type,
        payload
    } = action;
    const {
        CANCEL,
        START,
        SUBMIT
    } = trackingTypes.FORM_ACTIONS;

    if (type === `${trackingTypes.UNITO_TRACKING}${START}`) {
        return state
            .set('isRecording', true)
            .set('trackingSessionId', payload.trackingSessionId)
            .set('records', List([fromJS(action)]));
    }

    if (type === `${trackingTypes.UNITO_TRACKING}${CANCEL}` || type === `${trackingTypes.UNITO_TRACKING}${SUBMIT}`) {
        return state
            .set('isRecording', false)
            .set('trackingSessionId', undefined)
            .set('records', List());
    }

    if (state.get('isRecording') && recorderWhitelist.some(t => type.startsWith(t))) {
        const updatedRecord = state.get('records').push(fromJS(action));
        return state.set('records', updatedRecord);
    }

    return state;
};

export const getCurrent = state => state.get('records');

export const getTrackingSessionId = state => state.get('trackingSessionId');



// WEBPACK FOOTER //
// ./src/reducers/recorder.js