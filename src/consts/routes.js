export const BASE_API = 'api';

/**
 * Console Paths
 */
export const BASE_PATHS = {
    ADD_LINK: 'add',
    ADD_MULTISYNC: 'add',
    BILLING: 'billing',
    CONNECTORS: 'connectors',
    DASHBOARD: 'dashboard',
    SYNCS: 'syncs',
    EDIT_LINK: 'edit',
    EMBED: 'embed',
    LINKS: 'links',
    LOGIN: 'login',
    MULTISYNCS: 'multisyncs',
    ORGANIZATIONS: 'organizations',
    PEOPLE: 'people',
    SIGNUP: 'signup',
    STYLEGUIDE: 'styleguide',
    USES_CASES: 'use-cases',
    WELCOME: 'welcome',
};

export const METHODS = {
    GET: 'GET',
    PUT: 'PUT',
    PATCH: 'PATCH',
    POST: 'POST',
    DELETE: 'DELETE',
};

export const ABSOLUTE_PATHS = {
    ADD_LINK: `/${BASE_PATHS.DASHBOARD}/${BASE_PATHS.LINKS}/${BASE_PATHS.ADD_LINK}`,
    ADD_MULTISYNC: `/${BASE_PATHS.DASHBOARD}/${BASE_PATHS.MULTISYNCS}/${BASE_PATHS.ADD_MULTISYNC}`,
    BILLING: `/${BASE_PATHS.DASHBOARD}/${BASE_PATHS.ORGANIZATIONS}`,
    DASHBOARD: `/${BASE_PATHS.DASHBOARD}`,
    CONNECTORS: `/${BASE_PATHS.DASHBOARD}/${BASE_PATHS.CONNECTORS}`,
    EDIT_LINK: `/${BASE_PATHS.DASHBOARD}/${BASE_PATHS.LINKS}/${BASE_PATHS.EDIT_LINK}`,
    EDIT_MULTISYNC: `/${BASE_PATHS.DASHBOARD}/${BASE_PATHS.MULTISYNCS}/${BASE_PATHS.EDIT_LINK}`,
    LOGIN: `/${BASE_PATHS.LOGIN}`,
    ORGANIZATIONS: `/${BASE_PATHS.DASHBOARD}/${BASE_PATHS.ORGANIZATIONS}`,
    SIGNUP: `/${BASE_PATHS.SIGNUP}`,
    SYNCS: `/${BASE_PATHS.DASHBOARD}/${BASE_PATHS.SYNCS}`,
    USE_CASES: `/${BASE_PATHS.DASHBOARD}/${BASE_PATHS.USES_CASES}`,
    WELCOME: `/${BASE_PATHS.DASHBOARD}/${BASE_PATHS.WELCOME}`,
};

export const HELP_PATHS = {
    UNITO_HELP_URL: 'https://guide.unito.io/hc/en-us',
    CREATE_SYNC_ACCOUNT_URL: 'https://guide.unito.io/hc/en-us/articles/224412908',
    UNITO_GUIDE_TROUBLESHOOTING: 'https://guide.unito.io/hc/en-us/articles/224722668-Troubleshooting',
    UNITO_GUIDE_BEST_PRACTICES: 'https://guide.unito.io/hc/en-us/articles/224924928-Best-Practices',
    PRICING_PAGE_URL: 'https://unito.io/pricing',
    CANT_FIND_REPO: 'https://guide.unito.io/hc/en-us/articles/224722668-Troubleshooting#cantfindrepo',
    TRELLO_POWER_UP_GUIDE: 'https://info.trello.com/power-ups/unito',
    REVERT_MISTAKES_GUIDE: 'https://guide.unito.io/hc/en-us/articles/115003829653',
    FILTER_TASKS: 'https://guide.unito.io/hc/en-us/articles/224344287',
    WHAT_ARE_USERS: 'https://guide.unito.io/hc/en-us/articles/232055708',
    WHAT_ARE_MULTISYNCS: 'https://guide.unito.io/hc/en-us/articles/360007928453',
    GRANDFATHERING: 'https://guide.unito.io/hc/en-us/articles/360015174114',
};

export const IMAGE_PATHS = {
    UNITO_LOGO_COLOR: 'https://unito.io/img/logo-img-322x322-color.png',
};

const getCustomFieldsRoute = (providerIdentityId, containerId) =>
    `v1/fields/custom?providerIdentityId=${encodeURIComponent(providerIdentityId)}&containerId=${encodeURIComponent(containerId)}`;

