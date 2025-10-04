'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Fragment } from 'react';
import { ChevronRight } from 'lucide-react';

const formatCrumb = (crumb: string) => {
  return crumb
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);

  // Don't show breadcrumbs on main dashboard pages
  if (
    pathname === '/app/dashboard' ||
    pathname === '/admin/dashboard' ||
    pathSegments.length <= 1
  ) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="text-sm font-medium">
      <ol className="flex items-center gap-2">
        {pathSegments.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const isLast = index === pathSegments.length - 1;
          const formattedSegment = formatCrumb(segment);

          // Simple check to see if it's a dynamic route segment (likely an ID)
          const isDynamic = /^[0-9a-fA-F-]+$/.test(segment) && index > 0;
          const label = isDynamic ? `Details` : formattedSegment;

          return (
            <Fragment key={href}>
              <li>
                {isLast ? (
                  <span className="text-foreground" aria-current="page">
                    {label}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {label}
                  </Link>
                )}
              </li>
              {!isLast && (
                <li>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
