/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { mount } from 'enzyme';
import { VisualizationContainer } from './visualization_container';

describe('VisualizationContainer', () => {
  test('renders reporting data attributes when ready', () => {
    const component = mount(<VisualizationContainer isReady={true}>Hello!</VisualizationContainer>);

    const reportingEl = component.find('[data-shared-item]').first();
    expect(reportingEl.prop('data-render-complete')).toBeTruthy();
    expect(reportingEl.prop('data-shared-item')).toBeTruthy();
  });

  test('does not render data attributes when not ready', () => {
    const component = mount(
      <VisualizationContainer isReady={false}>Hello!</VisualizationContainer>
    );

    const reportingEl = component.find('[data-shared-item]').first();
    expect(reportingEl.prop('data-render-complete')).toBeFalsy();
    expect(reportingEl.prop('data-shared-item')).toBeTruthy();
  });

  test('increments counter in data attribute for each render', () => {
    const component = mount(<VisualizationContainer isReady={true}>Hello!</VisualizationContainer>);

    let reportingEl = component.find('[data-shared-item]').first();
    expect(reportingEl.prop('data-rendering-count')).toEqual(1);

    component.setProps({ children: 'Hello2!' });

    reportingEl = component.find('[data-shared-item]').first();
    expect(reportingEl.prop('data-rendering-count')).toEqual(2);
  });

  test('renders child content', () => {
    const component = mount(
      <VisualizationContainer isReady={false}>Hello!</VisualizationContainer>
    );

    expect(component.text()).toEqual('Hello!');
  });

  test('defaults to rendered', () => {
    const component = mount(<VisualizationContainer>Hello!</VisualizationContainer>);
    const reportingEl = component.find('[data-shared-item]').first();

    expect(reportingEl.prop('data-render-complete')).toBeTruthy();
    expect(reportingEl.prop('data-shared-item')).toBeTruthy();
  });

  test('renders title and description for reporting, if provided', () => {
    const component = mount(
      <VisualizationContainer reportTitle="shazam!" reportDescription="Description">
        Hello!
      </VisualizationContainer>
    );
    const reportingEl = component.find('[data-shared-item]').first();

    expect(reportingEl.prop('data-title')).toEqual('shazam!');
    expect(reportingEl.prop('data-description')).toEqual('Description');
  });

  test('renders style', () => {
    const component = mount(
      <VisualizationContainer style={{ color: 'blue' }}>Hello!</VisualizationContainer>
    );
    const reportingEl = component.find('[data-shared-item]').first();

    expect(reportingEl.prop('style')).toEqual({ color: 'blue' });
  });

  test('combines class names with container class', () => {
    const component = mount(
      <VisualizationContainer className="myClass">Hello!</VisualizationContainer>
    );
    const reportingEl = component.find('[data-shared-item]').first();

    expect(reportingEl.prop('className')).toEqual('myClass lnsVisualizationContainer');
  });
});
