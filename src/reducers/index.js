/**
 * Combines all reducers into a single one.
 * This allows to separate reducers into different files (by concerns),
 * so we don't end up with a single gigantic reducers.js file.
 */
import {
    combineReducers
} from 'redux';
import {
    reducer as formReducer,
    formValueSelector
} from 'redux-form';
import {
    fromJS,
    Map,
    List
} from 'immutable';
import moment from 'moment';
import {
    reducer as notificationsReducer
} from 'reapop';

import {
    appTypes,
    authTypes,
    containerTypes,
    fieldTypes,
    flagTypes,
    linkTypes,
    multisyncTypes,
    organizationTypes,
    providerIdentityTypes,
} from '../consts';
import {
    formUtils,
    otherSide as getOtherSide
} from '../utils';
import app, * as fromApp from './app';
import auth, * as fromAuth from './auth';
import billing, * as fromBilling from './billing';
import containers, * as fromContainers from './containers';
import flags, * as fromFlags from './flags';
import fields, * as fromFields from './fields';
import form from './form';
import invites, * as fromInvites from './invites';
import links, * as fromLinks from './links';
import loaders, * as fromLoaders from './loaders';
import multisyncs, * as fromMultisyncs from './multisyncs';
import organizations, * as fromOrganizations from './organizations';
import providerIdentities, * as fromProviderIdentities from './providerIdentities';
import providers, * as fromProviders from './providers';
import recorder, * as fromRecorder from './recorder';

const {
    CUSTOM_FIELD,
    PCD_FIELD,
    PCD_COMMON
} = fieldTypes.KINDS;


export const getFieldValue = (state, fieldName, formName = 'syncForm') =>
    formValueSelector(formName)(state, fieldName);

export const getContainerFieldValue = (state, {
        containerSide
    }, fieldName) =>
    getFieldValue(state, `${containerSide}.${fieldName}`);

export const getOtherSideContainerFieldValue = (state, {
        containerSide
    }, fieldName) =>
    getContainerFieldValue(state, {
        containerSide: getOtherSide(containerSide)
    }, fieldName);

export const getContainerById = (state, containerSide, containerId, key) => {
    const container = fromContainers.getContainerById(state.containers, containerSide, containerId);
    if (key) {
        return container.get(key);
    }

    return container;
};

export const getContainersById = (state, containerSide, containerIds) =>
    containerIds.map(containerId => getContainerById(state, containerSide, containerId));

export const getCurrentContainerBySide = (state, {
    containerSide
}) => {
    const currentLink = fromLinks.getCurrentLink(state.links);
    return currentLink.getIn([containerSide, 'container'], Map());
};

export const getContainer = (state, props, useOtherSide = false) => {
    const fn = !useOtherSide ? getContainerFieldValue : getOtherSideContainerFieldValue;
    const existingContainer = fn(state, props, 'existingContainer');
    const containerId = fn(state, props, 'containerId');
    const containerSide = useOtherSide ? getOtherSide(props.containerSide) : props.containerSide;

    if (!formUtils.isEmpty(existingContainer) && !existingContainer && !containerId) {
        const newContainerName = getContainerFieldValue(state, props, 'newContainerName');
        return Map({
            displayName: newContainerName
        });
    }

    return getContainerById(state, containerSide, containerId);
};

export const getContainerPlugins = (state, containerId) =>
    fromContainers.getContainerPlugins(state.containers, containerId);

export const getWorkspaceById = (state, {
        providerIdentityId,
        workspaceId
    }) =>
    fromContainers.getWorkspaceById(state.containers, providerIdentityId, workspaceId);

export const getWorkspaces = (state, {
    providerIdentityId
}) => fromContainers.getWorkspaces(state.containers, providerIdentityId);

export const getContainers = (state, {
    containerSide
}) => fromContainers.getContainers(state.containers, containerSide);

export const getUserId = state => fromAuth.getUserId(state.auth);

export const getUserAvatarUrl = state => fromAuth.getUserAvatarUrl(state.auth);

export const getUserFullName = state => fromAuth.getUserFullName(state.auth);

export const getIsLoadedProviders = state => fromProviders.getIsLoaded(state.providers);

export const getIsLoadingProviders = state => fromProviders.getIsLoading(state.providers);

export const getProviders = state => fromProviders.getAll(state.providers);

// Restricted providers have a featureFlag attribute that should be
// enabled to bypass the restriction
export const getEnabledProviders = (state) => {
    const allProviders = getProviders(state);
    return allProviders.filter((provider) => {
        const flagName = provider.get('featureFlag');
        return !flagName || isUserFeatureFlagActive(state, flagName);
    });
};

// Fetch provider by logical family grouping (jira server and cloud, github regular and enterprise)
export const getVisibleProvidersByFamily = (state, embedName) => {
    const entities = getEnabledProviders(state);
    let providerByFamily = Map();

    entities.forEach((provider) => {
        if (embedName && !provider.get('embeddableWith').find(e => e === embedName)) {
            return;
        }

        const family = provider.get('displayName').match(/\w+/)[0];
        // We also directly inject family in the provider,
        // which we might do in the backend in the future
        const entity = provider.set('family', family);

        if (!providerByFamily.get(family)) {
            providerByFamily = providerByFamily.set(family, List([entity]));
            return;
        }

        providerByFamily = providerByFamily.update(family, p => p.push(entity));
    });

    return providerByFamily;
};

export const getVisibleProviders = (state, embedName) => {
    let entities = getEnabledProviders(state);

    if (embedName === appTypes.EMBED.WRIKE) {
        // If embedded, don't display partner in apps list
        // Only display allowed providers for the embedded one
        entities = entities.filter(p => p.get('name') !== embedName && p.get('embeddableWith').find(e => e === embedName));
    }

    return entities.sortBy(provider => provider.get('displayName'));
};

export const getProvidersThatCanLogin = state => getEnabledProviders(state).filter(provider => (provider.get('canLogin')));

export const getProviderById = (state, props) => fromProviders.getProviderById(state.providers, props.providerId);

export const getProvider = (state, props, otherSide = false) => { // eslint-disable-line
    const fn = !otherSide ? getContainerFieldValue : getOtherSideContainerFieldValue;
    const providerId = fn(state, props, 'providerId');
    return getProviderById(state, {
        providerId
    });
};

export const getProviderDisplayName = (state, props, otherSide = false) => // eslint-disable-line
    getProvider(state, props, otherSide).get('displayName');

export const getProviderByProviderIdentityId = (state, providerIdentityId) => {
    const providerName = fromProviderIdentities.getProviderName(state.providerIdentities, providerIdentityId);
    return fromProviders.getProviderByName(state.providers, providerName);
};

// TODO: Rename me getProviderCapabilitiesBySide
export const getProviderCapabilities = (state, props, key, otherSide = false) => { // eslint-disable-line
    const fn = !otherSide ? getContainerFieldValue : getOtherSideContainerFieldValue;
    const providerId = fn(state, props, 'providerId');
    return fromProviders.getCapabilitiesByProviderId(state.providers, providerId, key);
};

export const getProviderCapabilitiesById = (state, providerId, key) =>
    fromProviders.getCapabilitiesByProviderId(state.providers, providerId, key);

export const getProviderByName = (state, name) => fromProviders.getProviderByName(state.providers, name);

export const getProviderByConnectorName = (state, connectorName) =>
    fromProviders.getProviderByConnectorName(state.providers, connectorName);

export const getDefaultParamProviderId = (state, side) => fromApp.getDefaultParamProviderId(state.app, side);

export const getProvidersWithExistingProviderIdentities = (state) => {
    const userId = getUserId(state);
    const connectedProviderNames = fromProviderIdentities.getUserProviderNames(state.providerIdentities, userId);

    const syncDefaultProviderA = getDefaultParamProviderId(state, 'A');
    const syncDefaultProviderB = getDefaultParamProviderId(state, 'B');

    // Do not pass the embed-name to getVisibleProviders, as we want to display the providers that an embed-wrike user
    // might have set in the standalone app
    const visibleProviders = getVisibleProviders(state);

    return visibleProviders.filter((p) => {
        const providerName = p.get('name');
        // Only show providers that have provider identities
        return connectedProviderNames.includes(providerName)
            // or that were set as default parameters
            ||
            [syncDefaultProviderA, syncDefaultProviderB].includes(p.get('_id'));
    });
};

