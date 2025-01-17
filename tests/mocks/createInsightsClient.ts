import {
  AlgoliaAnalytics,
  processQueue,
  getFunctionalInterface,
} from 'search-insights';

import type { InsightsClient } from 'instantsearch.js';
import { castToJestMock } from '@instantsearch/testutils/castToJestMock';

/**
 * Tests that rely on this mock interface have side effects caused by
 * the import of search-insights. The following code deletes those side effects.
 */
try {
  delete window.AlgoliaAnalyticsObject;
} catch (error) {} // eslint-disable-line no-empty

export function createInsights<TVersion extends string | undefined = '2.6.0'>({
  forceVersion = '2.6.0',
}: {
  forceVersion?: TVersion;
} = {}) {
  const analytics = mockMethods(
    new AlgoliaAnalytics({
      requestFn: jest.fn(),
    })
  );
  const mockedInsightsClient = castToJestMock(
    jest.fn(getFunctionalInterface(analytics)) as InsightsClient
  );

  if (forceVersion) {
    return {
      analytics,
      insightsClient: Object.assign(mockedInsightsClient, {
        version: forceVersion,
      }),
    };
  }

  return {
    analytics,
    insightsClient: mockedInsightsClient,
  };
}

export function createInsightsUmdVersion() {
  const globalObject: {
    AlgoliaAnalyticsObject: 'aa';
    aa?: InsightsClient;
  } = {
    AlgoliaAnalyticsObject: 'aa',
  };

  globalObject.aa = (methodName, ...args) => {
    globalObject.aa!.queue = globalObject.aa!.queue || [];
    // @ts-expect-error TypeScript loses track of the exact tuple type when the array gets recreated
    globalObject.aa!.queue.push([methodName, ...args]);
  };
  const analytics = mockMethods(
    new AlgoliaAnalytics({
      requestFn: jest.fn(),
    })
  );

  return {
    analytics,
    insightsClient: globalObject.aa,
    libraryLoadedAndProcessQueue: () => {
      processQueue.call(analytics, globalObject);
    },
  };
}

function mockMethods(analytics: AlgoliaAnalytics) {
  analytics.addAlgoliaAgent = jest.fn(analytics.addAlgoliaAgent);

  analytics.viewedFilters = jest.fn(analytics.viewedFilters);
  analytics.viewedObjectIDs = jest.fn(analytics.viewedObjectIDs);
  analytics.clickedFilters = jest.fn(analytics.clickedFilters);
  analytics.clickedObjectIDs = jest.fn(analytics.clickedObjectIDs);
  analytics.clickedObjectIDsAfterSearch = jest.fn(
    analytics.clickedObjectIDsAfterSearch
  );
  analytics.convertedFilters = jest.fn(analytics.convertedFilters);
  analytics.convertedObjectIDs = jest.fn(analytics.convertedObjectIDs);
  analytics.convertedObjectIDsAfterSearch = jest.fn(
    analytics.convertedObjectIDsAfterSearch
  );
  return analytics;
}
