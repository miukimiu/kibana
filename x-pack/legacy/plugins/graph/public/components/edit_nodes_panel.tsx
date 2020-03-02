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
  EuiTitle,
  EuiSpacer,
  EuiFormRow,
  EuiIcon,
} from '@elastic/eui';
import { connect } from 'react-redux';
import { isColorDark, hexToRgb } from '@elastic/eui';
import { GraphState, selectedFieldsSelector, updateMetaData } from '../state_management';
import { LegacyIcon } from './legacy_icon';
import { iconChoices } from '../helpers/style_choices';

export function NodeIcon({ node }: any) {
  return (
    <span
      className="gphAddData__circleIcon"
      style={{
        backgroundColor: node.color,
      }}
    >
      <LegacyIcon
        icon={node.icon}
        asListIcon
        color={isColorDark(...hexToRgb(node.color)) ? 'white' : 'black'}
      />
    </span>
  );
}

function EditNodesPanelComponent(props: any) {
  const workspace = props.clientWorkspace;

  const [refresher, setRefresher] = useState(0);

  return (
    <EuiFlexGroup direction="column" gutterSize="none">
      <div className="gphGraphSidebar__header">
        <EuiTitle size="xs" className="gphGraphSidebar__title">
          <h2>Edit Selection</h2>
        </EuiTitle>
        <EuiButtonIcon
          className="gphGraphSidebar__toggleIcon"
          iconType="menuRight"
          color="text"
          onClick={() => {
            props.dataMode();
          }}
        />
      </div>
      <div className="gphGraphSidebar__body">
        <div className="gphGraphSidebar__bodyOverflow">
          {workspace && (
            <EuiFlexGroup direction="column" gutterSize="s">
              <EuiFlexItem>
                <EuiPanel>
                  <EuiTitle size="xs">
                    <h4>Selected vertices</h4>
                  </EuiTitle>

                  <EuiSpacer size="s" />

                  {workspace &&
                    workspace.selectedNodes &&
                    workspace.selectedNodes.length > 0 &&
                    workspace.selectedNodes.map(node => (
                      <EuiFormRow display="rowCompressed" className="gphAddData__editNodeName">
                        <EuiFieldText
                          compressed
                          fullWidth
                          value={node.label}
                          onChange={e => {
                            node.label = e.target.value;
                            // super dirty hack to refresh component with only change in mutable data structure
                            setRefresher(refresher + 1);
                            props.notifyAngular();
                          }}
                          prepend={
                            <div className="gphAddData__prependIcon">
                              <NodeIcon node={node} />
                            </div>
                          }
                        />
                      </EuiFormRow>
                    ))}
                </EuiPanel>
              </EuiFlexItem>

              <EuiFlexItem>
                <EuiPanel>
                  <EuiTitle size="xs">
                    <h4>Styles</h4>
                  </EuiTitle>

                  <EuiSpacer size="s" />

                  {workspace && workspace.selectedNodes && workspace.selectedNodes.length > 0 && (
                    <>
                      <EuiFormRow display="columnCompressed" label="Color">
                        <EuiColorPicker
                          compressed
                          color={workspace.selectedNodes[0].color}
                          onChange={newColor => {
                            workspace.selectedNodes.forEach(node => {
                              node.color = newColor;
                            });

                            setRefresher(refresher + 1);
                            props.notifyAngular();
                          }}
                        />
                      </EuiFormRow>

                      <EuiFormRow display="columnCompressed" label="Icon">
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
                      </EuiFormRow>
                    </>
                  )}
                </EuiPanel>
              </EuiFlexItem>
            </EuiFlexGroup>
          )}
        </div>
      </div>
    </EuiFlexGroup>
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
    dataMode: () => {
      dispatch(updateMetaData({ mode: 'data' }));
    },
    editMode: () => {
      dispatch(updateMetaData({ mode: 'edit' }));
    },
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
