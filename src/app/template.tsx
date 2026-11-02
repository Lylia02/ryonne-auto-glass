'use client';
/* Page transition — template.tsx re-mounts on every navigation.
   <TLink> already raised the black curtain over the old page (leavePage);
   here the new page fades in while the curtain keeps rising away and the
   hero reveal plays (enterPage). First load is handled by <Gate>. */
import { useRef } from 'react';
import { usePathname } from 'next/navigation';
import { enterPage, useIsoLayoutEffect } from '@/lib/motion';

export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useIsoLayoutEffect(() => { enterPage(ref.current!, pathname); }, [pathname]);

  return <div id="page" ref={ref}>{children}</div>;
}
