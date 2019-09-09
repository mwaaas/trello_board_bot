export const loadStateByKey = (key) => {
    try {
        const serializedState = window.localStorage && window.localStorage.getItem(key);
        if ([null, undefined].includes(serializedState)) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return undefined;
    }
};

export const saveState = (key, state) => {
    try {
        const serializedState = JSON.stringify(state);
        window.localStorage && window.localStorage.setItem(key, serializedState);
    } catch (err) {
        throw new Error({
            reason: err
        });
    }
};

export const clearState = (key) => {
    try {
        window.localStorage && window.localStorage.removeItem(key);
    } catch (err) {
        throw new Error({
            reason: err
        });
    }
};



// WEBPACK FOOTER //
// ./src/utils/localStorage.js