export const getConnectedProviders = state => getProvidersWithExistingProviderIdentities(state).toList();

export const getDefaultProviderId = (state, containerSide) => {
    const providersList = getProvidersWithExistingProviderIdentities(state);
    // Force selection of the first provider in the list if there is only one item
    // and if it is not already defined in the form
    let providerId = getContainerFieldValue(state, {
        containerSide
    }, 'providerId');

    // Remove the other side selected provider from possible options
    const otherProviderId = getOtherSideContainerFieldValue(state, {
        containerSide
    }, 'providerId');
    const filterProviderList = providersList.filterNot(p => p.get('_id') === otherProviderId);

    if (!providerId && filterProviderList.count() === 1) {
        providerId = filterProviderList.first().get('_id');
    }

    return providerId;
};

export const getUserProviderIdentitiesByProviderId = (state, providerId) => {
    const userId = getUserId(state);
    const provider = getProviderById(state, {
        providerId
    });
    return fromProviderIdentities.getUserProviderIdentitiesByProviderName(
        state.providerIdentities, userId, provider.get('name'),
    );
};

export const getDefaultProviderIdentityByProviderId = (state, providerId) => {
    const providerIdentityList = getUserProviderIdentitiesByProviderId(state, providerId);
    const activeProviderIdentities = providerIdentityList.filter(pi => pi.get('state') === providerIdentityTypes.STATE.ACTIVE);
    return activeProviderIdentities.first() && activeProviderIdentities.first().get('_id');
};

export const getProviderCapabilitiesMergeableOptions = (state) => {
    const providerA = getProvider(state, {
        containerSide: 'A'
    });
    const providerB = getProvider(state, {
        containerSide: 'B'
    });

    const optionsA = getProviderCapabilities(state, {
        containerSide: 'A'
    }, 'options');
    const optionsB = getProviderCapabilities(state, {
        containerSide: 'B'
    }, 'options');

    return optionsA
        .filter((opt, optionName) => opt.get('mergeable') && optionsB.getIn([optionName, 'mergeable']))
        .filterNot((opt, optionName) => {
            const isIncompatible = !!opt.get('incompatibleWith', List()).find(item => item === providerB.get('name'));
            const isOtherIncompatible = !!optionsB.getIn([optionName, 'incompatibleWith'], List())
                .find(item => item === providerA.get('name'));
            // don't keep if one of the option is not compatible with the other
            return isIncompatible || isOtherIncompatible;
        });
};

export const getProviderCapabilitiesOptions = (state, props) => {
    const provider = getProvider(state, props);
    const otherProvider = getProvider(state, props, true);
    const otherSideOptions = getProviderCapabilities(state, props, 'options', true);

    const options = getProviderCapabilities(state, props, 'options');
    const sideOptions = options
        .filterNot(opt => opt.get('otherSide'))
        .filterNot(opt => opt.get('mergeable'))
        .filterNot((opt, optionName) => {
            const incompatibleWith = opt.get('incompatibleWith', List());
            const isIncompatible = !!incompatibleWith.find(item => item === otherProvider.get('name'));

            const otherIncompatibleWith = otherSideOptions.getIn([optionName, 'incompatibleWith'], List());
            const isOtherIncompatible = !!otherIncompatibleWith.find(item => item === provider.get('name'));

            // don't keep if one of the option is not compatible with the other
            return isIncompatible || isOtherIncompatible;
        });

    const injectedOptions = otherSideOptions.filter(opt => opt.get('otherSide'));

    return sideOptions.merge(injectedOptions);
};

export const getProviderCapabilitiesFilters = (
    state,
    props,
    displayOnly = ['whiteList', 'blackList'],
) => {
    const capabilities = getProviderCapabilities(state, props, 'fields');

    // Only return fields that have either 'whiteList', 'blackList' or both (depends on displayOnly)
    return capabilities
        .filter(field => displayOnly.some(listType => field.has(listType)));
};

// Will combine the provider's pcdFields with the container's custom fields
export const getFieldsWithFilterCapability = (state, props) => {
    let capabilities = getProviderCapabilities(state, props, 'fields');

    if (props.meta && props.meta.form === 'multisyncForm') {
        const provider = getProviderByProviderIdentityId(state, props.providerIdentityId);
        capabilities = getProviderCapabilitiesById(state, provider.get('_id'), 'fields');
    }

    const pcdFields = capabilities.filter(field => field.has('whiteList') || field.has('blackList'));
    const pcdFieldsWithKind = pcdFields.map(field => field.set('kind', PCD_FIELD));

    const customFields = getCustomFieldsWithCapabilities(state, props);
    const customFieldsWithKind = customFields.map(field => field.set('kind', CUSTOM_FIELD));

    return pcdFieldsWithKind.concat(customFieldsWithKind);
};

export const getAllowedProviderIdentities = (state, {
    input,
    meta
}) => {
    const defaultProviderIdentityId = getFieldValue(state, input.name, meta.form);
    // FIXME: Find a cleaner way to determine the container id field name...
    // This way still works for both multisync and regular sync so will keep as is
    const containerIdInputName = input.name.replace('providerIdentityId', 'containerId');
    const containerId = getFieldValue(state, containerIdInputName, meta.form);

    return fromLinks.getAllowedProviderIdentities(
        state.links,
        containerId,
        defaultProviderIdentityId,
    );
};

export const getProviderCapabilitiesMapValueFields = (state, props) => {
    const pcdFields = getProviderCapabilities(state, props, 'fields');
    return pcdFields.filter(f => f.get('mapValues'));
};

export const getUnmappedStatusesBySide = (state, containerSide) => {
    const isLoading = isLoadingFieldValue(state, 'A', 'status') || isLoadingFieldValue(state, 'B', 'status');

    if (isLoading) {
        return Map();
    }

    const statuses = getFieldValues(state, {
        kind: PCD_FIELD,
        fieldId: 'status',
        containerSide
    });
    const mappedStatuses = fromLinks.getFieldAssociationByName(state.links, 'status')
        .getIn([containerSide, 'mapping'], List())
        .flatten();

    return statuses.filterNot((status, statusName) => mappedStatuses.contains(statusName));
};

export const getSelectedProvidersMapValueFields = (state) => {
    const pcdFieldsA = getProviderCapabilities(state, {
        containerSide: 'A'
    }, 'fields');
    const pcdFieldsB = getProviderCapabilities(state, {
        containerSide: 'B'
    }, 'fields');

    return pcdFieldsA.filter((f, key) => f.get('mapValues') && pcdFieldsB.has(key) && pcdFieldsB.getIn([key, 'mapValues']));
};

export const getMappedUsers = (state) => {
    const usersA = getPcdFieldValuesByName(state, 'users', 'A');
    const usersB = getPcdFieldValuesByName(state, 'users', 'B');

    const mappingA = fromLinks.getUserMapping(state.links, 'A');
    const mappingB = fromLinks.getUserMapping(state.links, 'B');

    const mappedUsersA = mappingA.map(ids => usersA.get(ids.first(), Map()));
    const mappedUsersB = mappingB.map(ids => usersB.get(ids.first(), Map()));

    return mappedUsersA.map((userA, index) => Map({
        index,
        userA,
        userB: mappedUsersB.get(index),
    }));
};

export const getUnmappedUsers = (state, {
    containerSide
}) => {
    const users = getPcdFieldValuesByName(state, 'users', containerSide);
    const mappedUserIds = fromLinks.getUserMapping(state.links, containerSide);

    return users
        .filter(user => mappedUserIds.every(ids => ids.first() !== user.get('id')))
        .toList()
        .sortBy(user => user.get('displayName'));
};

