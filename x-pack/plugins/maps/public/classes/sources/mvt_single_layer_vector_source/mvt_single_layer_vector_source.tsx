/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { i18n } from '@kbn/i18n';
import uuid from 'uuid/v4';
import React from 'react';
import { GeoJsonProperties, Geometry } from 'geojson';
import { AbstractSource, ImmutableSourceProperty, SourceEditorArgs } from '../source';
import { BoundsFilters, GeoJsonWithMeta, ITiledSingleLayerVectorSource } from '../vector_source';
import {
  FIELD_ORIGIN,
  MAX_ZOOM,
  MIN_ZOOM,
  SOURCE_TYPES,
  VECTOR_SHAPE_TYPE,
} from '../../../../common/constants';
import { registerSource } from '../source_registry';
import { getDataSourceLabel, getUrlLabel } from '../../../../common/i18n_getters';
import {
  MapExtent,
  MVTFieldDescriptor,
  TiledSingleLayerVectorSourceDescriptor,
  VectorSourceSyncMeta,
} from '../../../../common/descriptor_types';
import { MVTField } from '../../fields/mvt_field';
import { UpdateSourceEditor } from './update_source_editor';
import { ITooltipProperty, TooltipProperty } from '../../tooltips/tooltip_property';

export const sourceTitle = i18n.translate(
  'xpack.maps.source.MVTSingleLayerVectorSource.sourceTitle',
  {
    defaultMessage: 'Vector Tile Layer',
  }
);

