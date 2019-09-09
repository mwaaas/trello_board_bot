import {
    List,
    Map,
    fromJS,
    Iterable,
} from 'immutable';

import {
    fieldTypes
} from '../consts';


const {
    PCD_FIELD
} = fieldTypes.KINDS;
const {
    ID
} = fieldTypes.FIELD_VALUES_TYPE;

export const isEmpty = value => value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && !value.length);

export function validateWhatToSyncForm(values) {
    const errors = {};
    if (isEmpty(values.providerIdA)) {
        errors.providerIdA = 'Required';
    }

    if (isEmpty(values.providerIdentityIdA)) {
        errors.providerIdentityIdA = 'Required';
    }

    if (isEmpty(values.containerIdA)) {
        errors.containerIdA = 'Required';
    }

    return errors;
}

export function validateWhereToSyncForm(values) {
    const errors = {};
    if (isEmpty(values.providerIdB)) {
        errors.providerIdB = 'Required';
    }

    if (isEmpty(values.providerIdentityIdB)) {
        errors.providerIdentityIdB = 'Required';
    }

    if (isEmpty(values.containerIdB)) {
        errors.containerIdB = 'Required';
    }

    return errors;
}

export const getFormattedManualOptions = (manualOptions) => {
    // This is so we don't display an empty object in the manual option textearea
    // when no specific manual setting exist
    const formattedManualOptions = manualOptions && Object.keys(manualOptions).length > 0 ?
        JSON.stringify(manualOptions, null, 2) :
        undefined;

    return formattedManualOptions;
};

const isFilterMapping = setting =>
    Map.isMap(setting) && ['whiteList', 'blackList', 'multisyncDiscriminant'].some(filterType => setting.has(filterType));

export const getMultisyncDiscriminants = (syncSettings, containerSide) => {
    const discriminants = [];

    syncSettings.get(containerSide).forEach((setting, fieldId) => {
        if (Map.isMap(setting) && setting.has('multisyncDiscriminant')) {
            discriminants.push({
                fieldId,
                fieldValueType: setting.get('fieldValueType', ID),
                kind: setting.get('kind', PCD_FIELD),
                value: setting.get('multisyncDiscriminant'),
            });
        }
    });

    return discriminants;
};

export const getFilters = (syncSettings, containerSide) => {
    const filters = [];

    syncSettings.get(containerSide).forEach((setting, fieldId) => {
        if (isFilterMapping(setting)) {
            ['whiteList', 'blackList'].forEach((filterType) => {
                const filterValues = setting.get(filterType, List());
                const hasValues = List.isList(filterValues) && !filterValues.isEmpty();

                if (hasValues) {
                    const formattedValues = typeof filterValues.first() === 'boolean' ?
                        filterValues.first() :
                        filterValues.toArray()
                        .filter(f => f !== null)
                        // Show display name with a star, if the value was deleted
                        .map(fieldValue => ({
                            id: fieldValue,
                            displayName: `${fieldValue} *`
                        }));

                    filters.push({
                        fieldId,
                        fieldValueType: setting.get('fieldValueType', ID),
                        kind: setting.get('kind', PCD_FIELD),
                        type: filterType,
                        values: formattedValues,
                    });
                }
            });
        }
    });

    return filters;
};

/**
 * Returns the pcdOptions from syncSettings. Done by removing the hardcoded values.
 *
 * @param {object} formData[side] - The formData of the syncForm on a specific side
 * @returns {object} - The plucked pcdOptions the sideFormData to be sent to maestro
 */
export const getPcdOptions = (syncSettings, containerSide) => {
    const STATIC_OPTIONS = ['closedTasks', 'onFilterOut', 'readOnly', 'user'];
    const sideSettings = syncSettings.get(containerSide);
    const pcdOptions = {};

    sideSettings.forEach((setting, settingKey) => {
        // These are not pcd options
        if (STATIC_OPTIONS.includes(settingKey)) {
            return;
        }

        if (isFilterMapping(setting)) {
            return;
        }

        pcdOptions[settingKey] = fromJS(setting);
    });

    return pcdOptions;
};

/**
 * Returns the marshalling formData to be sent to maestro.
 *
 * @param {Immutable.Map} state - The redux state
 * @param {object} formData - The formData of the syncForm
 * @returns {object} - The payload of the sync to be sent to maestro
 */
