/**
 *  This file contains utility functions that can be used accross the client side.
 */
import {
    routes
} from '../consts';
import {
    Map,
    List
} from 'immutable';


// Removed
// Since it caused an import error (probably due to circular dependencies imports)
import * as formUtils from './forms';
import * as fromLocalStorage from './localStorage';

export {formUtils, fromLocalStorage}
/**
 *  Helper function to get the other side
 *  @param {'A'|'B'} containerSide - The container we want the oposite side of;
 *
 *  @returns {'A'|'B'} - The oposite side
 */
export const otherSide = containerSide => (containerSide === 'A' ? 'B' : 'A');

export const capitalize = string => string.charAt(0).toUpperCase() + string.substring(1);

export const noOp = () => {};

/**
 *  Constructs the api url and options, with the given parameters. To be used with fetch() function
 *  @param {string} url - The url of the api call (without the '/api' part)
 *  @param {string} method - The method to use when calling the api
 *  @param {object} additionalData - The data to send (if method allows) and the token if protected url
 *  @returns {array} - An array with first element containing the api url and the second element with the options for the api call
 */
export function requestApi(url, method, additionnalData = {}) {
    const {
        token,
        data
    } = additionnalData;
    const options = {
        method,
        credentials: 'include',
        headers: {},
    };

    if (token) {
        options.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
        options.headers.Accept = 'application/json';
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(data);
    }

    return [
        `/${routes.BASE_API}/${url}`,
        options,
    ];
}


/**
 *  Creates a generator for containers tree
 *  @param {object} containerList - The array of containers
 *  @param {int} depth - The current depth of the container.
 *  @return Generator
 */
export function* containerGenerator(containerList, depth = 1) {
    for (const container of containerList) {
        yield { ...container,
            depth
        };
        if (container.children) {
            yield* containerGenerator(container.children, depth + 1);
        }
    }
}

export function normalizeAndMergeEntitiesBy(key, entities, sortByKey = '_id') {
    let entitiesByKey = Map();

    entities.forEach((entity) => {
        const byKey = entity.get(key);
        const listToUpdate = entitiesByKey.get(`${byKey}`);

        if (listToUpdate) {
            entitiesByKey = entitiesByKey.set(`${byKey}`, listToUpdate.push(entity));
            return;
        }

        entitiesByKey = entitiesByKey.set(`${byKey}`, List([entity]));
    });

    const comparator = entity => entity.get(sortByKey);
    return entitiesByKey.map(list => list.sortBy(comparator));
}

export function normalizeEntitiesBy(key, entities) {
    let entitiesByKey = Map();
    entities.forEach((entity) => {
        entitiesByKey = entitiesByKey.set(entity.get(key), entity);
    });
    return entitiesByKey;
}

export function normalizeEntitiesById(entities) {
    let entitiesById = Map();
    entities.forEach((entity) => {
        const idKeyName = entity.has('id') ? 'id' : '_id';
        entitiesById = entitiesById.set(entity.get(idKeyName), entity);
    });
    return entitiesById;
}

export function getBrowserLocale() {
    if (navigator.languages) {
        return navigator.languages[0];
    }

    // IE
    if (navigator.userLanguage) {
        return navigator.userLanguage;
    }

    return navigator.language;
}

export function toLocaleAmount(centAmount) {
    const dollarAmount = (centAmount || 0) / 100;
    return `US$${dollarAmount.toFixed(2)}`;
}

export const logException = (error, {
    context,
    release
}) => {
    if (window.Raven) {
        try {
            window.Raven.setRelease(release);
            window.Raven.captureException(JSON.stringify(error), {
                extra: context,
            });
        } catch (err) {
            console.log('An error occured', err); // eslint-disable-line
        }
    }
};

export function getPopupTopLeftValues(width, height) {
    const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screen.left;
    const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screen.top;

    const w = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : window.screen.width; // eslint-disable-line
    const h = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : window.screen.height; // eslint-disable-line

    const left = ((w / 2) - (width / 2)) + dualScreenLeft;
    const top = ((h / 2) - (height / 2)) + dualScreenTop;

    return {
        top,
        left,
    };
}




// WEBPACK FOOTER //
// ./src/utils/index.js