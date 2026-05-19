import type { AnchorHTMLAttributes, ReactNode } from "react";

/**
 * Hosts treated as "internal" — never wrapped with no-referrer / noopener.
 * Add staging or dev origins here if you want to skip the hardening locally.
 */
const INTERNAL_HOSTS: ReadonlySet<string> = new Set([
  "boringgg.com",
  "www.boringgg.com",
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
]);

/**
 * Returns true if the href points off-site.
 * Relative URLs (`/foo`, `#section`, `?q=1`) and mailto/tel are always internal.
 */
export function isExternalHref(href: string): boolean {
  if (!href) return false;
  if (
    href.startsWith("/") ||
    href.startsWith("#") ||
    href.startsWith("?") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return false;
  }
  try {
    const url = new URL(href);
    return !INTERNAL_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

function mergeRel(existing: string | undefined, additions: string[]): string {
  const tokens = new Set<string>();
  if (existing) {
    for (const t of existing.split(/\s+/)) if (t) tokens.add(t);
  }
  for (const t of additions) tokens.add(t);
  return Array.from(tokens).join(" ");
}

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
};

/**
 * Renders an <a>. If the href is external:
 *   - rel gets `noreferrer noopener` (deduped with anything the caller passed)
 *   - referrerPolicy is forced to "no-referrer"
 *   - target defaults to "_blank" unless the caller overrides
 *
 * Internal hrefs render a plain <a> unchanged. The sitewide
 * `Referrer-Policy: no-referrer` HTTP header (see next.config.ts) means
 * even bare <a> tags won't leak boringgg.com to destination sites — this
 * component is belt-and-suspenders, and also handles tab-jacking via the
 * `noopener` token.
 */
export function ExternalLink({
  href,
  rel,
  target,
  referrerPolicy,
  children,
  ...rest
}: Props) {
  const external = isExternalHref(href);
  if (!external) {
    return (
      <a href={href} rel={rel} target={target} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <a
      href={href}
      target={target ?? "_blank"}
      rel={mergeRel(rel, ["noreferrer", "noopener"])}
      referrerPolicy={referrerPolicy ?? "no-referrer"}
      {...rest}
    >
      {children}
    </a>
  );
}
