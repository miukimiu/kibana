/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { ReactNode } from 'react';
import {
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiText,
  EuiLink,
  EuiCallOut,
  EuiScreenReaderOnly,
  EuiTitle,
  EuiSpacer,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import classNames from 'classnames';
import { FormattedMessage } from '@kbn/i18n/react';
import { connect } from 'react-redux';
import { IDataPluginServices } from 'src/plugins/data/public';
import {
  GraphState,
  hasDatasourceSelector,
  hasFieldsSelector,
  requestDatasource,
  fillWorkspace,
} from '../../state_management';
import { IndexPatternSavedObject } from '../../types';
import { openSourceModal } from '../../services/source_modal';

import { useKibana } from '../../../../../../../src/plugins/kibana_react/public';

import { GuidancePanelIllustration } from './guidance_panel_illustration';

export interface GuidancePanelProps {
  onFillWorkspace: () => void;
  onOpenFieldPicker: () => void;
  hasDatasource: boolean;
  hasFields: boolean;
  onIndexPatternSelected: (indexPattern: IndexPatternSavedObject) => void;
  noIndexPatterns: boolean;
}

function ListItem({
  step,
  children,
  state,
}: {
  step: number;
  state: 'done' | 'active' | 'disabled';
  children: ReactNode;
}) {
  return (
    <li
      className={classNames('gphGuidancePanel__item', {
        'gphGuidancePanel__item--disabled': state === 'disabled',
      })}
      aria-disabled={state === 'disabled'}
      aria-current={state === 'active' ? 'step' : undefined}
    >
      {state !== 'disabled' && state === 'active' && (
        <span
          className="gphGuidancePanel__itemIcon gphGuidancePanel__itemIcon--active"
          aria-hidden={true}
        >
          {step}
        </span>
      )}
      {state !== 'disabled' && state === 'done' && (
        <span
          className="gphGuidancePanel__itemIcon gphGuidancePanel__itemIcon--active"
          aria-hidden={true}
        >
          <EuiIcon type="check" />
        </span>
      )}
      {state === 'disabled' && (
        <span
          className="gphGuidancePanel__itemIcon gphGuidancePanel__itemIcon--isInactive"
          aria-hidden={true}
        >
          {step}
        </span>
      )}
      <EuiText className="gphGuidancePanel__itemText">{children}</EuiText>
    </li>
  );
}

function GuidancePanelComponent(props: GuidancePanelProps) {
  const {
    onFillWorkspace,
    onOpenFieldPicker,
    onIndexPatternSelected,
    hasDatasource,
    hasFields,
    noIndexPatterns,
  } = props;

  const kibana = useKibana<IDataPluginServices>();
  const { services, overlays } = kibana;
  const { savedObjects, uiSettings, chrome, application } = services;
  if (!overlays || !chrome || !application) return null;

  const onOpenDatasourcePicker = () => {
    openSourceModal({ overlays, savedObjects, uiSettings }, onIndexPatternSelected);
  };

  let content = (
    <EuiPanel data-test-subj="gphGuidancePanel" paddingSize="none">
      <div className="gphGuidancePanel__mainSection">
        <EuiFlexGroup direction="row" alignItems="center" gutterSize="l">
          <EuiFlexItem className="gphGuidancePanel__mainContent">
            <EuiTitle size="s">
              <h2 id="graphHeading">
                {i18n.translate('xpack.graph.guidancePanel.title', {
                  defaultMessage: 'Three steps to your graph',
                })}
              </h2>
            </EuiTitle>
            <EuiSpacer size="l" />
            <ol className="gphGuidancePanel__list" aria-labelledby="graphHeading">
              <ListItem state={hasDatasource ? 'done' : 'active'} step={1}>
                <EuiLink onClick={onOpenDatasourcePicker}>
                  {i18n.translate(
                    'xpack.graph.guidancePanel.datasourceItem.indexPatternButtonLabel',
                    {
                      defaultMessage: 'Select a data source.',
                    }
                  )}
                </EuiLink>
              </ListItem>
              <ListItem state={hasFields ? 'done' : hasDatasource ? 'active' : 'disabled'} step={2}>
                <EuiLink onClick={onOpenFieldPicker} disabled={!hasFields && !hasDatasource}>
                  {i18n.translate('xpack.graph.guidancePanel.fieldsItem.fieldsButtonLabel', {
                    defaultMessage: 'Add fields.',
                  })}
                </EuiLink>
              </ListItem>
              <ListItem state={hasFields ? 'active' : 'disabled'} step={3}>
                <FormattedMessage
                  id="xpack.graph.guidancePanel.nodesItem.description"
                  defaultMessage="Add vertices from the right panel to start exploring or {topTerms}."
                  values={{
                    topTerms: (
                      <EuiLink onClick={onFillWorkspace} disabled={!hasFields}>
                        {i18n.translate('xpack.graph.guidancePanel.nodesItem.topTermsButtonLabel', {
                          defaultMessage: 'graph the top terms',
                        })}
                      </EuiLink>
                    ),
                  }}
                />
              </ListItem>
            </ol>
          </EuiFlexItem>
          <EuiFlexItem grow={false} className="gphGuidancePanel__illustration">
            <GuidancePanelIllustration />
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>

      <div className="gphGuidancePanel__moreSection">
        <EuiFlexGroup direction="row" className="gphGuidancePanel__moreSection">
          <EuiFlexItem>
            <EuiTitle size="xs">
              <h2>Want to learn more?</h2>
            </EuiTitle>
            <ul className="gphGuidancePanel__moreSection__list">
              <li>
                <EuiIcon type="videoPlayer" />
                <span>Watch video</span>
              </li>
              <li>
                <EuiIcon type="training" />
                <span>Read documentation</span>
              </li>
            </ul>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    </EuiPanel>
  );

  if (noIndexPatterns) {
    const managementUrl = chrome.navLinks.get('kibana:stack_management')!.url;
    const indexPatternUrl = `${managementUrl}/kibana/index_patterns`;
    const sampleDataUrl = `${application.getUrlForApp(
      'kibana'
    )}#/home/tutorial_directory/sampleData`;
    content = (
      <EuiPanel paddingSize="none">
        <EuiCallOut
          color="warning"
          iconType="help"
          title={i18n.translate('xpack.graph.noDataSourceNotificationMessageTitle', {
            defaultMessage: 'No data source',
          })}
          heading="h1"
        >
          <EuiScreenReaderOnly>
            <p id="graphHeading">
              {i18n.translate('xpack.graph.noDataSourceNotificationMessageTitle', {
                defaultMessage: 'No data source',
              })}
            </p>
          </EuiScreenReaderOnly>
          <p>
            <FormattedMessage
              id="xpack.graph.noDataSourceNotificationMessageText"
              defaultMessage="No data sources found. Go to {managementIndexPatternsLink} and create an index pattern for your Elasticsearch indices."
              values={{
                managementIndexPatternsLink: (
                  <a href={indexPatternUrl}>
                    <FormattedMessage
                      id="xpack.graph.noDataSourceNotificationMessageText.managementIndexPatternLinkText"
                      defaultMessage="Management &gt; Index Patterns"
                    />
                  </a>
                ),
              }}
            />
          </p>
          <p>
            <FormattedMessage
              id="xpack.graph.listing.noDataSource.newToKibanaDescription"
              defaultMessage="New to Kibana? You can also use our {sampleDataInstallLink}."
              values={{
                sampleDataInstallLink: (
                  <EuiLink href={sampleDataUrl}>
                    <FormattedMessage
                      id="xpack.graph.listing.noDataSource.sampleDataInstallLinkText"
                      defaultMessage="sample data"
                    />
                  </EuiLink>
                ),
              }}
            />
          </p>
        </EuiCallOut>
      </EuiPanel>
    );
  }

  return <div className="gphGuidancePanel">{content}</div>;
}

export const GuidancePanel = connect(
  (state: GraphState) => {
    return {
      hasDatasource: hasDatasourceSelector(state),
      hasFields: hasFieldsSelector(state),
    };
  },
  dispatch => ({
    onIndexPatternSelected: (indexPattern: IndexPatternSavedObject) => {
      dispatch(
        requestDatasource({
          type: 'indexpattern',
          id: indexPattern.id,
          title: indexPattern.attributes.title,
        })
      );
    },
    onFillWorkspace: () => {
      dispatch(fillWorkspace());
    },
  })
)(GuidancePanelComponent);