export const getEditSyncPayload = (formData, syncSettings) => {
    const {
        automapUsers,
        A,
        B,
        isAutoSync,
        manualOptions,
        name,
        organizationId,
    } = formData;

    let updatedSyncSettings = syncSettings
        .set('manualOptions', manualOptions)
        .set('automapUsers', automapUsers)
        .set('A', Map({
            readOnly: formData.A.readOnly,
            closedTasks: formData.A.closedTasks,
            user: syncSettings.getIn(['A', 'user']),
            ...formData.A.tweaks,
        }))
        .set('B', Map({
            readOnly: formData.B.readOnly,
            closedTasks: formData.B.closedTasks,
            user: syncSettings.getIn(['B', 'user']),
            ...formData.B.tweaks,
        }));

    for (const side of ['A', 'B']) {
        // Tweaks
        for (const [tweakName, tweakValue] of Object.entries(formData[side].tweaks)) {
            // Only store ids of field values and not the full field value object
            if (tweakValue !== null && typeof tweakValue === 'object' && !Iterable.isIterable(tweakValue)) {
                updatedSyncSettings = updatedSyncSettings.setIn([side, tweakName], tweakValue.id);
            }
        }

        // Filters
        const filters = formData[side].filters || [];
        for (const filter of filters) {
            const {
                fieldValueType,
                fieldId,
                kind,
                type,
                values,
            } = filter;

            // Only save non-empty filters
            if (!isEmpty(values)) {
                const formatedValues = typeof values === 'boolean' ? [values] : values.map(opt => opt.id);

                updatedSyncSettings = updatedSyncSettings
                    .setIn([side, fieldId, type], formatedValues)
                    .setIn([side, fieldId, 'fieldValueType'], fieldValueType)
                    .setIn([side, fieldId, 'kind'], kind);
            }
        }

        const multisyncDiscriminants = formData[side].multisyncDiscriminants || [];
        for (const discriminant of multisyncDiscriminants) {
            const {
                fieldValueType,
                fieldId,
                kind,
                value,
            } = discriminant;

            updatedSyncSettings = updatedSyncSettings
                .setIn([side, fieldId, 'fieldValueType'], fieldValueType)
                .setIn([side, fieldId, 'kind'], kind)
                .setIn([side, fieldId, 'multisyncDiscriminant'], value);
        }
    }

    const payload = {
        A: {
            providerIdentity: A.providerIdentityId
        },
        B: {
            providerIdentity: B.providerIdentityId
        },
        isAutoSync,
        name,
        organizationId,
        syncSettings: updatedSyncSettings.toJS(),
    };

    return payload;
};

/**
 * Shorten a string, potentially user-provided and containing problematic characters.
 * @param {string} stringToShorten
 * @param {number} maxLength
 * @param {string} shorteningCharacter Character appended at the end of the truncated string.
 */
export const shortenString = (stringToShorten, maxLength, shorteningCharacter = '…') => {
    if (maxLength === undefined) {
        throw new Error('maxLength argument is required');
    }

    // When truncating a user string, we must be careful to not cut in the middle of a double-width
    // UTF-16 char (e.g. emojis). OldJS is clueless, but modernJS spread (...) does the right thing:
    // "ab".slice(0, 1)                   ← returns "a",  good!
    // "👍🙂".slice(0, 1)                 ← returns '�',  baad!
    // [..."👍🙂"].slice(0, 1).join('')   ← returns '👍', good!
    const shortened = (stringToShorten.length > maxLength ?
        `${[...stringToShorten].slice(0, maxLength).join('').trim()}${shorteningCharacter}` :
        stringToShorten);

    return shortened;
};

export const generateDefaultLinkName = (
    containerNameA = '',
    containerNameB = '',
    readOnlyA = false,
    readOnlyB = false,
) => {
    if (containerNameA === containerNameB) {
        return shortenString(containerNameA, 64);
    }

    if (containerNameA && !containerNameB) {
        return containerNameA;
    }

    if (containerNameB && !containerNameA) {
        return containerNameB;
    }

    let arrow = '⇄';
    if (readOnlyA) {
        arrow = '→';
    }

    if (readOnlyB) {
        arrow = '←';
    }

    return `${shortenString(containerNameA, 32)} ${arrow} ${shortenString(containerNameB, 32)}`;
};



// WEBPACK FOOTER //
// ./src/utils/forms.js