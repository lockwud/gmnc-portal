"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { hasWorkspaceAccess, type Role } from "@/lib/rbac";

type MenuItem = {
  label: string;
  path?: string;
  icon?: string;
  children?: MenuItem[];
  collapsible?: boolean;
  requiredRole?: Role;
};

const topSidebarSections: { title?: string; items: MenuItem[] }[] = [
  {
    title: "MAIN",
    items: [
      {
        label: "Overview",
        path: "/dashboard",
        icon: "dashboard",
        collapsible: false,
        requiredRole: "tester",
      },
      {
        label: "Admin Dashboard",
        path: "/admin",
        icon: "admin_panel_settings",
        collapsible: false,
        requiredRole: "admin",
      },
      {
        label: "Provider Dashboard",
        path: "/provider",
        icon: "medical_services",
        collapsible: false,
        requiredRole: "provider",
      },
      {
        label: "Support Dashboard",
        path: "/support",
        icon: "support_agent",
        collapsible: false,
        requiredRole: "support",
      },
    ],
  },
  {
    title: "WORKSPACES",
    items: [
      {
        label: "Admin",
        icon: "shield",
        collapsible: true,
        requiredRole: "admin",
        children: [
          {
            label: "Approvals",
            path: "/admin/approvals",
            icon: "task",
            collapsible: true,
            children: [
              {
                label: "Provider Verification",
                path: "/admin/approvals/providers",
                icon: "verified_user",
              },
            ],
          },
          {
            label: "Users",
            path: "/admin/users",
            icon: "groups",
          },
          {
            label: "Roles & Access",
            path: "/admin/roles-access",
            icon: "verified_user",
          },
          {
            label: "Role Assignments",
            path: "/admin/role-assignments",
            icon: "manage_accounts",
          },
        ],
      },
      {
        label: "Provider",
        icon: "medical_services",
        collapsible: true,
        requiredRole: "provider",
        children: [
          {
            label: "Patients",
            icon: "groups",
            collapsible: true,
            children: [
              {
                label: "Patient List",
                path: "/provider/cp-patient",
                icon: "groups",
              },
            ],
          },
          {
            label: "Clinical Work",
            icon: "medical_information",
            collapsible: true,
            children: [
              {
                label: "Assessments",
                path: "/provider/assessments",
                icon: "assignment",
              },
              {
                label: "Referrals",
                path: "/provider/referrals",
                icon: "compare_arrows",
              },
              {
                label: "Tasks & Notes",
                path: "/provider/tasks",
                icon: "task_alt",
              },
              {
                label: "Approvals",
                path: "/provider/approvals",
                icon: "check_circle",
              },
            ],
          },
          {
            label: "Scheduling",
            icon: "event",
            collapsible: true,
            children: [
              {
                label: "Appointments",
                path: "/provider/appointments",
                icon: "event",
              },
              {
                label: "Telehealth",
                path: "/provider/telehealth",
                icon: "videocam",
              },
            ],
          },
          {
            label: "Resources",
            icon: "folder",
            collapsible: true,
            children: [
              {
              label: "Documents",
              path: "/provider/resources",
              icon: "description",
            },
              {
                label: "Games & Wellbeing",
                path: "/provider/games",
                icon: "sports_esports",
              },
            ],
          },

        ],
      },
      {
        label: "Support",
        icon: "support_agent",
        collapsible: true,
        requiredRole: "support",
        children: [
          {
            label: "FAQ Database",
            path: "/support/faqs",
            icon: "help_center",
          },
        ],
      },
    ],
  },
];

const bottomSidebarSections: { title?: string; items: MenuItem[] }[] = [
  {
    title: "SYSTEM",
    items: [
      {
        label: "Reports",
        path: "/reports",
        icon: "assessment",
        collapsible: false,
        requiredRole: "admin",
      },

      {
        label: "System Settings",
        path: "/settings",
        icon: "settings",
        collapsible: false,
        requiredRole: "admin",
      },
    ],
  },
];

type Props = {
  collapsed?: boolean;
};

