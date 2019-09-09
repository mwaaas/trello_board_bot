import {
    mappingTypes
} from '../consts';

export function mapUsers(idA, idB) {
    return {
        type: mappingTypes.MAP_USERS,
        payload: {
            idA,
            idB
        },
    };
}

export function unmapUsers(index) {
    return {
        type: mappingTypes.UNMAP_USERS,
        payload: {
            index
        },
    };
}



// WEBPACK FOOTER //
// ./src/actions/mapping.js