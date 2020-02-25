/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { useEffect, useState } from 'react';
import {
  EuiButtonIcon,
  EuiColorPicker,
  EuiComboBox,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHighlight,
  EuiPanel,
} from '@elastic/eui';
import { connect } from 'react-redux';
import { GraphState, selectedFieldsSelector } from '../state_management';
import { LegacyIcon } from './legacy_icon';
import { iconChoices } from '../helpers/style_choices';

export function NodeIcon({ node }: any) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 20,
        height: 20,
        backgroundColor: node.color,
        borderRadius: 999,
        padding: 3,
      }}
    >
      <LegacyIcon icon={node.icon} asListIcon />
    </span>
  );
}

function EditNodesPanelComponent(props: any) {
  const workspace = props.clientWorkspace;

  const [refresher, setRefresher] = useState(0);

  return (
    <div className="gphAddData">
      <div className="gphAddData__header">
        Edit selection
        <EuiButtonIcon iconType="cross" aria-label="Exit edit mode" />
      </div>
      {workspace && (
        <>
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
              <EuiPanel>
                <h3>Selected vertices</h3>
                <EuiFlexGroup direction="column" gutterSize="s">
                  {workspace &&
                    workspace.selectedNodes &&
                    workspace.selectedNodes.length > 0 &&
                    workspace.selectedNodes.map(node => (
                      <EuiFlexItem>
                        <EuiFlexGroup gutterSize="xs" alignItems="center">
                          <EuiFlexItem grow={false}>
                            <NodeIcon node={node} />
                          </EuiFlexItem>
                          <EuiFlexItem>
                            <EuiFieldText
                              value={node.label}
                              onChange={e => {
                                node.label = e.target.value;
                                // super dirty hack to refresh component with only change in mutable data structure
                                setRefresher(refresher + 1);
                                props.notifyAngular();
                              }}
                            />
                          </EuiFlexItem>
                        </EuiFlexGroup>
                      </EuiFlexItem>
                    ))}
                </EuiFlexGroup>
              </EuiPanel>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiPanel>
                <h3>Styles</h3>
                {workspace && workspace.selectedNodes && workspace.selectedNodes.length > 0 && (
                    <EuiFlexGroup direction="column" gutterSize="s">
                    <EuiFlexItem>
                      <EuiColorPicker
                        color={workspace.selectedNodes[0].color}
                        onChange={newColor => {
                          workspace.selectedNodes.forEach(node => {
                            node.color = newColor;
                          });

                          setRefresher(refresher + 1);
                          props.notifyAngular();
                        }}
                      />
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <EuiComboBox
                        fullWidth
                        singleSelection={{ asPlainText: true }}
                        isClearable={false}
                        renderOption={(option, searchValue, contentClassName) => {
                          const { label, value } = option;
                          return (
                            <span className={contentClassName}>
                              <LegacyIcon icon={value!} />{' '}
                              <EuiHighlight search={searchValue}>{label}</EuiHighlight>
                            </span>
                          );
                        }}
                        options={iconChoices.map(currentIcon => ({
                          label: currentIcon.label,
                          value: currentIcon,
                        }))}
                        selectedOptions={[
                          {
                            label: workspace.selectedNodes[0].icon.label,
                            value: workspace.selectedNodes[0].icon,
                          },
                        ]}
                        onChange={choices => {
                          workspace.selectedNodes.forEach(node => {
                            node.icon = choices[0].value!;
                          });

                          setRefresher(refresher + 1);
                          props.notifyAngular();
                        }}
                        compressed
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                )}
              </EuiPanel>
            </EuiFlexItem>
          </EuiFlexGroup>
        </>
      )}
    </div>
  );
}

export const EditNodesPanel = connect(
  (state: GraphState) => {
    return {
      fields: selectedFieldsSelector(state),
      // hasDatasource: hasDatasourceSelector(state),
      // hasFields: hasFieldsSelector(state),
    };
  },
  dispatch => ({
    // onIndexPatternSelected: (indexPattern: IndexPatternSavedObject) => {
    //   dispatch(
    //     requestDatasource({
    //       type: 'indexpattern',
    //       id: indexPattern.id,
    //       title: indexPattern.attributes.title,
    //     })
    //   );
    // },
    // onFillWorkspace: () => {
    //   dispatch(fillWorkspace());
    // },
  })
)(EditNodesPanelComponent);
