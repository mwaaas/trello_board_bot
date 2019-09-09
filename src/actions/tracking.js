import {
    EventTypes
} from 'redux-segment';
import cookie from 'react-cookie';

import {
    flagTypes,
    trackingTypes
} from '../consts';
import {
    getFlags,
    getOrganizationTraits,
    getRecording,
    getSessionId,
    getTrackingSessionId,
    getUserId,
} from '../reducers';

export const trackAnonymousEvent = (eventName, data) => (dispatch, getState) => {
    const state = getState();
    const sessionId = getSessionId(state);
    const flags = getFlags(state, flagTypes.TYPES.COHORT);
    // ⚠️ There is no Unito userId at this point. The event will rely on segment anonymousId

    dispatch({
        type: trackingTypes.TRACK_ANON,
        payload: {},
        meta: {
            analytics: {
                eventType: EventTypes.track,
                eventPayload: {
                    event: eventName,
                    properties: {
                        ...data,
                        sessionId,
                        user: {
                            _ga: cookie.load('_ga'),
                            feature_flags: flags.toJS(),
                        },
                    },
                },
            },
        },
    });
};

export const trackEvent = (eventName, data = {}) => (dispatch, getState) => {
    const state = getState();
    const userId = getUserId(state);
    const sessionId = getSessionId(state);
    const flags = getFlags(state);
    const organization = getOrganizationTraits(state);

    dispatch({
        type: trackingTypes.TRACK,
        payload: {},
        meta: {
            analytics: {
                eventType: EventTypes.track,
                eventPayload: {
                    event: eventName,
                    properties: {
                        sessionId,
                        user: {
                            id: userId,
                            feature_flags: flags.toJS(),
                        },
                        organization,
                        ...data,
                    },
                },
            },
        },
    });
};

export const generateTrackingEvents = (getState, action) => {
    const state = getState();
    const userId = getUserId(state);
    const sessionId = getSessionId(state);
    const flags = getFlags(state);
    const organization = getOrganizationTraits(state);

    const recordings = getRecording(state);
    const trackingSessionId = getTrackingSessionId(state);
    const lastEvent = recordings.last().toJS();

    const trackingActions = recordings.toJS().map(record => ({
        eventType: EventTypes.track,
        eventPayload: {
            event: record.type,
            properties: {
                sessionId,
                user: {
                    id: userId,
                    feature_flags: flags.toJS(),
                },
                organization,
                meta: record.meta,
                timestamp: record.meta.timestamp,
                payload: record.payload,
                trackingSessionId,
            },
        },
    }));

    trackingActions.push({
        eventType: EventTypes.track,
        eventPayload: {
            event: action.type,
            properties: {
                sessionId,
                user: {
                    id: userId,
                    feature_flags: flags.toJS(),
                },
                organization,
                meta: action.meta,
                timestamp: action.meta.timestamp,
                payload: action.payload,
                trackingSessionId,
                lastEvent: action.type === `${trackingTypes.UNITO_TRACKING}${trackingTypes.FORM_ACTIONS.CANCEL}` ? lastEvent : undefined,
            },
        },
    });

    return trackingActions;
};
/* eslint-disable import/prefer-default-export */



// WEBPACK FOOTER //
// ./src/actions/tracking.js