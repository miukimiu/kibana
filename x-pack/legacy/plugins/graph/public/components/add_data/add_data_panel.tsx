/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { useEffect, useState } from 'react';
import { EuiButtonEmpty, EuiButtonIcon, EuiListGroup, EuiPanel, EuiToolTip } from '@elastic/eui';
import { connect } from 'react-redux';
import { GraphState, metaDataSelector, selectedFieldsSelector } from '../../state_management';
import { SignificantSearchBar } from './significant_search_bar';
import { EditNodesPanel, NodeIcon } from '../edit_nodes_panel';
import { LegacyIcon } from '../legacy_icon';

function AddDataPanelComponent(props: any) {
  const workspace = props.clientWorkspace;

  const [significantVertices, setSignificantVertices] = useState<any[]>([]);
  const [query, setQuery] = useState<any>(undefined);

  async function loadInterestingNodes(workspace: any) {
    if (!workspace) return;
    const activeFields = props.fields.filter(field => field.hopSize > 0);
    if (activeFields.length == 0) return;
    const result = await workspace.getInterestingNodes(query, activeFields);
    setSignificantVertices(result.nodes);
  }
  const selectedNodesId = (props.selectedNodes || []).map(node => node.id).join(',');
  const activeFields = (props.fields || [])
    .filter(field => field.hopSize > 0)
    .map(field => field.name)
    .join(',');

  useEffect(() => {
    // reset query when user interacts with graph
    setQuery(undefined);
  }, [selectedNodesId]);

  useEffect(() => {
    loadInterestingNodes(workspace);
  }, [workspace, query, selectedNodesId, props.filter, activeFields]);

  if (!workspace || !props.fields || props.fields.length === 0) return null;
  if (props.mode === 'edit') {
    return <EditNodesPanel {...props} />;
  }
  return (
    <div className="gphAddData">
      <div className="gphAddData__header">Add Data</div>
      <>
        <EuiPanel>
          <h3>Significant vertices</h3>
          {(query || !props.selectedNodes || !props.selectedNodes.length > 0) && (
            <SignificantSearchBar
              {...props}
              onQuerySubmit={(query: any) => {
                setQuery(query);
              }}
            />
          )}
          {query ? (
            <p>
              Based on current search query{' '}
              <EuiButtonIcon
                iconType="trash"
                aria-label="remove"
                onClick={() => setQuery(undefined)}
              />
            </p>
          ) : props.selectedNodes && props.selectedNodes.length > 0 ? (
            <p>
              Based on current selection of {props.selectedNodes.length} vertices{' '}
              {props.selectedNodes.map(node => (
                <EuiToolTip position="top" content={`${node.data.field}: ${node.data.term}`}>
                  <NodeIcon node={node} />
                </EuiToolTip>
              ))}
              <EuiButtonIcon
                aria-label="remove"
                iconType="trash"
                onClick={() => {
                  workspace.selectNone();
                  props.notifyAngular();
                }}
              />
            </p>
          ) : (
            <p>Based on vertices in the workspace</p>
          )}
          <EuiListGroup
            flush
            style={{
              maxHeight: 500,
              overflowY: 'auto',
            }}
            listItems={significantVertices
              .filter(
                // filter out all vertices already added
                vertex =>
                  !workspace.nodes ||
                  !workspace.nodes.some(
                    (workspaceNode: any) =>
                      workspaceNode.data.term === vertex.term &&
                      workspaceNode.data.field === vertex.field
                  )
              )
              .map(vertex => ({
                label: `${vertex.field}: ${vertex.term}`,
                icon: <NodeIcon node={vertex} />,
                size: 's',
                onClick: async () => {
                  await workspace.addNodes([vertex]);
                  await loadInterestingNodes(workspace);
                },
              }))}
          />
          <EuiButtonEmpty
            onClick={async () => {
              await workspace.addNodes(significantVertices);
              await loadInterestingNodes(workspace);
            }}
          >
            Add all
          </EuiButtonEmpty>
        </EuiPanel>
        <EuiPanel>
          <h3>Vertices by field</h3>
        </EuiPanel>
      </>
    </div>
  );
}

export const AddDataPanel = connect(
  (state: GraphState) => {
    return {
      mode: metaDataSelector(state).mode,
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
)(AddDataPanelComponent);
