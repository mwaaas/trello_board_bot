import styled from 'styled-components';

import {
    color,
    fontSize,
    fontWeight
} from '../../theme';
import {
    fieldTypes,
    multisyncTypes,
    linkTypes
} from '../../consts';


export const Content = styled.div `
  background: white;
  min-height: calc(100vh - 66px);
  padding: 4em 6em;

  .multisync-container__navigation {
    margin-bottom: 4rem;
  }

  .h1 {
    margin-bottom: 5rem;
  }

  section {
    margin-bottom: 4rem;
  }
`;

export const RelativeCard = styled.div `
  position: relative;
`;

export const ContainerDisplayWrapper = styled.div `
  display: inline-block;
  font-weight: ${fontWeight.medium};
  margin-bottom: .4rem;
  margin-left: .4rem;
  margin-right: .4rem;
  vertical-align: middle;
`;

export const Items = styled.div `
  position: relative;
  display: flex;
  align-items: center;
  min-height: 60px;
  background-color: ${props => (props.isDisabled ? color.dark.whisper : color.light.primary)};
  border: 1px solid ${color.dark.whisper};
  border-radius: 4px;
  margin-bottom: 16px;
  padding: 6px 12px;
`;

export const FieldWrapper = styled.div `
  display: inline-block;
  vertical-align: middle;
  margin-right: .2rem;
  margin-left: .2rem;
  width: 420px;

  .form-group {
    margin-bottom: 0;
  }
`;

export const TextWrapper = styled.div `
  font-size: ${fontSize.subheading};
  font-weight: ${fontWeight.regular};
  margin-bottom: ${props => props.marginBottom || '0.5rem'};
`;

export const buildMultisyncSyncsPayload = (formData, sync, syncName, associations, multisyncId) => {
    const {
        fieldId,
        kind
    } = formData.root.filter;
    const rootSide = formData.topology === multisyncTypes.TOPOLOGIES.SPLIT ? 'A' : 'B';
    const {
        containerId,
        syncDirection,
        isAutoSync,
        applyIncomingTag,
        fieldValueId: fieldValue,
    } = sync;

    // if the sync Direction is one way then change the targets for all the field associations
    let multisyncAssociations = associations;
    if (syncDirection === multisyncTypes.SYNC_DIRECTION.ONE_WAY) {
        multisyncAssociations = associations.map((association) => {
            if (association.get('target') === fieldTypes.TARGET.BOTH) {
                return association.set('target', 'B'); // multi-syncs are always one way sync to B
            }
            return association;
        });
    }

    const payload = {
        A: {
            containerId: rootSide === 'A' ? formData.root.containerId : containerId,
            existingContainer: true,
            providerIdentityId: rootSide === 'A' ? formData.root.providerIdentityId : formData.leaves.providerIdentityId,
            settings: {
                filters: {},
                includeClosedTasks: false,
                readOnly: syncDirection === multisyncTypes.SYNC_DIRECTION.ONE_WAY,
            },
        },
        B: {
            containerId: rootSide === 'A' ? containerId : formData.root.containerId,
            existingContainer: true,
            providerIdentityId: rootSide === 'A' ? formData.leaves.providerIdentityId : formData.root.providerIdentityId,
            settings: {
                filters: {},
                applyIncomingTag,
                includeClosedTasks: false,
                readOnly: false,
            },
        },
        organizationId: formData.organizationId,
        associations: multisyncAssociations.toJS(),
        name: syncName,
        isMultiSync: true,
        isAutoSync: !!isAutoSync,
        multisyncId,
        kind: linkTypes.KIND.MULTI_SYNC,
        source: linkTypes.SOURCE.CONSOLE,
    };

    payload[rootSide].settings.filters = {
        [fieldId]: {
            kind,
            multisyncDiscriminant: fieldValue.id || fieldValue
        },
    };

    return payload;
};

export { default as CreateMultisync } from './CreateMultisync';
export { default as EditMultisync } from './EditMultisync';
export { default as ChooseProjects } from './ChooseProjects';
export { default as ChooseProjectsSteps } from './ChooseProjectsSteps';
export { default as GeneralMapping } from './GeneralMapping';
export { default as MapFields } from './MapFields';
export { default as MultisyncFieldAssociationList } from './MultisyncFieldAssociationList';
export { default as Review } from './Review';
export { default as SyncMapping } from './SyncMapping';
export { default as MultisyncContainersSync } from './MultisyncContainersSync';



// WEBPACK FOOTER //
// ./src/containers/Multisync/index.js