export const getIsReviewingLink = state => fromLinks.isReviewing(state.links);

export const isStatusMappingValid = (state) => {
    const unmappedStatusesA = getUnmappedStatusesBySide(state, 'A');
    const unmappedStatusesB = getUnmappedStatusesBySide(state, 'B');

    return unmappedStatusesA.isEmpty() && unmappedStatusesB.isEmpty();
};

export const getSyncSettings = (state, props) => {
    const {
        containerSide
    } = props || {};
    return fromLinks.getSyncSettings(state.links, containerSide);
};

export const getFieldAssociations = state => fromLinks.getFieldAssociations(state.links);

export const getMultisyncDefaultFieldAssociations = state => fromMultisyncs.getDefaultFieldAssociations(state.multisyncs);

export const getFieldAssociationsByContainerId = (state, containerId) =>
    fromMultisyncs.getFieldAssociationsByContainerId(state.multisyncs, containerId);

export const isLoadedDefaultFieldAssociations = state =>
    fromMultisyncs.isLoadedDefaultFieldAssociations(state.multisyncs);

export const getCurrentMultisync = state => fromMultisyncs.getCurrentMultisync(state.multisyncs);

export const getLinkId = state => fromLinks.getCurrentSyncId(state.links);

export const isCurrentMultiSync = state => fromLinks.isMultiSync(state.links);

export const isCurrentSyncGrandfathered = state => fromLinks.isGrandfathered(state.links);

export const getCurrentManualOptions = state => fromLinks.getCurrentManualOptions(state.links);

export const getCurrentSyncOwner = state => fromLinks.getCurrentSyncOwner(state.links);

export const getCurrentLinkName = state => fromLinks.getCurrentLinkName(state.links);

export const getCurrentLinkState = state => fromLinks.getCurrentLinkState(state.links);

export const getCurrentLinkKind = state => fromLinks.getCurrentLinkKind(state.links);

export const getCurrentProviderIdentityBySide = (state, containerSide) => fromLinks.getCurrentProviderIdentityBySide(state.links, containerSide);

export const getCurrentSyncHistory = state => fromLinks.getCurrentSyncHistory(state.links);

export const getLinkSortedSyncHistory = (state, linkId) => fromLinks.getLinkSortedSyncHistory(state.links, linkId);

export const getLinkById = (state, linkId) => fromLinks.getLinkById(state.links, linkId);

export const linkSyncHistoryHasLoaded = (state, linkId) => fromLinks.linkSyncHistoryHasLoaded(state.links, linkId);

export const getSyncHistoryUpdatedAt = (state, linkId) => fromLinks.getSyncHistoryUpdatedAt(state.links, linkId);

export const linkHasErrors = (state, linkId) => {
    const link = getLinkById(state, linkId);
    const syncHistory = getLinkSortedSyncHistory(state, linkId);
    const lastSync = syncHistory.first();

    if (!lastSync) {
        const createdAt = moment(link.get('createdAt'));
        const hoursSinceCreation = (moment().unix() - createdAt.unix()) / 60 / 60;

        return hoursSinceCreation > 72;
    }

    const lastSyncHasErrors = !lastSync.get('errorDetails').isEmpty();

    const lastSyncEnded = moment(lastSync.get('endTime'));
    const minutesSinceLastSync = (moment().unix() - lastSyncEnded.unix()) / 60;

    return lastSyncHasErrors || minutesSinceLastSync > 15;
};

export const isDiagnosticLoading = state => fromLinks.isDiagnosticLoading(state.links);

export const getLatestDiagnostic = state => fromLinks.getDiagnosticResult(state.links);

export const getCustomFields = (state, containerSide) => fromFields.getCustomFields(state.fields, containerSide);

export const getCustomFieldsWithCapabilities = (state, props) => {
    const customFields = getCustomFields(state, props.containerSide);
    const customFieldsCapabilities = getProviderCapabilities(state, props, 'customFields');

    return customFields.map((customField) => {
        const customFieldType = customField.get('type');
        const capabilities = customFieldsCapabilities.get(customFieldType);

        return customField.merge(capabilities);
    });
};

export const getCustomFieldById = (state, containerSide, fieldId) => getCustomFields(state, containerSide).get(fieldId, Map());

/**
 *  Gets sync direction from readOnly booleans
 */
export const getCurrentSyncDirection = (state) => {
    const readOnlyA = getContainerFieldValue(state, {
        containerSide: 'A'
    }, 'readOnly');
    if (readOnlyA) {
        return fieldTypes.TARGET.B;
    }

    const readOnlyB = getContainerFieldValue(state, {
        containerSide: 'B'
    }, 'readOnly');
    if (readOnlyB) {
        return fieldTypes.TARGET.A;
    }

    return fieldTypes.TARGET.BOTH;
};

export const getFieldValues = (
    state, {
        containerSide,
        fieldId,
        isFilterField,
        kind,
        input = {},
    },
    sorted = false,
    includeHidden = false,
) => {
    let fieldValues = fromFields
        .getFieldValues(state.fields, kind, fieldId, containerSide)
        .filter(fieldValue => includeHidden || !fieldValue.get('isHidden'));

    // Filter out other filter list, whiteList <=> blackList are mutually exclusive
    if (isFilterField) {
        const otherFieldName = (input.name === `${fieldId}WhiteList${containerSide}`) ?
            `${fieldId}BlackList${containerSide}` :
            `${fieldId}WhiteList${containerSide}`;

        const formFieldValue = getFieldValue(state, otherFieldName) || [];
        const valuesToExclude = formFieldValue || [];
        fieldValues = fieldValues.filterNot(fieldValue => valuesToExclude.includes(fieldValue.get('id')));
    }

    if (fieldValues.isEmpty() || !sorted) {
        return fieldValues;
    }

    if (fieldValues.first().has('displayOrder')) {
        return fieldValues.sortBy(fv => fv.get('displayOrder'));
    }

    return fieldValues.sortBy(fv => fv.get('displayName', '').toLowerCase());
};

export const getDefaultWorkflowId = (state, containerSide, fieldId) => fromFields.getDefaultWorkflowId(state.fields, containerSide, fieldId);

export const getFieldAssociationItems = (state, fa) => {
    const mappingIdsA = fa.getIn(['A', 'mapping']);
    const mappingIdsB = fa.getIn(['B', 'mapping']);
    const fieldValuesA = fromFields.getFieldValues(state.fields, fa.getIn(['A', 'kind']), fa.getIn(['A', 'field']), 'A');
    const fieldValuesB = fromFields.getFieldValues(state.fields, fa.getIn(['B', 'kind']), fa.getIn(['B', 'field']), 'B');

    // Iterate over the longest list
    const mappingIds = mappingIdsA.size >= mappingIdsB.size ? mappingIdsA : mappingIdsB;
    return mappingIds.map((group, groupIndex) => Map({
        A: mappingIdsA.get(groupIndex, List()).map(id => fieldValuesA.get(id, Map())),
        B: mappingIdsB.get(groupIndex, List()).map(id => fieldValuesB.get(id, Map())),
    }));
};

export const getField = (state, {
    containerSide,
    fieldId,
    kind,
    providerId,
    providerIdentityId,
}) => {
    if (kind === CUSTOM_FIELD) {
        return getCustomFieldById(state, containerSide, fieldId) || Map();
    }

    let capabilities;
    if (providerId) {
        capabilities = getProviderCapabilitiesById(state, providerId);
    } else {
        capabilities = providerIdentityId ?
            getProviderCapabilitiesById(state, getProviderByProviderIdentityId(state, providerIdentityId).get('_id')) :
            getProviderCapabilities(state, {
                containerSide
            });
    }

    if (kind === PCD_FIELD) {
        return capabilities.getIn(['fields', fieldId], Map());
    }

    if (kind === PCD_COMMON) {
        return capabilities.getIn(['commonDestinations', fieldId], Map());
    }

    return Map();
};

