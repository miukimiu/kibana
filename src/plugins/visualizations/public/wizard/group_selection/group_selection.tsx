/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { FormattedMessage } from '@kbn/i18n/react';
import React from 'react';
import { orderBy } from 'lodash';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiCard,
  EuiIcon,
  EuiModalHeader,
  EuiModalBody,
  EuiModalHeaderTitle,
  EuiLink,
  EuiText,
  EuiSpacer,
  EuiBetaBadge,
  EuiTitle,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { DocLinksStart } from '../../../../../core/public';
import { VisTypeAlias } from '../../vis_types/vis_type_alias_registry';
import { VisType, TypesStart, VisGroups } from '../../vis_types';

interface GroupSelectionProps {
  onVisTypeSelected: (visType: VisType | VisTypeAlias) => void;
  visTypesRegistry: TypesStart;
  docLinks: DocLinksStart;
  toggleGroups: (flag: boolean) => void;
  showExperimental: boolean;
}

interface VisCardProps {
  onVisTypeSelected: (visType: VisType | VisTypeAlias) => void;
  visType: VisType | VisTypeAlias;
  showExperimental?: boolean | undefined;
}

function isVisTypeAlias(type: VisType | VisTypeAlias): type is VisTypeAlias {
  return 'aliasPath' in type;
}