export class MVTSingleLayerVectorSource extends AbstractSource
  implements ITiledSingleLayerVectorSource {
  static createDescriptor({
    urlTemplate,
    layerName,
    minSourceZoom,
    maxSourceZoom,
    fields,
    tooltipProperties,
  }: Partial<TiledSingleLayerVectorSourceDescriptor>) {
    return {
      type: SOURCE_TYPES.MVT_SINGLE_LAYER,
      id: uuid(),
      urlTemplate: urlTemplate ? urlTemplate : '',
      layerName: layerName ? layerName : '',
      minSourceZoom:
        typeof minSourceZoom === 'number' ? Math.max(MIN_ZOOM, minSourceZoom) : MIN_ZOOM,
      maxSourceZoom:
        typeof maxSourceZoom === 'number' ? Math.min(MAX_ZOOM, maxSourceZoom) : MAX_ZOOM,
      fields: fields ? fields : [],
      tooltipProperties: tooltipProperties ? tooltipProperties : [],
    };
  }

  readonly _descriptor: TiledSingleLayerVectorSourceDescriptor;
  readonly _tooltipFields: MVTField[];

  constructor(
    sourceDescriptor: TiledSingleLayerVectorSourceDescriptor,
    inspectorAdapters?: object
  ) {
    super(sourceDescriptor, inspectorAdapters);
    this._descriptor = MVTSingleLayerVectorSource.createDescriptor(sourceDescriptor);

    this._tooltipFields = this._descriptor.tooltipProperties
      .map((fieldName) => {
        return this.getFieldByName(fieldName);
      })
      .filter((f) => f !== null) as MVTField[];
  }

  async supportsFitToBounds() {
    return false;
  }

  renderSourceSettingsEditor({ onChange }: SourceEditorArgs) {
    return (
      <UpdateSourceEditor onChange={onChange} tooltipFields={this._tooltipFields} source={this} />
    );
  }

  getFieldNames(): string[] {
    return this._descriptor.fields.map((field: MVTFieldDescriptor) => {
      return field.name;
    });
  }

  getMVTFields(): MVTField[] {
    return this._descriptor.fields.map((field: MVTFieldDescriptor) => {
      return new MVTField({
        fieldName: field.name,
        type: field.type,
        source: this,
        origin: FIELD_ORIGIN.SOURCE,
      });
    });
  }

  getFieldByName(fieldName: string): MVTField | null {
    try {
      return this.createField({ fieldName });
    } catch (e) {
      return null;
    }
  }

  createField({ fieldName }: { fieldName: string }): MVTField {
    const field = this._descriptor.fields.find((f: MVTFieldDescriptor) => {
      return f.name === fieldName;
    });
    if (!field) {
      throw new Error(`Cannot create field for fieldName ${fieldName}`);
    }
    return new MVTField({
      fieldName: field.name,
      type: field.type,
      source: this,
      origin: FIELD_ORIGIN.SOURCE,
    });
  }

  getGeoJsonWithMeta(
    layerName: 'string',
    searchFilters: unknown[],
    registerCancelCallback: (callback: () => void) => void
  ): Promise<GeoJsonWithMeta> {
    // Having this method here is a consequence of ITiledSingleLayerVectorSource extending IVectorSource.
    throw new Error('Does not implement getGeoJsonWithMeta');
  }

  async getFields(): Promise<MVTField[]> {
    return this.getMVTFields();
  }

  getLayerName(): string {
    return this._descriptor.layerName;
  }

  async getImmutableProperties(): Promise<ImmutableSourceProperty[]> {
    return [
      { label: getDataSourceLabel(), value: sourceTitle },
      { label: getUrlLabel(), value: this._descriptor.urlTemplate },
      {
        label: i18n.translate('xpack.maps.source.MVTSingleLayerVectorSource.layerNameMessage', {
          defaultMessage: 'Layer name',
        }),
        value: this._descriptor.layerName,
      },
      {
        label: i18n.translate('xpack.maps.source.MVTSingleLayerVectorSource.minZoomMessage', {
          defaultMessage: 'Min zoom',
        }),
        value: this._descriptor.minSourceZoom.toString(),
      },
      {
        label: i18n.translate('xpack.maps.source.MVTSingleLayerVectorSource.maxZoomMessage', {
          defaultMessage: 'Max zoom',
        }),
        value: this._descriptor.maxSourceZoom.toString(),
      },
      {
        label: i18n.translate('xpack.maps.source.MVTSingleLayerVectorSource.fields', {
          defaultMessage: 'Fields',
        }),
        value: this._descriptor.fields.map(({ name, type }) => `${name}(${type})`).join(', '),
      },
    ];
  }

  async getDisplayName(): Promise<string> {
    return this.getLayerName();
  }

  async getUrlTemplateWithMeta() {
    return {
      urlTemplate: this._descriptor.urlTemplate,
      layerName: this._descriptor.layerName,
      minSourceZoom: this._descriptor.minSourceZoom,
      maxSourceZoom: this._descriptor.maxSourceZoom,
    };
  }

  async getSupportedShapeTypes(): Promise<VECTOR_SHAPE_TYPE[]> {
    return [VECTOR_SHAPE_TYPE.POINT, VECTOR_SHAPE_TYPE.LINE, VECTOR_SHAPE_TYPE.POLYGON];
  }

  canFormatFeatureProperties() {
    if (!this._tooltipFields.length) {
      return false;
    }

    for (let i = 0; i < this._tooltipFields.length; i++) {
      const tooltip: MVTField = this._tooltipFields[i];
      for (let j = 0; j < this._descriptor.fields.length; j++) {
        if (tooltip.getName() === this._descriptor.fields[j].name) {
          return true;
        }
      }
    }
    return false;
  }

  getMinZoom() {
    return this._descriptor.minSourceZoom;
  }

  getMaxZoom() {
    return this._descriptor.maxSourceZoom;
  }

  getFeatureProperties(
    id: string | number | undefined,
    mbProperties: GeoJsonProperties
  ): GeoJsonProperties | null {
    return mbProperties;
  }
  getFeatureGeometry(
    id: string | number | undefined,
    mbProperties: GeoJsonProperties
  ): Geometry | null {
    // Cannot get the raw geometry for a simple tiled service
    return null;
  }

  getBoundsForFilters(
    boundsFilters: BoundsFilters,
    registerCancelCallback: (requestToken: symbol, callback: () => void) => void
  ): MapExtent | null {
    return null;
  }

  getSyncMeta(): VectorSourceSyncMeta {
    return null;
  }

  getApplyGlobalQuery(): boolean {
    return false;
  }

  supportsFieldMeta(): boolean {
    return false;
  }

  async filterAndFormatPropertiesToHtml(
    properties: GeoJsonProperties,
    featureId?: string | number
  ): Promise<ITooltipProperty[]> {
    const tooltips = [];
    for (const key in properties) {
      if (properties.hasOwnProperty(key)) {
        const field = this._tooltipFields.find((mvtField: MVTField) => {
          return mvtField.getName() === key;
        });

        if (field) {
          const tooltip = new TooltipProperty(key, key, properties[key]);
          tooltips.push(tooltip);
        }
      }
    }
    return tooltips;
  }
}

registerSource({
  ConstructorFunction: MVTSingleLayerVectorSource,
  type: SOURCE_TYPES.MVT_SINGLE_LAYER,
});