export const getFieldDisplayName = (state, {
    category: categoryId,
    containerSide,
    fieldId,
    kind,
    providerId,
    providerIdentityId,
}, singularity = 'default') => { // eslint-disable-line
    const field = getField(state, {
        containerSide,
        fieldId,
        kind,
        providerId,
        providerIdentityId,
    });

    if (kind === PCD_FIELD) {
        const displayName = field.getIn(['displayName', singularity]) || field.getIn(['displayName', 'singular']) || fieldId;
        if (categoryId && categoryId !== 'default') {
            const categories = fromFields.getMappingCategories(state.fields, containerSide);
            const category = categories.getIn([fieldId, categoryId], Map());
            return `${displayName} - ${category.get('displayName', '')}`;
        }

        return displayName;
    }

    if (kind === CUSTOM_FIELD) {
        return field.get('name', fieldId);
    }

    if (kind === PCD_COMMON) {
        return field.get(singularity) || field.get('singular') || fieldId;
    }

    return fieldId;
};

export const getFieldAssociationByIndex = (state, index) => fromLinks.getFieldAssociationByIndex(state.links, index);

export const getFieldAssociationFieldValue = (state, containerSide, fieldAssociation) => {
    const fieldIdA = fieldAssociation.getIn(['A', 'field']);
    const kindA = fieldAssociation.getIn(['A', 'kind']);
    const fieldIdB = fieldAssociation.getIn(['B', 'field']);
    const kindB = fieldAssociation.getIn(['B', 'kind']);
    const mappingName = `${fieldIdA}${kindA}${fieldIdB}${kindB}Mapping`;
    return getContainerFieldValue(state, {
        containerSide
    }, mappingName);
};

export const getFieldAssociationsForMultisync = (state, {
    leafContainerId,
    rootProvider,
    leafProvider,
    topology,
}) => {
    const fieldAssociations = leafContainerId ?
        getFieldAssociationsByContainerId(state, leafContainerId) :
        getMultisyncDefaultFieldAssociations(state);
    const providerIdA = topology === multisyncTypes.TOPOLOGIES.SPLIT ? rootProvider.get('_id') : leafProvider.get('_id');
    const providerIdB = topology === multisyncTypes.TOPOLOGIES.SPLIT ? leafProvider.get('_id') : rootProvider.get('_id');
    const fieldCapabilitiesA = getProviderCapabilitiesById(state, providerIdA, 'fields');
    const fieldCapabilitiesB = getProviderCapabilitiesById(state, providerIdB, 'fields');

    return fieldAssociations.map(fieldAssociation => (
        fieldAssociation.mergeDeep(fromJS({
            A: {
                displayName: getFieldDisplayName(state, {
                    category: fieldAssociation.getIn(['A', 'mappingCategory']),
                    containerSide: 'A',
                    fieldId: fieldAssociation.getIn(['A', 'field']),
                    kind: fieldAssociation.getIn(['A', 'kind']),
                    providerId: providerIdA,
                }),
                displayNamePlural: getFieldDisplayName(state, {
                    category: fieldAssociation.getIn(['A', 'mappingCategory']),
                    containerSide: 'A',
                    fieldId: fieldAssociation.getIn(['A', 'field']),
                    kind: fieldAssociation.getIn(['A', 'kind']),
                    providerId: providerIdA,
                }, 'plural'),
            },
            B: {
                displayName: getFieldDisplayName(state, {
                    category: fieldAssociation.getIn(['B', 'mappingCategory']),
                    containerSide: 'B',
                    fieldId: fieldAssociation.getIn(['B', 'field']),
                    kind: fieldAssociation.getIn(['B', 'kind']),
                    providerId: providerIdB,
                }),
                displayNamePlural: getFieldDisplayName(state, {
                    category: fieldAssociation.getIn(['B', 'mappingCategory']),
                    containerSide: 'B',
                    fieldId: fieldAssociation.getIn(['B', 'field']),
                    kind: fieldAssociation.getIn(['B', 'kind']),
                    providerId: providerIdB,
                }, 'plural'),
            },
            hasMapValues: fieldAssociation.hasIn(['A', 'mapping']) && fieldAssociation.hasIn(['B', 'mapping']),
            canMapValues: fieldCapabilitiesA.getIn([fieldAssociation.getIn(['A', 'field']), 'mapValues']) &&
                fieldCapabilitiesB.getIn([fieldAssociation.getIn(['B', 'field']), 'mapValues']),
            isSettingsPerSync: !!leafContainerId,
        }))
    ));
};

export const getFieldAssociationsList = (state) => {
    const fieldAssociations = getFieldAssociations(state) || List();

    return fieldAssociations.map(fieldAssociation => (
        fieldAssociation.mergeDeep(fromJS({
            A: {
                displayName: getFieldDisplayName(state, {
                    fieldId: fieldAssociation.getIn(['A', 'field']),
                    kind: fieldAssociation.getIn(['A', 'kind']),
                    containerSide: 'A',
                    category: fieldAssociation.getIn(['A', 'mappingCategory']),
                }),
                displayNamePlural: getFieldDisplayName(state, {
                    fieldId: fieldAssociation.getIn(['A', 'field']),
                    kind: fieldAssociation.getIn(['A', 'kind']),
                    containerSide: 'A',
                    category: fieldAssociation.getIn(['A', 'mappingCategory']),
                }, 'plural'),
            },
            B: {
                displayName: getFieldDisplayName(state, {
                    fieldId: fieldAssociation.getIn(['B', 'field']),
                    kind: fieldAssociation.getIn(['B', 'kind']),
                    containerSide: 'B',
                    category: fieldAssociation.getIn(['B', 'mappingCategory']),
                }),
                displayNamePlural: getFieldDisplayName(state, {
                    fieldId: fieldAssociation.getIn(['B', 'field']),
                    kind: fieldAssociation.getIn(['B', 'kind']),
                    containerSide: 'B',
                    category: fieldAssociation.getIn(['B', 'mappingCategory']),
                }, 'plural'),
            },
            hasMapValues: fieldAssociation.hasIn(['A', 'mapping']) && fieldAssociation.hasIn(['B', 'mapping']),
        }))
    ));
};

const isFieldAssociationMissingDefaults = (state, {
    fieldAssociation,
    containerSide
}) => {
    const mapping = fieldAssociation.getIn([containerSide, 'mapping'], List());

    const fieldValues = fromFields.getFieldValues(
        state.fields,
        fieldAssociation.getIn([containerSide, 'kind']),
        fieldAssociation.getIn([containerSide, 'field']),
        containerSide,
    );

    // Prevents errors from throwing until user has visited FieldMappingPage
    if (fieldValues.isEmpty()) {
        return false;
    }

    const firstEntryWithMissingDefault = mapping.find((group) => {
        const defaultMappingId = group.first();
        const fieldDetails = fieldValues.get(defaultMappingId);

        return !fieldDetails || fieldDetails.get('isHidden');
    });

    return !!firstEntryWithMissingDefault;
};

export const getFieldAssociationSideWarnings = (state, {
    fieldAssociationIndex,
    fieldAssociation,
    containerSide
}) => {
    const isLoading = isLoadingFieldValues(state);
    const hasMapValues = fieldAssociation && fieldAssociation.get('hasMapValues');

    if (isLoading || !hasMapValues) {
        return List();
    }

    let warnings = List();

    const isStatusMapping = fieldAssociation.getIn(['A', 'field']) === 'status' && fieldAssociation.getIn(['B', 'field']) === 'status';
    const unmappedCount = getUnmappedFieldValuesCount(state, {
        fieldAssociationIndex,
        containerSide,
        fieldAssociation
    });
    const isOtherSideReadOnly = isSideReadOnly(state, {
        containerSide: getOtherSide(containerSide)
    });

    if (isStatusMapping && unmappedCount > 0 && !isOtherSideReadOnly) {
        warnings = warnings.push(Map({
            containerSide,
            type: linkTypes.WARNINGS.UNMAPPED_STATUSES,
            unmappedCount,
        }));
    }

    const isMissingDefaultValues = isFieldAssociationMissingDefaults(state, {
        fieldAssociation,
        containerSide
    });
    const isReadOnly = isSideReadOnly(state, {
        containerSide
    });

    if (isMissingDefaultValues && !isReadOnly) {
        warnings = warnings.push(Map({
            containerSide,
            type: linkTypes.WARNINGS.MISSING_MAPPING_FIELD_VALUE,
        }));
    }

    return warnings;
};

