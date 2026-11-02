'use client';
/* Internal link with page transition:
   - other page → curtain rises (leavePage), then router.push
   - same page  → smooth scroll to #hash (or to top), like main.js */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ComponentProps, MouseEvent } from 'react';
import { leavePage, scrollToTarget } from '@/lib/motion';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: string };

export default function TLink({ href, onClick, ...rest }: Props) {
  const router = useRouter();

  const handle = async (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const url = new URL(href, location.href);
    if (url.origin !== location.origin) return;
    e.preventDefault();

    if (url.pathname === location.pathname && url.search === location.search) {
      const t = url.hash.length > 1 ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : null;
      scrollToTarget(t || 0);
      return;
    }
    await leavePage();
    router.push(url.pathname + url.search + url.hash, { scroll: false });
  };

  return <Link href={href} onClick={handle} {...rest} />;
}
