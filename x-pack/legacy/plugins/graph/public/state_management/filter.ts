/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import actionCreatorFactory, { Action } from 'typescript-fsa';
import { i18n } from '@kbn/i18n';
import { takeLatest, select, call } from 'redux-saga/effects';
import { GraphStoreDependencies, GraphState, IndexpatternDatasource } from '.';
import { datasourceSelector } from './datasource';
import { selectedFieldsSelector } from './fields';
import { fetchTopNodes } from '../services/fetch_top_nodes';
const actionCreator = actionCreatorFactory('x-pack/graph');

export const filterWorkspace = actionCreator<{ filter: any }>('FILTER_WORKSPACE');

/**
 * Saga handling filling in top terms into workspace.
 *
 * It will load the top terms of the selected fields, add them to the workspace and fill in the connections.
 */
export const filterWorkspaceSaga = ({
  getWorkspace,
  notifyAngular,
  http,
  notifications,
}: GraphStoreDependencies) => {
  function* setFilter(action: Action<{ filter: any }>) {
    const workspace = getWorkspace();
    if (!workspace) {
      return;
    }

    workspace.setFilter(action.payload.filter);
    notifyAngular();
    workspace.fillInGraph();
  }

  return function*() {
    yield takeLatest(filterWorkspace.match, setFilter);
  };
};