export const getFieldAssociationWillBeIgnored = (state, {
    fieldAssociation,
    defaultTarget = fieldTypes.TARGET.BOTH,
}) => {
    const associationTarget = fieldAssociation.get('target');
    const isNotBothWays = getContainerFieldValue(state, {
            containerSide: 'A'
        }, 'readOnly') ||
        getContainerFieldValue(state, {
            containerSide: 'B'
        }, 'readOnly') || defaultTarget !== fieldTypes.TARGET.BOTH;

    if (isNotBothWays && associationTarget && associationTarget !== fieldTypes.TARGET.BOTH) {
        // If one side is read-only, associations whose target is the read-only side will be ignored
        return getContainerFieldValue(state, {
            containerSide: associationTarget
        }, 'readOnly') || associationTarget !== defaultTarget;
    }

    return false;
};

export const getMappingSideWarnings = (state, {
    containerSide
}) => {
    let warnings = List();

    const fieldAssociations = getFieldAssociationsList(state);

    fieldAssociations.forEach((fieldAssociation, fieldAssociationIndex) => {
        const warning = getFieldAssociationSideWarnings(state, {
            fieldAssociationIndex,
            fieldAssociation,
            containerSide
        });
        warnings = warnings.concat(warning);
    });

    return warnings;
};

export const isContainerInMultiSync = (state, {
    containerSide,
    isEdit
}) => {
    const container = getContainer(state, {
        containerSide
    });
    const minSize = isEdit ? 1 : 0;
    return container.get('syncedIn', List()).size > minSize;
};

export const getFiltersSideWarnings = (state, {
    containerSide,
    isEdit
}) => {
    const warnings = List();

    const isMultiSync = isContainerInMultiSync(state, {
        containerSide,
        isEdit
    });
    const isReadOnly = isSideReadOnly(state, {
        containerSide
    });
    if (isMultiSync && isReadOnly) {
        return warnings;
    }

    // A filter is only counted if a user has added values to it.
    const filters = getFieldValue(state, `${containerSide}.filters`) || [];
    const appliedFilters = filters.filter(filter => !!filter.values);
    if (isMultiSync && appliedFilters.length === 0) {
        const isOtherReadOnly = isSideReadOnly(state, {
            containerSide: getOtherSide(containerSide)
        });
        if (isOtherReadOnly) {
            return warnings.push(Map({
                containerSide,
                type: linkTypes.WARNINGS.NO_FILTERS_MULTI_SYNC_OTHER_RO,
            }));
        }

        return warnings.push(Map({
            containerSide,
            type: linkTypes.WARNINGS.NO_FILTERS_MULTI_SYNC_BOTH,
        }));
    }

    return warnings;
};

const getPcdFieldValuesByName = (state, pcdName, containerSide) =>
    fromFields.getPcdFieldValuesByName(state.fields, pcdName, containerSide);

const getFieldAssociationFieldValues = (state, containerSide, fieldAssociation) => {
    const kind = fieldAssociation.getIn([containerSide, 'kind']);
    const fieldId = fieldAssociation.getIn([containerSide, 'field']);
    let fieldValues;

    if (kind === CUSTOM_FIELD) {
        fieldValues = getCustomFieldById(state, containerSide, fieldId).get('values', Map());
    } else {
        fieldValues = getPcdFieldValuesByName(state, fieldId, containerSide);
    }

    // FIXME: Hack: map is a weird workaround (array of array), so it works with DragDropMapping
    // Remove this when DragDropMapping will support mapping of flat items
    return fieldValues.map(value => List([value])).toList();
};

export const getMappingByFieldAssociationIndex = (state, index) => {
    const fieldAssociation = getFieldAssociationByIndex(state, index);
    const kindA = fieldAssociation.getIn(['A', 'kind']);
    const kindB = fieldAssociation.getIn(['B', 'kind']);

    let selectedMapping = Map();
    const fieldIdA = fieldAssociation.getIn(['A', 'field']);
    const fieldIdB = fieldAssociation.getIn(['B', 'field']);
    const mappingName = `${fieldIdA}${kindA}${fieldIdB}${kindB}`;
    selectedMapping = Map({
        A: getFieldAssociationFieldValues(state, 'A', fieldAssociation),
        B: getFieldAssociationFieldValues(state, 'B', fieldAssociation),
    });

    // Insert mapping name in object, since we lose it when selecting the object
    return selectedMapping.merge(fromJS({
        mappingName,
    }));
};

export const getUnmappedFieldValuesCount = (state, {
    fieldAssociation: fa,
    containerSide
}) => {
    const fieldValues = getFieldValues(state, {
        kind: fa.getIn([containerSide, 'kind']),
        fieldId: fa.getIn([containerSide, 'field']),
        containerSide,
    });

    const fieldValueIds = fieldValues.map(fieldValue => fieldValue.get('id'));
    const mappedFieldValuesIds = fa.getIn([containerSide, 'mapping'], List()).flatten(1);
    // We need to filter out mapped field values that no longer exist on the provider side or
    // the add new group might not be displayed even if there are remaining field values to map
    const filteredIds = mappedFieldValuesIds.filter(id => fieldValueIds.contains(id));

    return fieldValues.size - filteredIds.size;
};

export const fieldAssociationNeedsAutomapping = (state, {
    fieldAssociation,
    entity
}) => {
    // Doesn't need automapping if mapping already exists
    if (fieldAssociation.hasIn(['A', 'mapping']) && fieldAssociation.hasIn(['B', 'mapping'])) {
        return false;
    }

    let hasFieldValuesA = false;
    let hasFieldValuesB = false;
    const fieldIdA = fieldAssociation.getIn(['A', 'field']);
    const fieldIdB = fieldAssociation.getIn(['B', 'field']);

    if (fieldAssociation.getIn(['A', 'kind']) === CUSTOM_FIELD) {
        hasFieldValuesA = getCustomFieldById(state, 'A', fieldIdA).get('type') === 'enum';
    }

    if (fieldAssociation.getIn(['B', 'kind']) === CUSTOM_FIELD) {
        hasFieldValuesB = getCustomFieldById(state, 'B', fieldIdB).get('type') === 'enum';
    }

    if (fieldAssociation.getIn(['A', 'kind']) === PCD_FIELD) {
        let pcdFields = getProviderCapabilities(state, {
            containerSide: 'A'
        }, 'fields');
        if (entity === multisyncTypes.ENTITY_NAME) {
            const providerIdentityId = getFieldValue(state, 'root.providerIdentityId', 'multisyncForm');
            pcdFields = getProviderCapabilitiesByProviderIdentityId(state, {
                providerIdentityId
            }, 'fields');
        }
        hasFieldValuesA = pcdFields.get(fieldIdA, Map()).get('mapValues', false);
    }

    if (fieldAssociation.getIn(['B', 'kind']) === PCD_FIELD) {
        let pcdFields = getProviderCapabilities(state, {
            containerSide: 'B'
        }, 'fields');
        if (entity === multisyncTypes.ENTITY_NAME) {
            const providerIdentityId = getFieldValue(state, 'leaves.providerIdentityId', 'multisyncForm');
            pcdFields = getProviderCapabilitiesByProviderIdentityId(state, {
                providerIdentityId
            }, 'fields');
        }
        hasFieldValuesB = pcdFields.get(fieldIdB, Map()).get('mapValues', false);
    }

    return hasFieldValuesA && hasFieldValuesB;
};

export const getMappingCategories = (state, containerSide) =>
    fromFields.getMappingCategories(state.fields, containerSide);

export const getToken = state => fromAuth.getToken(state.auth);

export const getIsAuthenticated = state => fromAuth.getIsAuthenticated(state.auth);

