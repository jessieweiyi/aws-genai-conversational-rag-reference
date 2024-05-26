/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { FC, createContext, useContext, useMemo, useState } from 'react';
import { useRuntimeConfig } from '../Auth';

export const SEARCH_PARAM_FEATURES = 'features';
export const FEATURE_FLAG_STREAMING = 'streaming';
export interface IFeatureFlags {
  [FEATURE_FLAG_STREAMING]?: boolean;
}
export const FlagContext = createContext<IFeatureFlags>({});

export const useFeatureFlags = () => {
  const context = useContext(FlagContext);
  if (context == null) {
    throw new Error('useFeatureFlag can only be used within a FlagsProvider');
  }
  return context;
};

export const useFeatureFlag = (flag: keyof IFeatureFlags): boolean => {
  const flags = useFeatureFlags();
  return flags[flag] === true;
};

export const FlagsProvider: FC<React.PropsWithChildren> = ({ children }) => {
  const { flags } = useRuntimeConfig();

  const [flagsOverride] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const featureParam = urlParams.get(SEARCH_PARAM_FEATURES);
    return (
      (featureParam &&
        featureParam.split(',').reduce(
          (aggr, f) => ({
            ...aggr,
            [f]: true,
          }),
          {},
        )) ||
      {}
    );
  });

  const value = useMemo<IFeatureFlags>(() => {
    return {
      ...flags,
      ...flagsOverride,
    };
  }, [flags, flagsOverride]);

  return <FlagContext.Provider value={value}>{children}</FlagContext.Provider>;
};
