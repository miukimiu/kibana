/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Component } from 'react';
import { SourceSelect } from './source_select/source_select';
import { FlyoutFooter } from './flyout_footer';
import { SourceEditor } from './source_editor';
import { ImportEditor } from './import_editor';
import {
  EuiFlexGroup,
  EuiTitle,
  EuiFlyoutHeader,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';

export class AddLayerPanel extends Component {

  state = {
    sourceType: null,
    layer: null,
    indexingTriggered: false,
    indexingSuccess: false,
    importIndexingReady: false,
    importView: false,
    panelDescription: i18n.translate('xpack.maps.addLayerPanel.selectSource',
      { defaultMessage: 'Select source' }),
  }

  _getPanelDescription() {
    const { sourceType, importView, indexingSuccess } = this.state;
    let panelDescription;
    if (!sourceType) {
      panelDescription = i18n.translate('xpack.maps.addLayerPanel.selectSource',
        { defaultMessage: 'Select source' });
    } else if (importView && !indexingSuccess) {
      panelDescription = i18n.translate('xpack.maps.addLayerPanel.importFile',
        { defaultMessage: 'Import file' });
    } else {
      panelDescription = i18n.translate('xpack.maps.addLayerPanel.addLayer',
        { defaultMessage: 'Add layer' });
    }
    return panelDescription;
  }

  _viewLayer = source => {
    if (!source) {
      this.setState({ layer: null });
      this.props.removeTransientLayer();
      return;
    }

    const layerOptions = this.state.layer
      ? { style: this.state.layer.getCurrentStyle().getDescriptor() }
      : {};
    const layer = source.createDefaultLayer(layerOptions, this.props.mapColors);
    this.setState({ layer }, () => this.props.viewLayer(this.state.layer));
  };

  _addImportedLayer = async source => {
    await this.props.removeTransientLayer();
    if (!source) {
      this.setState({ layer: null });
      return;
    }
    this.setState({
      layer: source.createDefaultLayer({}, this.props.mapColors)
    }, () => this.props.addImportedLayer(this.state.layer));
  };

  _clearLayerData = ({ keepSourceType = false }) => {
    this.setState({
      layer: null,
      ...(
        !keepSourceType
          ? { sourceType: null, importView: false }
          : {}
      ),
    });
    this.props.removeTransientLayer();
  }

  _onSourceSelectionChange = ({ type, isIndexingSource }) => {
    this.setState({ sourceType: type, importView: isIndexingSource });
  }

  _layerAddHandler = () => {
    const layerSource = this.state.layer.getSource();
    const boolIndexLayer = layerSource.shouldBeIndexed();
    this.setState({ layer: null });
    if (boolIndexLayer && !this.state.indexingTriggered) {
      this.setState({ indexingTriggered: true });
    } else {
      this.props.selectLayerAndAdd();
    }
  }

  _renderAddLayerPanel() {
    if (!this.state.sourceType) {
      return (
        <SourceSelect updateSourceSelection={this._onSourceSelectionChange} />
      );
    }
    if (this.state.importView) {
      return (
        <ImportEditor
          clearSource={this._clearLayerData}
          previewLayer={source => this._viewLayer(source)}
          addImportLayer={source => this._addImportedLayer(source)}
          indexingTriggered={this.state.indexingTriggered}
          onIndexReady={
            importIndexingReady => this.setState({ importIndexingReady })
          }
          importSuccessHandler={
            () => this.setState({ indexingSuccess: true })
          }
          importErrorHandler={
            () => this.setState({ indexingSuccess: false })
          }
          onRemove={() => this._clearLayerData({ keepSourceType: true })}
        />
      );
    }
    return (
      <SourceEditor
        clearSource={this._clearLayerData}
        sourceType={this.state.sourceType}
        previewLayer={source => this._viewLayer(source)}
      />
    );
  }

  _renderFooter(buttonDescription) {
    if (!this.state.sourceType) {
      return null;
    }

    const {
      indexingTriggered, indexingSuccess, importView, layer,
      importIndexingReady
    } = this.state;

    let buttonEnabled;
    if (importView) {
      const isImportPreviewReady = importView && importIndexingReady;
      const isImportCompleted = importView && indexingTriggered && indexingSuccess;
      buttonEnabled = isImportPreviewReady || isImportCompleted;
    } else {
      buttonEnabled = !!layer;
    }

    return (
      <FlyoutFooter
        onClick={this._layerAddHandler}
        disableNextButton={!buttonEnabled}
        buttonText={buttonDescription}
      />
    );
  }

  _renderFlyout() {
    const panelDescription = this._getPanelDescription();

    return (
      <EuiFlexGroup
        direction="column"
        gutterSize="none"
      >
        <EuiFlyoutHeader hasBorder className="mapLayerPanel__header">
          <EuiTitle size="s">
            <h2>
              {panelDescription}
            </h2>
          </EuiTitle>
        </EuiFlyoutHeader>

        <div className="mapLayerPanel__body" data-test-subj="layerAddForm">
          <div className="mapLayerPanel__bodyOverflow">
            { this._renderAddLayerPanel() }
          </div>
        </div>
        { this._renderFooter(panelDescription) }
      </EuiFlexGroup>
    );
  }

  render() {
    return (this.props.flyoutVisible) ? this._renderFlyout() : null;
  }
}