export const getIsAuthenticating = state => fromAuth.getIsAuthenticating(state.auth);

export const isUserSiteAdmin = state => fromAuth.isSiteAdmin(state.auth);

export const getProjectSyncVisiblePlans = state =>
    fromBilling.getProjectSyncVisiblePlans(state.billing);

export const getTaskSyncPlans = state =>
    fromBilling.getTaskSyncPlans(state.billing);

export const getTaskSyncVisiblePlans = state =>
    fromBilling.getTaskSyncVisiblePlans(state.billing);

export const getVisiblePlans = (state) => {
    const projectSyncPlans = getProjectSyncVisiblePlans(state);
    const taskSyncVisiblePlans = getTaskSyncVisiblePlans(state);
    return projectSyncPlans.merge(taskSyncVisiblePlans);
};

export const getOrganizations = state => fromOrganizations.getOrganizations(state.organizations);

export const getSelectedOrganizationId = state => fromApp.getSelectedOrganizationId(state.app);

export const getOrganizationById = (state, id) => fromOrganizations.getById(state.organizations, id);

export const getOrganizationPlanId = (state, organizationId) =>
    fromOrganizations.getSelectedPlanId(state.organizations, organizationId);

export const getOrganizationSubscriptionId = (state, organizationId) =>
    fromOrganizations.getStripeSubscriptionId(state.organizations, organizationId);

export const getOrganizationCustomerId = (state, organizationId) => fromOrganizations.getCustomerId(state.organizations, organizationId);

export const getIsCurrentPlanTaskSync = (state, organizationId) => {
    const subscription = getOrganizationSubscription(state, organizationId);
    const planId = subscription.getIn(['plan', 'id']);
    const taskSyncPlans = getTaskSyncPlans(state);
    return taskSyncPlans.has(planId);
};

export const isOnFreeTrial = (state, ownProps = {}) =>
    fromOrganizations.isOnFreeTrial(state.organizations, ownProps.organizationId);

export const isOnFreeWithWrikePlan = state =>
    fromOrganizations.isOnFreeWithWrikePlan(state.organizations);

export const getFirstOrganization = state =>
    fromOrganizations.getFirstOrganization(state.organizations);

export const isOnCustomPlan = state =>
    fromOrganizations.isOnCustomPlan(state.organizations);

export const isOnLegacyPlan = (state, currentSubscription) => {
    const currentPlanId = currentSubscription.getIn(['plan', 'id']);
    const visiblePlans = getVisiblePlans(state);
    const isLegacy = !currentSubscription.get('cancelAtPeriodEnd') &&
        !isOnFreeTrial(state) &&
        !isOnFreeWithWrikePlan(state) &&
        !isOnCustomPlan(state) &&
        !visiblePlans.get(currentPlanId, false);
    return isLegacy;
};

export const isOrganizationOverUserLimit = (state) => {
    const firstOrganizationId = getFirstOrganizationId(state);
    const currentSubscription = getOrganizationSubscription(state, firstOrganizationId);
    const currentPlan = getCurrentPlan(state, currentSubscription);
    const collaboratorsStats = getCollaboratorsStatsByOrgId(state, firstOrganizationId);
    const numberOfCollaborators = collaboratorsStats.get('numCollaborators', 0);
    const planMaxUsers = Number(currentPlan.getIn(['featuresById', 'MAX_USERS', 'limit']));
    return numberOfCollaborators > planMaxUsers;
};

export const getCurrentPlan = (state, currentSubscription) => {
    const currentPlanId = currentSubscription.getIn(['plan', 'id']);
    return fromBilling.getPlanById(state.billing, currentPlanId);
};

export const getExtraFeaturesAndLinks = (state, currentSubscription) => {
    const currentPlan = getCurrentPlan(state, currentSubscription) || Map();
    const allLinks = fromLinks.getLinks(state.links);
    const allLinksButTaskSyncs = allLinks.filter(link => link.get('kind') !== linkTypes.KIND.TASK_SYNC);

    const planFeatureIds = currentPlan.get('features', List()).reduce((accum, feature) => (
        accum.push(feature.get('id'))
    ), List()).toSet();

    const usedFeatureIds = allLinksButTaskSyncs.reduce((accum, link) => (
        accum.push(...link.get('features'))
    ), List()).toSet();

    const extraFeatureIds = usedFeatureIds.subtract(planFeatureIds).toList();
    const extraFeatures = extraFeatureIds.map(featureId => (fromBilling.getFeatureById(state.billing, featureId)));

    return extraFeatures.map((feature) => {
        const linksUsingFeature = allLinksButTaskSyncs.filter(link => link.get('features').contains(feature.get('id')));
        return feature.set('links', linksUsingFeature);
    });
};

export const getCurrentSendEmailReceiptChoice = (state, organizationId) =>
    fromOrganizations.getCurrentSendEmailReceiptChoice(state.organizations, organizationId);

export const getFirstOrganizationId = state =>
    fromOrganizations.getFirstOrganizationId(state.organizations);

export const getOrganizationName = (state, organizationId) => {
    const workspaceId = organizationId || getFirstOrganizationId(state);
    return fromOrganizations.getName(state.organizations, workspaceId);
};

export const getOrganizationBillingEmail = (state, organizationId) => {
    const workspaceId = organizationId || getFirstOrganizationId(state);
    return fromOrganizations.getBillingEmail(state.organizations, workspaceId);
};

export const getCollaboratorsStatsByOrgId = (state, organizationId) =>
    fromOrganizations.getCollaboratorsStatsByOrgId(state.organizations, organizationId);

export const getOrganizationStatus = state => fromOrganizations.getFirstOrganizationStatus(state.organizations);

export const getOrganizationTraits = state => fromOrganizations.getFirstOrganizationTraits(state.organizations);

export const isOrganizationTrialExpired = (state) => {
    const paymentStatus = getOrganizationStatus(state);
    const {
        TRIAL_EXPIRED
    } = organizationTypes.STATUSES;
    return paymentStatus === TRIAL_EXPIRED;
};

export const isOrganizationDelinquent = (state) => {
    const paymentStatus = getOrganizationStatus(state);
    const {
        DELINQUENT
    } = organizationTypes.STATUSES;
    return paymentStatus === DELINQUENT;
};

export const isOrganizationAccountCanceled = (state) => {
    const paymentStatus = getOrganizationStatus(state);
    const {
        CANCELED
    } = organizationTypes.STATUSES;
    return paymentStatus === CANCELED;
};

export const isOrganizationAccountSuspended = (state) => {
    const paymentStatus = getOrganizationStatus(state);
    const {
        CHURNED,
        EXPIRED
    } = organizationTypes.STATUSES;
    return [CHURNED, EXPIRED].includes(paymentStatus);
};

export const isOrganizationAccountPaying = (state) => {
    const paymentStatus = getOrganizationStatus(state);
    const {
        PAYING
    } = organizationTypes.STATUSES;
    return paymentStatus === PAYING;
};

export const isPayingOrganizationLastUser = (state) => {
    const members = fromOrganizations.getFirstOrganizationMembers(state.organizations);
    const paymentStatus = fromOrganizations.getFirstOrganizationStatus(state.organizations);
    const {
        PAYING
    } = organizationTypes.STATUSES;
    return (paymentStatus === PAYING) && (members.size === 1);
};

export const getIsLoadingOrganizations = state => fromOrganizations.getIsLoading(state.organizations);

export const getIsLoadedOrganizations = state => fromOrganizations.getIsLoaded(state.organizations);

export const isOrganizationUpdating = state =>
    fromOrganizations.isOrganizationUpdating(state.organizations);

export const getFeatureFlagValue = (state, flagName, type = flagTypes.TYPES.USER) => fromFlags.getFlagValue(state.flags, flagName, type);

export const isUserFeatureFlagActive = (state, flagName, expectedValue = true) =>
    getFeatureFlagValue(state, flagName) === expectedValue;

export const isCohortFeatureFlagActive = (state, flagName, expectedValue = true) =>
    getFeatureFlagValue(state, flagName, flagTypes.TYPES.COHORT) === expectedValue;

