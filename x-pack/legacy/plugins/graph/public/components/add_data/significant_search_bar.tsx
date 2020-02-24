/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { EuiFlexGroup, EuiFlexItem, EuiButton, EuiButtonEmpty, EuiToolTip } from '@elastic/eui';
import React, { useState, useEffect } from 'react';

import { i18n } from '@kbn/i18n';
import { connect } from 'react-redux';
import { IndexPatternSavedObject, IndexPatternProvider } from '../../types';
import {
  GraphState,
  datasourceSelector,
  requestDatasource,
  IndexpatternDatasource,
} from '../../state_management';

// import { useKibana } from '../../../../../../src/plugins/kibana_react/public';
import {
  IndexPattern,
  QueryStringInput,
  IDataPluginServices,
  Query,
  esKuery,
} from '../../../../../../../src/plugins/data/public';

export interface OuterSearchBarProps {
  isLoading: boolean;
  initialQuery?: string;
  onQuerySubmit: (query: string) => void;

  indexPatternProvider: IndexPatternProvider;
}

export interface SearchBarProps extends OuterSearchBarProps {
  currentDatasource?: IndexpatternDatasource;
  onIndexPatternSelected: (indexPattern: IndexPatternSavedObject) => void;
}

function queryToString(query: Query, indexPattern: IndexPattern) {
  if (query.language === 'kuery' && typeof query.query === 'string') {
    const dsl = esKuery.toElasticsearchQuery(
      esKuery.fromKueryExpression(query.query as string),
      indexPattern
    );
    // JSON representation of query will be handled by existing logic.
    // TODO clean this up and handle it in the data fetch layer once
    // it moved to typescript.
    return JSON.stringify(dsl);
  }

  if (typeof query.query === 'string') {
    return query.query;
  }

  return JSON.stringify(query.query);
}

export function SearchBarComponent(props: SearchBarProps) {
  const { currentDatasource, onQuerySubmit, isLoading, initialQuery, indexPatternProvider } = props;
  const [query, setQuery] = useState<Query>({ language: 'kuery', query: initialQuery || '' });
  const [currentIndexPattern, setCurrentIndexPattern] = useState<IndexPattern | undefined>(
    undefined
  );

  useEffect(() => {
    async function fetchPattern() {
      if (currentDatasource) {
        setCurrentIndexPattern(await indexPatternProvider.get(currentDatasource.id));
      } else {
        setCurrentIndexPattern(undefined);
      }
    }
    fetchPattern();
  }, [currentDatasource, indexPatternProvider]);

  // const kibana = useKibana<IDataPluginServices>();
  // const { services, overlays } = kibana;
  // const { savedObjects, uiSettings } = services;
  // if (!overlays) return null;

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (!isLoading && currentIndexPattern) {
          onQuerySubmit(queryToString(query, currentIndexPattern));
        }
      }}
    >
      <EuiFlexGroup gutterSize="m">
        <EuiFlexItem>
          <QueryStringInput
            disableAutoFocus
            bubbleSubmitEvent
            indexPatterns={currentIndexPattern ? [currentIndexPattern] : []}
            placeholder={i18n.translate('xpack.graph.bar.searchFieldPlaceholder', {
              defaultMessage: 'Search your data and add to graph',
            })}
            query={query}
            onChange={setQuery}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </form>
  );
}

export const SignificantSearchBar = connect(
  (state: GraphState) => {
    const datasource = datasourceSelector(state);
    return {
      currentDatasource:
        datasource.current.type === 'indexpattern' ? datasource.current : undefined,
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
  })
)(SearchBarComponent);
