"use client";

import React from "react";

export const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const useAnalytics = () => ({
  trackEvent: () => {},
  trackPage: () => {},
});