export const getFlags = (state, type = flagTypes.TYPES.USER) => fromFlags.getAll(state.flags, type);

export const organizationNeedsPayment = state => isOrganizationAccountSuspended(state) || isOrganizationTrialExpired(state);

export const getPlansAreLoading = state => fromBilling.getPlansAreLoading(state.billing);

export const getCustomerById = (state, customerId) => fromBilling.getCustomerById(state.billing, customerId);

export const customerHasPaymentSource = (state, customerId) => {
    const customer = getCustomerById(state, customerId);
    return !!customer.get('defaultSource');
};

export const getCustomerDefaultPaymentSource = (state, customerId) => fromBilling.getCustomerDefaultPaymentSource(state.billing, customerId);

export const getCustomerInvoices = (state, customerId) => fromBilling.getCustomerInvoices(state.billing, customerId);

export const getActiveCoupon = (state, customerId, organizationId) => {
    const subscriptionId = getOrganizationSubscriptionId(state, organizationId);
    const subscriptionCoupon = fromBilling.getSubscriptionCoupon(state.billing, subscriptionId);
    const customerCoupon = fromBilling.getCustomerCoupon(state.billing, customerId);
    // Subscription coupon wins over customer coupon
    return subscriptionCoupon || customerCoupon || new Map();
};

export const getOrganizationCustomer = (state, organizationId) => {
    const customerId = getOrganizationCustomerId(state, organizationId);
    return getCustomerById(state, customerId);
};

export const getOrganizationSubscription = (state, organizationId) => {
    const subscriptionId = getOrganizationSubscriptionId(state, organizationId);
    return fromBilling.getSubscriptionById(state.billing, subscriptionId);
};

export const organizationHasActiveSubscription = (state, organizationId) => {
    const planId = getOrganizationPlanId(state, organizationId);
    const currentSubscription = getOrganizationSubscription(state, organizationId);
    // FIXME: This should be returned by the getConfig call, so we get the real names of
    // env vars UNITO_STRIPE_DEFAULT_PLAN_ID and UNITO_STRIPE_EMBED_WRIKE_PLAN_ID
    return !currentSubscription.isEmpty() && !['reseller-wrike', 'trial'].includes(planId);
};

export const getOrganizationMembers = (state, organizationId) => fromOrganizations.getMembersByOrgId(state.organizations, organizationId);

export const getOrganizationCoworkers = (state, organizationId) => fromOrganizations.getCoworkersByOrgId(state.organizations, organizationId);

export const getSortedOrganizationMembers = (state, organizationId) => {
    const members = getOrganizationMembers(state, organizationId);
    return members.sortBy(m => m.getIn(['user', 'fullName'], '').toLowerCase());
};

export const getSortedOrganizationCoworkers = (state, organizationId) => {
    const coworkers = getOrganizationCoworkers(state, organizationId);
    return coworkers.sortBy(c => c.get('fullName', '').toLowerCase());
};

export const getIsLoadingInvites = state => fromInvites.getIsLoading(state.invites);

export const getIsLoadedInvites = state => fromInvites.getIsLoaded(state.invites);

export const getInvitesGroupedByUser = state => fromInvites.getInvitesGroupedByUser(state.invites);

export const getInvitesGroupedByEmail = state => fromInvites.getInvitesGroupedByEmail(state.invites);

export const getUserEmail = state => fromAuth.getUserEmail(state.auth);

export const getUserPendingInvite = (state) => {
    const userId = getUserId(state);
    const invite = fromInvites.getInviteByUserId(state.invites, userId);
    return fromInvites.isInvitePending(invite) ? invite : Map();
};

export const getUserKeepInformed = state => fromAuth.getKeepInformed(state.auth);

export const getLinksCount = state => fromLinks.getLinks(state.links).size;

export const getAutoSyncLinksCount = (state) => {
    const allLinks = fromLinks.getLinks(state.links);
    const allLinksButTaskSyncs = allLinks.filter(link => link.get('kind') !== linkTypes.KIND.TASK_SYNC);
    return allLinksButTaskSyncs.filter(sync => sync.get('isAutoSync')).size;
};

export const isSavingSync = state => fromLinks.isSavingSync(state.links);

export const isLoadedLinks = state => fromLinks.isLoaded(state.links);

export const isLoadedMultisyncs = state => fromMultisyncs.isLoaded(state.multisyncs);

export const getIsLoadedFlags = state => fromFlags.isEverythingLoaded(state.flags);

export const getIsLoadingFlags = state => fromFlags.isSomethingLoading(state.flags);

export const isSideReadOnly = (state, {
    containerSide
}) => getContainerFieldValue(state, {
    containerSide
}, 'readOnly');

export const isLoadedUsers = state => fromFields.isLoadedUsers(state.fields);

export const isLoadedProviderIdentities = state => fromProviderIdentities.isLoaded(state.providerIdentities);

export const isLoadedCustomFields = (state, {
    containerSide
}) => fromFields.isLoadedCustomFields(state.fields, {
    containerSide
});

export const isLoadingProviderIdentities = state => fromProviderIdentities.isLoading(state.providerIdentities);

export const isLoadingFieldValue = (state, containerSide, fieldId) => fromFields.isLoadingFieldValue(state.fields, containerSide, fieldId);

export const isLoadingFieldValues = state => fromFields.isLoadingFieldValues(state.fields);

export const getIsCustomFieldsLoading = state => fromFields.getIsCustomFieldsLoading(state.fields);

export const isCurrentSyncLoaded = state => fromLinks.isCurrentLoaded(state.links);

export const getCurrentUserMappingError = state => fromLinks.getCurrentUserMappingError(state.links);

export const getIsSideLocked = (state, {
    containerSide
}) => fromApp.getIsSideLocked(state.app, containerSide);

export const getEmbedName = state => fromApp.getEmbedName(state.app);

export const appIsInMaintenance = state => fromApp.getIsInMaintenance(state.app);

export const getClientVersion = state => fromApp.getClientVersion(state.app);

export const appHasDefaultSyncParameters = (state, side) => fromApp.hasDefaultSyncParameters(state.app, side);

export const getDefaultParamContainerId = (state, side) => fromApp.getDefaultParamContainerId(state.app, side);

export const getIsLoadingApp = state => fromApp.getIsLoading(state.app);

export const getSessionId = state => fromApp.getSessionId(state.app);

export const getSortedLinks = state => fromLinks.getSortedLinks(state.links);

export const getSyncingLinkIds = state => fromLinks.getSyncingLinkIds(state.links);

export const isFetchingSyncStates = state => fromLinks.isFetchingSyncStates(state.links);

export const getUserProviderIdentities = (state) => {
    const userId = getUserId(state);
    return fromProviderIdentities.getUserProviderIdentities(state.providerIdentities, userId);
};

export const getVisibleProviderIdentities = (state, ownProps) => {
    const providerId = ownProps.provider ?
        ownProps.provider.get('_id') :
        getContainerFieldValue(state, ownProps, 'providerId');
    return getUserProviderIdentitiesByProviderId(state, providerId);
};

export const getProviderIdentitiesByIds = (state, providerIdentitiesIds) =>
    fromProviderIdentities.getByIds(state.providerIdentities, providerIdentitiesIds);

export const getProviderIdentityById = (state, providerIdentityId) =>
    fromProviderIdentities.getById(state.providerIdentities, providerIdentityId);

export const getProviderIdentityProviderName = (state, providerIdentityId) =>
    fromProviderIdentities.getProviderName(state.providerIdentities, providerIdentityId);

