/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { useState } from 'react';
import { EuiLink, EuiBadge, EuiCodeBlock, EuiIcon } from '@elastic/eui';
import { i18n } from '@kbn/i18n';

import { useHighlightTreeLeaf } from '../use_highlight_tree_leaf';
import { msToPretty } from '../../../utils';

import { Index, Operation, Shard } from '../../../types';

export interface Props {
  parentVisible: boolean;
  index: Index;
  shard: Shard;
  operation: Operation;
}

const TAB_WIDTH_PX = 32;

const limitString = (string: string, limit: number) =>
  `${string.slice(0, limit)}${string.length > limit ? '...' : ''}`;

export const ShardDetailsTreeLeaf = ({ parentVisible, operation, index, shard }: Props) => {
  if (!parentVisible) {
    return null;
  }

  const [visible, setVisible] = useState(Boolean(operation.visible));
  const { highlight, isHighlighted } = useHighlightTreeLeaf();

  const renderTimeRow = (op: Operation) => (
    <div className="prfDevTool__tvRow">
      <div className="prfDevTool__cell prfDevTool__description">
        <EuiLink
          className="prfDevTool__shardDetails"
          disabled={!op.hasChildren}
          onClick={() => setVisible(!visible)}
        >
          {op.hasChildren ? (
            <EuiIcon type={op.visible ? 'arrowDown' : 'arrowRight'} />
          ) : (
            // Use dot icon for alignment if arrow isn't there
            <EuiIcon type={'dot'} />
          )}

          {op.query_type}
        </EuiLink>
      </div>
      <div className="prfDevTool__cell prfDevTool__time">
        <EuiBadge className="prfDevTool__badge" style={{ backgroundColor: op.absoluteColor }}>
          {msToPretty(op.selfTime!, 1)}
        </EuiBadge>
      </div>
      <div className="prfDevTool__cell prfDevTool__totalTime">
        <EuiBadge className="prfDevTool__badge" style={{ backgroundColor: op.absoluteColor }}>
          {msToPretty(op.time!, 1)}
        </EuiBadge>
      </div>
    </div>
  );

  const renderLuceneRow = (op: Operation) => (
    <div className="prfDevTool__tvRow">
      <span className="prfDevTool__detail">
        <EuiCodeBlock>{limitString(op.lucene || '', 120)}</EuiCodeBlock>
      </span>
    </div>
  );

  return (
    <>
      <div
        className={isHighlighted() ? 'prfDevTool__tvRow--last' : ''}
        style={{ paddingLeft: operation.depth! * TAB_WIDTH_PX + 'px' }}
      >
        {renderTimeRow(operation)}
        {renderLuceneRow(operation)}
        <EuiLink
          type="button"
          onClick={() => highlight({ indexName: index.name, operation, shard })}
        >
          {i18n.translate('xpack.searchProfiler.profileTree.body.viewDetailsLabel', {
            defaultMessage: 'View Details',
          })}
        </EuiLink>
      </div>
      {operation.hasChildren &&
        operation.children.flatMap(childOp => (
          <ShardDetailsTreeLeaf
            parentVisible={visible}
            operation={childOp}
            index={index}
            shard={shard}
          />
        ))}
    </>
  );
};
