'use client';
 
import { ProgressProvider } from '@bprogress/next/app';
 
const BProgressProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProgressProvider 
      height="4px"
      color="#fffd00"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
};
 
export default BProgressProvider;