export const getCurrentLinkErrors = (state) => {
    let errors = fromJS({
        containers: {},
        identities: {},
    });
    const link = fromLinks.getCurrentLink(state.links);

    for (const containerSide of ['A', 'B']) {
        if (link.getIn([containerSide, 'container', 'state']) === containerTypes.STATE.INACCESSIBLE) {
            errors = errors.setIn(['containers', containerSide], link.getIn([containerSide, 'container']));
        }

        const providerIdentityId = link.getIn([containerSide, 'providerIdentity', '_id']);
        const providerIdentity = getProviderIdentityById(state, providerIdentityId);
        if (providerIdentity.get('state') === providerIdentityTypes.STATE.DISABLED) {
            // In A-A sync, both providerIdentity could be the same,
            // ...in which case we should only display one reconnect button
            if (containerSide === 'A' || (containerSide === 'B' && providerIdentity.get('_id') !== errors.getIn(['identities', 'A', '_id']))) {
                errors = errors.setIn(['identities', containerSide], providerIdentity);
            }
        }
    }

    return errors;
};

export const getProviderCapabilitiesByProviderIdentityId = (state, {
    providerIdentityId
}, key) => {
    const providerIdentity = getProviderIdentityById(state, providerIdentityId);
    const providerName = providerIdentity.get('providerName');
    const provider = fromProviders.getProviderByName(state.providers, providerName);
    return fromProviders.getCapabilitiesByProviderId(state.providers, provider.get('_id'), key);
};

export const getProviderCapabilitiesByProviderName = (state, providerName, key) => {
    const provider = fromProviders.getProviderByName(state.providers, providerName);
    return fromProviders.getCapabilitiesByProviderId(state.providers, provider.get('_id'), key);
};

export const getInitialProviderIdentityId = (state, props) => {
    const providerId = getContainerFieldValue(state, props, 'providerId');
    const defaultProviderIdentityId = fromApp.getDefaultParamProviderIdentityId(state.app, props.containerSide);
    return defaultProviderIdentityId || getDefaultProviderIdentityByProviderId(state, providerId);
};

export const getInitialExistingContainer = (state, props) => {
    const providerId = getContainerFieldValue(state, props, 'providerId');
    const capabilities = getProviderCapabilitiesById(state, providerId, 'capabilities');

    // If a provider cannot create a container, it should default to using existing
    const canCreate = !!capabilities.getIn(['container', 'create']);
    if (capabilities.isEmpty() || !canCreate) {
        return true;
    }

    // There is no default from the server
    // The prefered behaviour is then to have an existing container on both sides
    const paramExistingContainer = fromApp.getDefaultParamExistingContainer(state.app, props.containerSide);
    if (paramExistingContainer === undefined) {
        return true;
    }

    return paramExistingContainer === 'true';
};

export const getInitialContainerId = (state, {
    containerSide
}) => {
    const containerId = fromApp.getDefaultParamContainerId(state.app, containerSide);
    return containerId || getContainerFieldValue(state, {
        containerSide
    }, 'containerId');
};

export const getInitialWorkspaceId = (state, {
    containerSide
}) => {
    const workspaceId = fromApp.getDefaultParamWorkspaceId(state.app, containerSide);
    return workspaceId || getContainerFieldValue(state, {
        containerSide
    }, 'workspaceId');
};

export const getInitialNewContainerName = (state, {
    containerSide
}) => {
    const otherSide = containerSide === 'A' ? 'B' : 'A';
    const existingContainer = getContainerFieldValue(state, {
        containerSide
    }, 'existingContainer');
    if (existingContainer) {
        return undefined;
    }

    const existingContainerOtherSide = getContainerFieldValue(state, {
        containerSide: otherSide
    }, 'existingContainer');
    const providerIdA = getContainerFieldValue(state, {
        containerSide
    }, 'providerId');
    const providerIdB = getContainerFieldValue(state, {
        containerSide: otherSide
    }, 'providerId');
    const isSameProvider = providerIdA === providerIdB;

    // A NEW container will take the name of the EXISTING one on the other side.
    // If both have the same provider, a ' Sync' suffix will be added.
    if (existingContainerOtherSide) {
        const containerOtherSide = getContainer(state, {
            containerSide: otherSide
        });
        const defaultDisplayName = containerOtherSide.get('displayName', 'Unito');
        return isSameProvider ? `${defaultDisplayName} Sync` : defaultDisplayName;
    }

    // Both containers are NEW
    return 'Unito Sync';
};

export const getDefaultLinkName = (state) => {
    const isExistingA = getContainerFieldValue(state, {
        containerSide: 'A'
    }, 'existingContainer');
    const isExistingB = getContainerFieldValue(state, {
        containerSide: 'B'
    }, 'existingContainer');

    const displayNameA = isExistingA ?
        getContainer(state, {
            containerSide: 'A'
        }).get('displayName') :
        getContainerFieldValue(state, {
            containerSide: 'A'
        }, 'newContainerName');

    const displayNameB = isExistingB ?
        getContainer(state, {
            containerSide: 'B'
        }).get('displayName') :
        getContainerFieldValue(state, {
            containerSide: 'B'
        }, 'newContainerName');

    const readOnlyA = getContainerFieldValue(state, {
        containerSide: 'A'
    }, 'readOnly');
    const readOnlyB = getContainerFieldValue(state, {
        containerSide: 'B'
    }, 'readOnly');

    return formUtils.generateDefaultLinkName(displayNameA, displayNameB, readOnlyA, readOnlyB) || 'New Sync';
};

export const getDefaultParamProviderIdentityId = (state, side) => fromApp.getDefaultParamProviderIdentityId(state.app, side);

export const isSameProviderInstance = state => fromLinks.isSameProviderInstance(state.links);

export const isActionLoading = (state, actionName, index) =>
    fromLoaders.isLoading(state.loaders, actionName, index);

export const isLoadingContainers = (state, {
        containerSide,
        fieldIndex
    }) =>
    fromLoaders.isLoadingContainers(state.loaders, containerSide, fieldIndex);

export const isAppConfigLoading = state => fromLoaders.isAppConfigLoading(state.loaders);

export const getMultisyncDiscriminantId = (state, props) =>
    fromLinks.getMultisyncDiscriminantId(state.links, props.containerSide, props.fieldId);

export const getSortedMultisyncs = state => fromMultisyncs.getSortedMultisyncs(state.multisyncs);

export const getSortedSyncsWithoutMultisync = state => fromLinks.getSortedSyncsWithoutMultisync(state.links);

export const getSortedSyncsByMultisyncId = state => fromLinks.getSortedSyncsByMultisyncId(state.links);

export const getMultisyncDiscriminantBySide = (state, props) =>
    fromLinks.getMultisyncDiscriminantBySide(state.links, props.containerSide);

export const areAllSyncsAutoSync = (state, multisyncId) => fromLinks.areAllSyncsAutoSync(state.links, multisyncId);

export const areAllSyncsSyncing = (state, multisyncId) => fromLinks.areAllSyncsSyncing(state.links, multisyncId);

export const getTermForProviders = (state, providerIdA, providerIdB, term, plurality) =>
    fromProviders.getTermForProviders(state.providers, providerIdA, providerIdB, term, plurality);

export const getProviderByNamePreferredAuthMethod = (state, providerId) =>
    fromProviders.getByNamePreferredAuthMethod(state.providers, providerId);

export const getRecording = state => fromRecorder.getCurrent(state.recorder);

export const getTrackingSessionId = state => fromRecorder.getTrackingSessionId(state.recorder);

const appReducer = combineReducers({
    app,
    auth,
    billing,
    containers,
    flags,
    fields,
    form: formReducer.plugin(form),
    invites,
    links,
    loaders,
    multisyncs,
    notifications: notificationsReducer(),
    organizations,
    providers,
    providerIdentities,
    recorder,
});

const rootReducer = (state, action) => {
    if (action.type === authTypes.LOGOUT_USER_SUCCESS) {
        state = { // eslint-disable-line
            ...state,
            auth: undefined,
            billing: undefined,
            containers: undefined,
            flags: undefined,
            fields: undefined,
            invites: undefined,
            links: undefined,
            loaders: undefined,
            multisyncs: undefined,
            organizations: undefined,
            providerIdentities: undefined,
            recorder: undefined,
        };
    }
    return appReducer(state, action);
};

export default rootReducer;



// WEBPACK FOOTER //
// ./src/reducers/index.js