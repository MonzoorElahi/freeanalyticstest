"use client";

import { ReactNode } from "react";
import ErrorBoundary from "./ErrorBoundary";

interface DashboardWrapperProps {
  children: ReactNode;
}

export default function DashboardWrapper({ children }: DashboardWrapperProps) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