const getFieldValuesRoute = (providerIdentityId, containerId, fieldId, kind, category = '', searchString = '') =>
    `v1/fieldValues?providerIdentityId=${encodeURIComponent(providerIdentityId)}&containerId=${encodeURIComponent(containerId)}&fieldId=${encodeURIComponent(fieldId)}&kind=${encodeURIComponent(kind)}&category=${encodeURIComponent(category)}${searchString ? `&search=${encodeURIComponent(searchString)}` : ''}`; // eslint-disable-line
const getFieldValueRoute = (providerIdentityId, containerId, fieldId, kind, fieldValueId) =>
    `v1/fieldValues/${encodeURIComponent(fieldValueId)}?providerIdentityId=${encodeURIComponent(providerIdentityId)}&containerId=${encodeURIComponent(containerId)}&fieldId=${encodeURIComponent(fieldId)}&kind=${encodeURIComponent(kind)}`; // eslint-disable-line

const getWorkflowsRoute = (providerIdentityId, containerId) =>
    `v1/fields/workflows?providerIdentityId=${encodeURIComponent(providerIdentityId)}&containerId=${encodeURIComponent(containerId)}`;

const getSubscriptionRoute = subscriptionId => `v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`;
const getCustomerRoute = customerId => `v1/billing/customers/${encodeURIComponent(customerId)}`;
const getCustomerInvoicesRoute = customerId => `v1/billing/customers/${encodeURIComponent(customerId)}/invoices`;
const getOrganizationRoute = organizationId => `v1/organizations/${organizationId}`;
const getCollaboratorsRoute = organizationId => `v1/organizations/${organizationId}/collaborators`;
const getOrganizationMembersRoute = organizationId => `v1/organizations/${organizationId}/members`;
const getOrganizationCoworkersRoute = organizationId => `v1/organizations/${organizationId}/coworkers`;
const getAddCouponRoute = customerId => `v1/billing/customers/${encodeURIComponent(customerId)}`;
const getOrganizationInvites = organizationId => `v1/invites?organizationId=${encodeURIComponent(organizationId)}`;
const getUserPendingInvites = userId => `v1/invites?userId=${encodeURIComponent(userId)}&state=pending`;
const getLinkUsersRoute = (linkId, side) => `v1/links/${linkId}/users?side=${side}`;
const getLinksStatesRoute = (linkIds) => {
    const encodedLinkIds = linkIds.map(linkId => encodeURIComponent(linkId));
    return `v1/links/states?linkIds=${encodedLinkIds.join(',')}`;
};

const getSearchLinksRoute = searchString => `v1/links?search=${encodeURIComponent(searchString)}`;
const getContainerLinksRoute = containerId =>
    `v1/links?containerId=${encodeURIComponent(containerId)}`;
const getSearchMultisyncsRoute = searchString => `v1/multisyncs?search=${encodeURIComponent(searchString)}`;
const getContainerMultisyncRoute = (containerId = '') =>
    `v1/multisyncs?containerId=${encodeURIComponent(containerId)}`;

/**
 * API Paths
 */