const Sidebar: React.FC<Props> = ({ collapsed = false }) => {
  const pathname = usePathname();
  const { user } = useAuth();

  const canViewMenuItem = React.useCallback((item: MenuItem): boolean => {
    if (!user) return false;
    if (item.requiredRole && !hasWorkspaceAccess(user, item.requiredRole)) return false;
    return true;
  }, [user]);

  const visibleTopSidebarSections = useMemo(
    () => topSidebarSections
      .map((section) => ({
        ...section,
        items: section.items.filter(canViewMenuItem),
      }))
      .filter((section) => section.items.length > 0),
    [canViewMenuItem],
  );

  const visibleBottomSidebarSections = useMemo(
    () => bottomSidebarSections
      .map((section) => ({
        ...section,
        items: section.items.filter(canViewMenuItem),
      }))
      .filter((section) => section.items.length > 0),
    [canViewMenuItem],
  );

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  // NEW: openGroups state for expanded/collapsed groups
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Only set selectedKey on initial mount
  const didSetSelectedKey = useRef(false);
  useEffect(() => {
    if (!didSetSelectedKey.current) {
      setSelectedKey(pathname ?? null);
      didSetSelectedKey.current = true;
    }
  }, [pathname]);

  const isPathSelected = React.useCallback(
    (path?: string) => {
      return !!(path && pathname && (pathname === path || pathname.startsWith(`${path}/`)));
    },
    [pathname]
  );

  const itemOrChildMatchesPath = React.useCallback((item: MenuItem): boolean => {
    const recur = (itm: MenuItem): boolean => {
      if (isPathSelected(itm.path)) return true;
      if (!itm.children) return false;
      return itm.children.some(recur);
    };
    return recur(item);
  }, [isPathSelected]);

  // Helper: handleGroupClick
  const handleGroupClick = (item: MenuItem) => {
    const key = item.label;
    setOpenGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSelectedKey(`group:${item.label}`);
  };

  // Helper: handleLeafClick
  const handleLeafClick = (path: string) => setSelectedKey(path);

  // Helper: groupIsSelected
  const groupIsSelected = (group: MenuItem) => {
    const gkey = `group:${group.label}`;
    if (selectedKey === gkey) return true;
    if (itemOrChildMatchesPath(group)) return true;
    if (group.children)
      return group.children.some((c) => selectedKey === c.path);
    if (group.path) return selectedKey === group.path;
    return false;
  };

  // Constants for styling
  const iconSizeClass = "text-xs";
  const itemFontClass = "text-[11px]";
  const itemPadding = "px-2 py-1.5";
  const itemGap = "gap-2";

  // Helper: renderChildrenExpanded
  const renderChildrenExpanded = (children: MenuItem[]) =>
    children.map((child) => {
      const key = child.path ?? `group:${child.label}`;
      const isSelected =
        selectedKey === key || isPathSelected(child.path) || itemOrChildMatchesPath(child);
      const isHovered = hoveredKey === key;

      if (child.children) {
        const open = !!openGroups[child.label];
        return (
          <div key={key}>
            <button
              onClick={() => handleGroupClick(child)}
              onMouseEnter={() => setHoveredKey(key)}
              onMouseLeave={() => setHoveredKey(null)}
              className={`w-full flex items-center ${itemGap} ${itemPadding} rounded-md ${itemFontClass} ${isSelected ? "sidebar-selected" : isHovered ? "sidebar-hovered" : ""}`}
              title={child.label}
            >
              <span className={`material-icons ${iconSizeClass}`}>{child.icon}</span>
              <span className="flex-1 text-left">{child.label}</span>
              <span className="material-icons text-[12px]" aria-hidden>
                {open ? "expand_more" : "chevron_right"}
              </span>
            </button>
            {open && (
              <div className="mt-1 space-y-1 pl-4">
                {renderChildrenExpanded(child.children)}
              </div>
            )}
          </div>
        );
      }

      return (
        <Link
          key={key}
          href={child.path ?? "#"}
          onClick={() => child.path && handleLeafClick(child.path)}
          onMouseEnter={() => setHoveredKey(key)}
          onMouseLeave={() => setHoveredKey(null)}
          className={`flex items-center ${itemGap} ${itemPadding} rounded-md ${itemFontClass} ${isSelected ? "sidebar-selected" : isHovered ? "sidebar-hovered" : ""}`}
          title={child.label}
        >
          <span className={`material-icons ${iconSizeClass}`}>{child.icon}</span>
          <span className="text-left">{child.label}</span>
        </Link>
      );
    });

  // Helper: renderChildrenCollapsed
  const renderChildrenCollapsed = (children: MenuItem[]) =>
    children.map((child) => {
      const key = child.path ?? `group:${child.label}`;
      if (child.children) {
        return (
          <div key={key} className="flex flex-col items-center">
            <button
              onClick={() => handleGroupClick(child)}
              className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-slate-100"
              title={child.label}
              aria-label={child.label}
            >
              <span className="material-icons text-xs">{child.icon}</span>
            </button>
          </div>
        );
      }
      return (
        <Link
          key={key}
          href={child.path ?? "#"}
          onClick={() => child.path && handleLeafClick(child.path)}
          className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-slate-100"
          title={child.label}
          aria-label={child.label}
        >
          <span className="material-icons text-xs">{child.icon}</span>
        </Link>
      );
    });

  // Place this inside Sidebar, before return
  function renderSection(
    section: { title?: string; items: MenuItem[] },
    keyPrefix: string,
  ) {
    return (
      <div key={keyPrefix}>
        {!collapsed && section.title && (
          <p className="mb-1 px-2 text-[10px] font-semibold uppercase text-emerald-600">
            {section.title}
          </p>
        )}

        <div className="space-y-1">
          {section.items.map((item) => {
            const groupKey = `group:${item.label}`;
            const groupSel = groupIsSelected(item);

            if (item.children && item.collapsible !== false) {
              const open = !!openGroups[item.label];
              return (
                <div key={item.label} className="relative">
                  <button
                    onClick={() => handleGroupClick(item)}
                    onMouseEnter={() => setHoveredKey(groupKey)}
                    onMouseLeave={() => setHoveredKey(null)}
                    className={`w-full flex items-center ${itemGap} ${itemPadding} rounded-md ${itemFontClass} ${groupSel ? "sidebar-selected" : hoveredKey === groupKey ? "sidebar-hovered" : ""}`}
                    title={item.label}
                  >
                    <span className={`material-icons ${iconSizeClass}`}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className="flex-1 text-left">{item.label}</span>
                    )}
                    {!collapsed && (
                      <span
                        className="material-icons transition-transform"
                        aria-hidden
                      >
                        {open ? "expand_less" : "expand_more"}
                      </span>
                    )}
                  </button>
                  {!collapsed && open && (
                    <div className="mt-1 space-y-1 pl-4">
                      {renderChildrenExpanded(item.children)}
                    </div>
                  )}
                  {collapsed && open && (
                    <div className="absolute top-0 z-10 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg sidebar-shadow">
                      {renderChildrenCollapsed(item.children)}
                    </div>
                  )}
                </div>
              );
            }

            const key = item.path ?? groupKey;
            const isSel = selectedKey === key || isPathSelected(item.path);
            const isHoveredItem = hoveredKey === key;

            return (
              <Link
                key={key}
                href={item.path ?? "#"}
                onClick={() => item.path && handleLeafClick(item.path)}
                onMouseEnter={() => setHoveredKey(key)}
                onMouseLeave={() => setHoveredKey(null)}
                className={`flex items-center ${itemGap} ${itemPadding} rounded-md ${itemFontClass} ${isSel ? "sidebar-selected" : isHoveredItem ? "sidebar-hovered" : ""}`}
                title={item.label}
              >
                <span className={`material-icons ${iconSizeClass}`}>
                  {item.icon}
                </span>
                {!collapsed && <span className="text-left">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <aside
      className={`flex h-screen flex-col border-r border-slate-200 bg-white sidebar-shadow sidebar-width`}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 px-2 py-2">
        <Link href="/" className="flex items-center gap-2">
          <div
            className={`relative shrink-0 ${collapsed ? "h-9 w-9 min-w-9 min-h-9" : "h-12 w-12 min-w-12 min-h-12"}`}
          >
            <Image
              src="/logo.png"
              alt="GmNC"
              fill
              sizes={collapsed ? "36px" : "48px"}
              className="rounded-md object-contain"
            />
          </div>

          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span
                className="text-sm font-semibold text-emerald-600 leading-tight"
              >
                GMNC
              </span>
              <span className="text-[11px] text-gray-400">
                GET MY NEURO CARE
              </span>
            </div>
          )}
        </Link>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <nav
          className="no-scrollbar flex-1 space-y-3 overflow-y-auto overflow-x-hidden px-1 py-2"
        >
          {visibleTopSidebarSections.map((section, idx) =>
            renderSection(section, `top-${idx}`),
          )}
        </nav>

        <div className="border-t border-slate-100 px-1 pt-1.5 pb-1">
          <div className="space-y-2">
            {visibleBottomSidebarSections.map((section, idx) =>
              renderSection(section, `bottom-${idx}`)
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
