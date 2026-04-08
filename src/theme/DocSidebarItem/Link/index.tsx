import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import { ThemeClassNames } from '@docusaurus/theme-common';
import { isActiveSidebarItem } from '@docusaurus/plugin-content-docs/client';
import Link from '@docusaurus/Link';
import isInternalUrl from '@docusaurus/isInternalUrl';
import IconExternalLink from '@theme/Icon/ExternalLink';
import type { Props } from '@theme/DocSidebarItem/Link';

import styles from './styles.module.css';

// ⭐ Added for icon support
import { SidebarIcon } from '../../IconResolver';

function LinkLabel({ label }: { label: string }) {
  return (
    <span title={label} className={styles.linkLabel}>
      {label}
    </span>
  );
}

export default function DocSidebarItemLink({
  item,
  onItemClick,
  activePath,
  level,
  index,
  ...props
}: Props): ReactNode {
  const { href, label, className, autoAddBaseUrl } = item;
  const isActive = isActiveSidebarItem(item, activePath);
  const isInternalLink = isInternalUrl(href);

  // ⭐ ICON EXTRACTION (safe typed)
  // Docs can define icons in frontmatter:
  // ---
  // icon: "UserRound"
  // ---
  const frontMatterIcon =
    (item as any).customProps?.icon ??
    (item as any).customProps?.sidebar_custom_props?.icon ??
    undefined;


  return (
    <li
      className={clsx(
        ThemeClassNames.docs.docSidebarItemLink,
        ThemeClassNames.docs.docSidebarItemLinkLevel(level),
        'menu__list-item',
        className,
      )}
      key={label}>
      <Link
        className={clsx(
          'menu__link',
          !isInternalLink && styles.menuExternalLink,
          {
            'menu__link--active': isActive,
          },
        )}
        autoAddBaseUrl={autoAddBaseUrl}
        aria-current={isActive ? 'page' : undefined}
        to={href}
        {...(isInternalLink && {
          onClick: onItemClick ? () => onItemClick(item) : undefined,
        })}
        {...props}
      >
        {/* ⭐ ICON + LABEL WRAPPER */}
        <span className="sidebar-item-with-icon">
          <SidebarIcon name={frontMatterIcon} className="sidebar-item-icon" />
          <LinkLabel label={label} />
        </span>

        {!isInternalLink && <IconExternalLink />}
      </Link>
    </li>
  );
}
