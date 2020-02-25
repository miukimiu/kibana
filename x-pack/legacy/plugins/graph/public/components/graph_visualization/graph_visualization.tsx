/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { connect, Provider } from 'react-redux';
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import d3, { ZoomEvent } from 'd3';
import {
  isColorDark,
  hexToRgb,
  EuiPopover,
  EuiButtonIcon,
  EuiRange,
  EuiFormRow,
  EuiListGroup,
  EuiIcon,
} from '@elastic/eui';
import { WorkspaceNode, WorkspaceEdge, WorkspaceField, UrlTemplate } from '../../types';
import { makeNodeId } from '../../services/persistence';
import {
  GraphState,
  metaDataSelector,
  selectedFieldsSelector,
  templatesSelector,
  updateMetaData,
} from '../../state_management';
import { KibanaContextProvider } from '../../../../../../../src/plugins/kibana_react/public/context';
import { urlTemplateRegex } from '../../helpers/url_template';
import { LegacyIcon } from '../legacy_icon';

/*
 * The layouting algorithm sets a few extra properties on
 * node objects to handle grouping. This will be moved to
 * a separate data structure when the layouting is migrated
 */

export interface GroupAwareWorkspaceNode extends WorkspaceNode {
  kx: number;
  ky: number;
  numChildren: number;
}

export interface GroupAwareWorkspaceEdge extends WorkspaceEdge {
  topTarget: GroupAwareWorkspaceNode;
  topSrc: GroupAwareWorkspaceNode;
}

export interface GraphVisualizationProps {
  nodes?: GroupAwareWorkspaceNode[];
  edges?: GroupAwareWorkspaceEdge[];
  edgeClick: (edge: GroupAwareWorkspaceEdge) => void;
  nodeClick: (node: GroupAwareWorkspaceNode, e: React.MouseEvent<Element, MouseEvent>) => void;
  maxDocCount: number;
  clientWorkspace: any;
  notifyAngular: () => void;
  fields: WorkspaceField[];
  urlTemplates: UrlTemplate[];
  mode: string;
  dataMode: () => void;
  editMode: () => void;
}

function registerZooming(element: SVGSVGElement) {
  const blockScroll = function() {
    (d3.event as Event).preventDefault();
  };
  d3.select(element)
    .on('mousewheel', blockScroll)
    .on('DOMMouseScroll', blockScroll)
    .call(
      d3.behavior.zoom().on('zoom', () => {
        const event = d3.event as ZoomEvent;
        d3.select(element)
          .select('g')
          .attr('transform', 'translate(' + event.translate + ')' + 'scale(' + event.scale + ')')
          .attr('style', 'stroke-width: ' + 1 / event.scale);
      })
    );
}

const updateLayout = debounce((clientWorkspace: any, count: any) => {
  clientWorkspace.minShownDocCount = count;
  clientWorkspace.mergeGraph({ edges: [] });
}, 300);