function GroupSelection(props: GroupSelectionProps) {
  const visualizeGuideLink = props.docLinks.links.dashboard.guide;
  const promotedVisGroups = orderBy(
    [
      ...props.visTypesRegistry.getAliases(),
      ...props.visTypesRegistry.getByGroup(VisGroups.PROMOTED),
    ],
    ['promotion', 'title'],
    ['asc', 'asc']
  );
  return (
    <>
      <EuiModalHeader>
        <EuiModalHeaderTitle data-test-subj="groupModalHeader">
          <FormattedMessage
            id="visualizations.newVisWizard.title"
            defaultMessage="New Visualization"
          />
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiSpacer size="s" />
        <EuiFlexGroup
          gutterSize="l"
          wrap
          justifyContent="center"
          responsive={false}
          data-test-subj="visNewDialogGroups"
        >
          {promotedVisGroups.map((visType) => (
            <VisGroup
              visType={visType}
              key={visType.name}
              onVisTypeSelected={props.onVisTypeSelected}
            />
          ))}
        </EuiFlexGroup>
        <EuiSpacer size="xl" />
        <EuiSpacer size="xl" />
        <EuiFlexGroup gutterSize="l" wrap justifyContent="center" responsive={false}>
          {props.visTypesRegistry.getByGroup(VisGroups.AGGBASED).length > 0 && (
            <EuiFlexItem grow={false}>
              <EuiCard
                titleSize="xs"
                layout="horizontal"
                title={
                  <span data-test-subj="visGroupAggBasedTitle">
                    {i18n.translate('visualizations.newVisWizard.aggBasedGroupTitle', {
                      defaultMessage: 'Aggregation Based',
                    })}
                  </span>
                }
                data-test-subj="visGroup-aggbased"
                aria-describedby="visGroup-aggbased"
                description={i18n.translate(
                  'visualizations.newVisWizard.aggBasedGroupDescription',
                  {
                    defaultMessage:
                      'A set of frequently used visualizations that allows you to plot aggregated data to find trends, spikes and dips you need to know about',
                  }
                )}
                icon={<EuiIcon type="heatmap" size="xl" color="secondary" />}
                className="visNewVisDialog__groupsCard"
              >
                <EuiLink
                  data-test-subj="visGroupAggBasedExploreLink"
                  onClick={() => props.toggleGroups(false)}
                >
                  <EuiText size="s">
                    {i18n.translate('visualizations.newVisWizard.exploreOptionLinkText', {
                      defaultMessage: 'Explore Options',
                    })}{' '}
                    <EuiIcon type="sortRight" />
                  </EuiText>
                </EuiLink>
              </EuiCard>
            </EuiFlexItem>
          )}
          {props.visTypesRegistry.getByGroup(VisGroups.TOOLS).length > 0 && (
            <EuiFlexItem grow={false} className="visNewVisDialog__toolsCard">
              <EuiSpacer size="m" />
              <EuiTitle size="xs">
                <span data-test-subj="visGroup-tools">
                  {i18n.translate('visualizations.newVisWizard.toolsGroupTitle', {
                    defaultMessage: 'Tools',
                  })}
                </span>
              </EuiTitle>
              {props.visTypesRegistry.getByGroup(VisGroups.TOOLS).map((visType) => (
                <ToolsGroup
                  visType={visType}
                  key={visType.name}
                  onVisTypeSelected={props.onVisTypeSelected}
                  showExperimental={props.showExperimental}
                />
              ))}
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
        <EuiSpacer size="m" />
        <EuiFlexGroup gutterSize="s" alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiText>
              {i18n.translate('visualizations.newVisWizard.learnMoreText', {
                defaultMessage: 'Want to learn more?',
              })}{' '}
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiLink href={visualizeGuideLink} target="_blank" external>
              {i18n.translate('visualizations.newVisWizard.readDocumentationLink', {
                defaultMessage: 'Read documentation',
              })}
            </EuiLink>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiModalBody>
    </>
  );
}

const VisGroup = ({ visType, onVisTypeSelected }: VisCardProps) => {
  const onClick = () => onVisTypeSelected(visType);
  return (
    <EuiFlexItem grow={false}>
      <EuiCard
        titleSize="xs"
        title={<span data-test-subj="visTypeTitle">{visType.title}</span>}
        onClick={onClick}
        isDisabled={isVisTypeAlias(visType) && visType.disabled}
        betaBadgeLabel={
          isVisTypeAlias(visType) && visType.disabled
            ? i18n.translate('visualizations.newVisWizard.basicTitle', {
                defaultMessage: 'Basic',
              })
            : undefined
        }
        betaBadgeTooltipContent={
          isVisTypeAlias(visType) && visType.disabled
            ? i18n.translate('visualizations.newVisWizard.basicLicenseRequired', {
                defaultMessage: 'This feature requires a Basic License',
              })
            : undefined
        }
        data-test-subj={`visType-${visType.name}`}
        data-vis-stage={!('aliasPath' in visType) ? visType.stage : 'alias'}
        aria-describedby={`visTypeDescription-${visType.name}`}
        description={visType.description || ''}
        layout="horizontal"
        icon={<EuiIcon type={visType.icon || 'empty'} size="xl" color="secondary" />}
        className="visNewVisDialog__groupsCard"
      />
    </EuiFlexItem>
  );
};

const ToolsGroup = ({ visType, onVisTypeSelected, showExperimental }: VisCardProps) => {
  // hide the experimental visualization if lab mode is not enabled
  if (!showExperimental && visType.stage === 'experimental') {
    return null;
  }
  const onClick = () => onVisTypeSelected(visType);
  return (
    <EuiFlexGroup alignItems="center" gutterSize="m" responsive={false}>
      <EuiFlexItem grow={false}>
        <EuiIcon type={visType.icon || 'empty'} size="l" />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFlexGroup gutterSize="xs" alignItems="center" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiLink data-test-subj={`visType-${visType.name}`} onClick={onClick}>
              {visType.title}
            </EuiLink>
          </EuiFlexItem>
          {visType.stage === 'experimental' && (
            <EuiFlexItem grow={false}>
              <EuiBetaBadge
                iconType="beaker"
                tooltipContent={i18n.translate('visualizations.newVisWizard.experimentalTooltip', {
                  defaultMessage:
                    'This visualization might be changed or removed in a future release and is not subject to the support SLA.',
                })}
                label={i18n.translate('visualizations.newVisWizard.experimentalTitle', {
                  defaultMessage: 'Experimental',
                })}
              />
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
        <EuiText color="subdued" size="s">
          {visType.description}
        </EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export { GroupSelection };
