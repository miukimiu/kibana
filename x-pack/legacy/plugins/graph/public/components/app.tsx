/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { EuiButtonIcon, EuiSpacer } from '@elastic/eui';

import { DataPublicPluginStart } from 'src/plugins/data/public';
import { Provider } from 'react-redux';
import React, { useState } from 'react';
import { I18nProvider } from '@kbn/i18n/react';
import { CoreStart } from 'kibana/public';
import { IStorageWrapper } from 'src/plugins/kibana_utils/public';
import { FieldManager } from './field_manager';
import { SearchBarProps, SearchBar } from './search_bar';
import { GraphStore } from '../state_management';
import { GuidancePanel } from './guidance_panel';
import { GraphTitle } from './graph_title';

import { KibanaContextProvider } from '../../../../../../src/plugins/kibana_react/public';
import { AddDataPanel } from './add_data/add_data_panel';
import { EditNodesPanel } from './edit_nodes_panel';
import { filterWorkspace } from '../state_management/filter';

export interface GraphAppProps extends SearchBarProps {
  coreStart: CoreStart;
  // This is not named dataStart because of Angular treating data- prefix differently
  pluginDataStart: DataPublicPluginStart;
  storage: IStorageWrapper;
  reduxStore: GraphStore;
  isInitialized: boolean;
  noIndexPatterns: boolean;
}

export function GraphApp(props: GraphAppProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filter, setFilter] = useState<any>(undefined);
  const {
    coreStart,
    pluginDataStart,
    storage,
    reduxStore,
    noIndexPatterns,
    ...searchBarProps
  } = props;

  return (
    <I18nProvider>
      <KibanaContextProvider
        services={{
          appName: 'graph',
          storage,
          data: pluginDataStart,
          ...coreStart,
        }}
      >
        <Provider store={reduxStore}>
          <>
            {props.isInitialized && <GraphTitle />}
            <div className="gphGraph__bar">
              <SearchBar
                {...searchBarProps}
                onQuerySubmit={newQuery => {
                  reduxStore.dispatch(filterWorkspace({ filter: newQuery }));
                  setFilter(newQuery);
                }}
              />
              <EuiSpacer size="s" />
              <FieldManager pickerOpen={pickerOpen} setPickerOpen={setPickerOpen} />
            </div>
            {sidebarOpen && (
              <AddDataPanel {...searchBarProps} filter={filter} setSidebarOpen={setSidebarOpen} />
            )}
            {props.isInitialized && !sidebarOpen && (
              <EuiButtonIcon
                className="gphGraph__openSidebar"
                onClick={() => {
                  setSidebarOpen(true);
                }}
                iconType="menuLeft"
                style={{ position: 'absolute', top: 122, right: 5, zIndex: 999 }}
                color="text"
              />
            )}
            {!props.isInitialized && (
              <GuidancePanel
                noIndexPatterns={noIndexPatterns}
                onOpenFieldPicker={() => {
                  setPickerOpen(true);
                }}
              />
            )}
          </>
        </Provider>
      </KibanaContextProvider>
    </I18nProvider>
  );
}
