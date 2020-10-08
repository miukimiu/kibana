/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';
import { orderBy } from 'lodash';
import React, { ChangeEvent } from 'react';

import {
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiScreenReaderOnly,
  EuiSpacer,
  EuiIcon,
  EuiCard,
  EuiLink,
  EuiModalBody,
  EuiModalHeader,
  EuiModalHeaderTitle,
} from '@elastic/eui';

import { memoizeLast } from '../../legacy/memoize';
import { VisType, TypesStart, VisGroups } from '../../vis_types';

interface VisTypeListEntry {
  type: VisType;
  highlighted: boolean;
}

interface AggBasedSelectionProps {
  onVisTypeSelected: (visType: VisType) => void;
  visTypesRegistry: TypesStart;
  toggleGroups: (flag: boolean) => void;
}
interface AggBasedSelectionState {
  query: string;
}

class AggBasedSelection extends React.Component<AggBasedSelectionProps, AggBasedSelectionState> {
  public state: AggBasedSelectionState = {
    query: '',
  };

  private readonly getFilteredVisTypes = memoizeLast(this.filteredVisTypes);

  public render() {
    const { query } = this.state;
    const visTypes = this.getFilteredVisTypes(this.props.visTypesRegistry, query);
    return (
      <>
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            <FormattedMessage
              id="visualizations.newVisWizard.title"
              defaultMessage="New Visualization"
            />
          </EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>
          <EuiLink data-test-subj="goBackLink" onClick={() => this.props.toggleGroups(true)}>
            <EuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
              <EuiFlexItem grow={false}>
                <EuiIcon type="arrowLeft" />
              </EuiFlexItem>
              <EuiFlexItem>
                {i18n.translate('visualizations.newVisWizard.goBackLink', {
                  defaultMessage: 'Go Back',
                })}
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiLink>
          <EuiSpacer />
          <EuiFieldSearch
            placeholder="Filter"
            value={query}
            onChange={this.onQueryChange}
            fullWidth
            data-test-subj="filterVisType"
            aria-label={i18n.translate('visualizations.newVisWizard.filterVisTypeAriaLabel', {
              defaultMessage: 'Filter for a visualization type',
            })}
          />
          <EuiSpacer />
          <EuiScreenReaderOnly>
            <span aria-live="polite">
              {query && (
                <FormattedMessage
                  id="visualizations.newVisWizard.resultsFound"
                  defaultMessage="{resultCount} {resultCount, plural,
                            one {type}
                            other {types}
                          } found"
                  values={{
                    resultCount: visTypes.filter((type) => type.highlighted).length,
                  }}
                />
              )}
            </span>
          </EuiScreenReaderOnly>
          <EuiFlexGroup
            data-test-subj="visNewDialogTypes"
            wrap
            responsive={false}
            justifyContent="center"
          >
            {visTypes.map(this.renderVisType)}
          </EuiFlexGroup>
        </EuiModalBody>
      </>
    );
  }

  private filteredVisTypes(visTypes: TypesStart, query: string): VisTypeListEntry[] {
    const types = visTypes.getByGroup(VisGroups.AGGBASED).filter((type) => {
      // Filter out hidden visualizations and visualizations that are only aggregations based
      return !type.hidden;
    });

    let entries: VisTypeListEntry[];
    if (!query) {
      entries = types.map((type) => ({ type, highlighted: false }));
    } else {
      const q = query.toLowerCase();
      entries = types.map((type) => {
        const matchesQuery =
          type.name.toLowerCase().includes(q) ||
          type.title.toLowerCase().includes(q) ||
          (typeof type.description === 'string' && type.description.toLowerCase().includes(q));
        return { type, highlighted: matchesQuery };
      });
    }

    return orderBy(entries, ['highlighted', 'type.title'], ['desc', 'asc', 'asc']);
  }

  private renderVisType = (visType: VisTypeListEntry) => {
    const isDisabled = this.state.query !== '' && !visType.highlighted;
    const onClick = () => this.props.onVisTypeSelected(visType.type);

    return (
      <EuiFlexItem key={visType.type.name} grow={false}>
        <EuiCard
          className="visNewVisDialog__card"
          titleSize="xs"
          title={<span data-test-subj="visTypeTitle">{visType.type.title}</span>}
          onClick={onClick}
          data-test-subj={`visType-${visType.type.name}`}
          data-vis-stage={visType.type.stage}
          aria-describedby={`visTypeDescription-${visType.type.name}`}
          description={visType.type.description || ''}
          layout="horizontal"
          isDisabled={isDisabled}
          icon={<EuiIcon type={visType.type.icon || 'empty'} size="l" color="secondary" />}
        />
      </EuiFlexItem>
    );
  };

  private onQueryChange = (ev: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      query: ev.target.value,
    });
  };
}

export { AggBasedSelection };