export const API_PATHS = {
    ADD_COUPON: getAddCouponRoute,
    AUTOMAP_FIELD_VALUES: 'v1/fields/automap',
    AUTOMAP_USERS: linkId => `v1/links/${encodeURIComponent(linkId)}/automap_users`,
    CANCEL_SUBSCRIPTION: getSubscriptionRoute,
    CREATE_CONTAINER: 'v1/containers',
    CREATE_FIELD_VALUE: 'v1/fieldValues',
    CREATE_INVITE: 'v1/invites',
    CREATE_SUBSCRIPTION: 'v1/billing/subscriptions',
    DELETE_LINK: linkId => `v1/links/${encodeURIComponent(linkId)}`,
    DIAGNOSE_LINK: linkId => `v1/links/${encodeURIComponent(linkId)}/diagnose`,
    DISABLE_MAINTENANCE: 'maintenance/unpause',
    DISCONNECT_PROVIDER_IDENTITY: providerIdentityId =>
        `v1/providerIdentities/${encodeURIComponent(providerIdentityId)}`,
    ENABLE_MAINTENANCE: 'maintenance/pause',
    GENERATE_FIELD_ASSOCIATIONS: 'v1/fields/generate_associations',
    GET_ALLOWED_PROVIDER_IDENTITIES: (providerIdentityId, containerId) =>
        `v1/containers/${encodeURIComponent(containerId)}/providerIdentityIds?providerIdentityId=${encodeURIComponent(
      providerIdentityId,
    )}`,
    GET_APP_CONFIG: 'v1/config',
    GET_COLLABORATORS: getCollaboratorsRoute,
    PATCH_COLLABORATOR: getCollaboratorsRoute,
    GET_CONTAINERS: (providerIdentityId, searchValue) => {
        const path = `v1/containers?providerIdentityId=${providerIdentityId}`;
        if (!searchValue) {
            return path;
        }
        return path.concat(`&search=${searchValue}`);
    },
    GET_CONTAINER: (providerIdentityId, containerId) =>
        `v1/containers/${encodeURIComponent(containerId)}?providerIdentityId=${providerIdentityId}`,
    GET_CONTAINER_PLUGINS: (providerIdentityId, containerId) =>
        `v1/containers/${encodeURIComponent(containerId)}/plugins?providerIdentityId=${providerIdentityId}`,
    GET_CUSTOMER: getCustomerRoute,
    GET_CUSTOMER_INVOICES: getCustomerInvoicesRoute,
    GET_CUSTOM_FIELDS: getCustomFieldsRoute,
    GET_FLAGS: (type = 'user') => `v1/flags?type=${type}`,
    GET_FIELD_VALUES: getFieldValuesRoute,
    GET_FIELD_VALUE: getFieldValueRoute,
    GET_LINK: linkId => `v1/links/${encodeURIComponent(linkId)}`,
    GET_LINKS: organizationId => `v1/links?organizationId=${encodeURIComponent(organizationId)}`,
    GET_LINKS_STATES: getLinksStatesRoute,
    GET_LINK_USERS: getLinkUsersRoute,
    GET_MULTISYNC: multisyncId => `v1/multisyncs/${encodeURIComponent(multisyncId)}`,
    GET_MULTISYNCS: organizationId => `v1/multisyncs?organizationId=${encodeURIComponent(organizationId)}`,
    GET_ORGANIZATIONS: 'v1/organizations',
    GET_ORGANIZATION_COWORKERS: getOrganizationCoworkersRoute,
    GET_ORGANIZATION_INVITES: getOrganizationInvites,
    GET_ORGANIZATION_MEMBERS: getOrganizationMembersRoute,
    GET_TASK_SYNC_TASK_COUNT: 'v1/links/count',
    GET_PLANS: (organizationId = '') => `v1/billing/plans?organizationId=${encodeURIComponent(organizationId)}`,
    GET_PRODUCTS: 'v1/billing/products',
    GET_USER_PENDING_INVITES: getUserPendingInvites,
    GET_WORKFLOWS: getWorkflowsRoute,
    GET_WORKSPACES: providerIdentityId => `v1/workspaces?providerIdentityId=${encodeURIComponent(providerIdentityId)}`,
    IS_MAINTENANCE_ENABLED: 'maintenance/ismaintenance',
    LINKS: 'v1/links',
    LOGOUT: 'v1/logout',
    MULTISYNCS: 'v1/multisyncs',
    DELETE_MULTISYNC: multisyncId => `v1/multisyncs/${encodeURIComponent(multisyncId)}`,
    PROVIDERS: 'v1/providers',
    PROVIDER_IDENTITIES: 'v1/providerIdentities',
    PROVIDER_IDENTITY_VALIDATED: providerIdentityId => `v1/providerIdentities/${providerIdentityId}/validated`,
    REHYDRATE: 'auth/rehydrate',
    REVIEW_LINK: 'v1/links/review',
    SAVE_LINK: linkId => `v1/links/${encodeURIComponent(linkId)}`,
    SAVE_MULTISYNC: multisyncId => `v1/multisyncs/${encodeURIComponent(multisyncId)}`,
    SEARCH_LINKS: getSearchLinksRoute,
    SEARCH_MULTISYNCS: getSearchMultisyncsRoute,
    SYNC_LINK: linkId => `v1/links/${encodeURIComponent(linkId)}/sync`,
    CONTAINER_LINKS: getContainerLinksRoute,
    CONTAINER_MULTISYNCS: getContainerMultisyncRoute,
    AUTHENTICATE: 'v1/authenticate',
    TEST_CONNECTION: providerName => `v1/authenticate/${providerName}/test_connection`,
    VALIDATE_DOMAIN: providerName => `v1/authenticate/${providerName}/validate_domain`,
    UPDATE_INVITE: inviteId => `v1/invites/${encodeURIComponent(inviteId)}`,
    UPDATE_ORGANIZATION: getOrganizationRoute,
    UPDATE_SUBSCRIPTION: getSubscriptionRoute,
};



// WEBPACK FOOTER //
// ./src/consts/routes.js