function GraphVisualizationComponent({
  nodes,
  edges,
  edgeClick,
  nodeClick,
  maxDocCount,
  clientWorkspace,
  fields,
  urlTemplates,
}: GraphVisualizationProps) {
  const svgRoot = useRef<SVGSVGElement | null>(null);
  const [open, setOpen] = useState(false);
  const [popoverForceClosed, setForceClosedPopover] = useState(false);
  const [minDocCount, setMinDocCount] = useState(0);
  const [showDrilldown, setShowDrilldown] = useState(false);

  const selectedFieldIds = useMemo(() => {
    const ids = new Set<string>();
    fields.forEach(field => {
      if (field.hopSize > 0) {
        ids.add(field.name);
      }
    });
    return ids;
  }, [fields]);

  const selectedNodesId = (clientWorkspace && clientWorkspace.selectedNodes
    ? clientWorkspace.selectedNodes
    : []
  )
    .map(node => node.id)
    .join(',');

  useEffect(() => {
    // reset query when user interacts with graph
    setForceClosedPopover(false);
  }, [selectedNodesId]);

  function getTopMostSelectedVertex() {
    let maxVertex: any = undefined;
    if (
      clientWorkspace &&
      clientWorkspace.selectedNodes &&
      clientWorkspace.selectedNodes.length > 0
    ) {
      clientWorkspace.selectedNodes.forEach((node: any) => {
        if (!maxVertex || node.y < maxVertex.y) {
          maxVertex = node;
        }
      });
    }
    return maxVertex;
  }

  const topVertex = getTopMostSelectedVertex();

  return (
    <>
      <div style={{ position: 'absolute', top: 10, left: 10 }}>
        <EuiPopover
          id="popover"
          anchorPosition="downLeft"
          button={
            <EuiButtonIcon
              iconType="filter"
              aria-label="filter connections"
              onClick={() => setOpen(!open)}
            />
          }
          isOpen={open}
          closePopover={() => setOpen(false)}
        >
          <EuiFormRow label="Minimum number of connections">
            <EuiRange
              value={minDocCount}
              min={0}
              max={maxDocCount}
              onChange={e => {
                setMinDocCount(e.target.valueAsNumber);
                updateLayout(clientWorkspace, e.target.valueAsNumber);
              }}
              showInput
            />
          </EuiFormRow>
        </EuiPopover>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="gphGraph"
        width="100%"
        height="100%"
        pointerEvents="all"
        id="graphSvg"
        ref={element => {
          if (element && svgRoot.current !== element) {
            svgRoot.current = element;
            registerZooming(element);
          }
        }}
      >
        <g>
          <g>
            {edges &&
              edges
                .filter(edge => (edge as any).doc_count >= minDocCount)
                .map(edge => (
                  <line
                    key={`${makeNodeId(edge.source.data.field, edge.source.data.term)}-${makeNodeId(
                      edge.target.data.field,
                      edge.target.data.term
                    )}`}
                    x1={edge.topSrc.kx}
                    y1={edge.topSrc.ky}
                    x2={edge.topTarget.kx}
                    y2={edge.topTarget.ky}
                    onClick={() => {
                      edgeClick(edge);
                    }}
                    className={classNames('gphEdge', {
                      'gphEdge--selected': edge.isSelected,
                    })}
                    style={{
                      strokeWidth: Math.max(2, ((edge as any).doc_count / maxDocCount) * 5),
                    }}
                    strokeLinecap="round"
                  />
                ))}
          </g>
          {nodes &&
            nodes
              .filter(node => !node.parent)
              .map(node => (
                <g
                  key={makeNodeId(node.data.field, node.data.term)}
                  onClick={e => {
                    nodeClick(node, e);
                  }}
                  onMouseDown={e => {
                    // avoid selecting text when selecting nodes
                    if (e.ctrlKey || e.shiftKey) {
                      e.preventDefault();
                    }
                  }}
                  className="gphNode"
                  style={{
                    opacity:
                      (node as any).doc_count > 0 &&
                      (node as any).doc_count >= minDocCount &&
                      selectedFieldIds.has(node.data.field)
                        ? 1
                        : 0.5,
                  }}
                >
                  {topVertex && topVertex.id === node.id && (
                    <foreignObject
                      width="10"
                      height="10"
                      transform="translate(0,-35)"
                      style={{ opacity: 1, position: 'absolute', zIndex: 999 }}
                      x={node.kx}
                      y={node.ky}
                    >
                      <EuiPopover
                        anchorPosition="upCenter"
                        button={<span />}
                        isOpen={!popoverForceClosed}
                        onClick={e => {
                          e.stopPropagation();
                        }}
                        closePopover={() => {
                          setForceClosedPopover(true);
                          setShowDrilldown(false);
                          // clientWorkspace.selectNone();
                          // notifyAngular();
                        }}
                      >
                        <small>
                          {clientWorkspace.selectedNodes.length}{' '}
                          {clientWorkspace.selectedNodes.length === 1 ? 'vertex' : 'vertices'}{' '}
                          selected
                        </small>
                        <br />
                        <EuiButtonIcon
                          aria-label="add data"
                          iconType="graphApp"
                          disabled={mode === 'data'}
                          onClick={() => {
                            dataMode();
                          }}
                        />{' '}
                        <EuiButtonIcon
                          aria-label="edit"
                          iconType="pencil"
                          disabled={mode === 'edit'}
                          onClick={() => {
                            editMode();
                          }}
                        />{' '}
                        <EuiButtonIcon
                          aria-label="group"
                          iconType="submodule"
                          disabled={
                            clientWorkspace.selectedNodes.length === 1 &&
                            clientWorkspace.selectedNodes[0].numChildren === 0
                          }
                          onClick={() => {
                            setForceClosedPopover(true);
                            if (clientWorkspace.selectedNodes.length === 1) {
                              clientWorkspace.ungroup(clientWorkspace.selectedNodes[0]);
                            } else {
                              clientWorkspace.groupSelections(
                                clientWorkspace.selectedNodes[
                                  clientWorkspace.selectedNodes.length - 1
                                ]
                              );
                            }
                          }}
                        />{' '}
                        <EuiButtonIcon
                          aria-label="drilldown"
                          iconType="link"
                          onClick={e => {
                            e.stopPropagation();
                            setShowDrilldown(!showDrilldown);
                          }}
                        />{' '}
                        <EuiButtonIcon
                          aria-label="remove"
                          iconType="trash"
                          onClick={() => {
                            clientWorkspace.deleteSelection();
                          }}
                        />
                        {showDrilldown && (
                          <EuiListGroup
                            listItems={urlTemplates.map(template => ({
                              label: template.description,
                              icon: template.icon ? (
                                <LegacyIcon icon={template.icon} />
                              ) : (
                                <EuiIcon iconType="blank" />
                              ),
                              size: 's',
                              onClick: () => {
                                const url = template.url;
                                const newUrl = url.replace(
                                  urlTemplateRegex,
                                  template.encoder.encode(clientWorkspace)
                                );
                                window.open(newUrl, '_blank');
                              },
                            }))}
                          />
                        )}
                      </EuiPopover>
                    </foreignObject>
                  )}
                  <circle
                    cx={node.kx}
                    cy={node.ky}
                    r={node.scaledSize}
                    className={classNames('gphNode__circle', {
                      'gphNode__circle--selected': node.isSelected,
                    })}
                    style={{ fill: node.color }}
                  />
                  {node.icon && (
                    <text
                      className={classNames('fa gphNode__text', {
                        'gphNode__text--inverse': isColorDark(...hexToRgb(node.color)),
                      })}
                      transform="translate(0,5)"
                      textAnchor="middle"
                      x={node.kx}
                      y={node.ky}
                    >
                      {node.icon.code}
                    </text>
                  )}

                  {node.label.length < 30 && (
                    <text
                      className="gphNode__label"
                      textAnchor="middle"
                      transform="translate(0,22)"
                      x={node.kx}
                      y={node.ky}
                    >
                      {node.label}
                    </text>
                  )}
                  {node.label.length >= 30 && (
                    <foreignObject
                      width="100"
                      height="20"
                      transform="translate(-50,15)"
                      x={node.kx}
                      y={node.ky}
                    >
                      <p className="gphNode__label gphNode__label--html gphNoUserSelect">
                        {node.label}
                      </p>
                    </foreignObject>
                  )}

                  {node.numChildren > 0 && (
                    <g>
                      <circle
                        r="5"
                        className="gphNode__markerCircle"
                        transform="translate(10,10)"
                        cx={node.kx}
                        cy={node.ky}
                      />
                      <text
                        className="gphNode__markerText"
                        textAnchor="middle"
                        transform="translate(10,12)"
                        x={node.kx}
                        y={node.ky}
                      >
                        {node.numChildren}
                      </text>
                    </g>
                  )}
                </g>
              ))}
        </g>
      </svg>
    </>
  );
}
const ConnectedGraphVisualization = connect(
  (state: GraphState) => {
    return {
      fields: selectedFieldsSelector(state),
      urlTemplates: templatesSelector(state),
      mode: metaDataSelector(state).mode,
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
)(GraphVisualizationComponent);

export const GraphVisualization = (props: any) => (
  <Provider store={props.reduxStore}>
    <ConnectedGraphVisualization {...props} />
  </Provider>
);
