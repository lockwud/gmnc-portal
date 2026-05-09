"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { COLORS } from "@/lib/colors";

type MenuItem = {
  label: string;
  path?: string;
  icon?: string;
  children?: MenuItem[];
  collapsible?: boolean;
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
      },
      {
        label: "Admin Dashboard",
        path: "/admin",
        icon: "admin_panel_settings",
        collapsible: false,
      },
      {
        label: "Provider Dashboard",
        path: "/provider",
        icon: "medical_services",
        collapsible: false,
      },
      {
        label: "Support Dashboard",
        path: "/support",
        icon: "support_agent",
        collapsible: false,
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
        children: [
          { label: "Analytics", path: "/admin/analytics", icon: "insights" },
          { label: "Inbox", path: "/admin/inbox", icon: "inbox" },
          { label: "Users", path: "/admin/users", icon: "groups" },
          {
            label: "Roles & Access",
            path: "/admin/roles",
            icon: "verified_user",
          },
          { label: "Audit Viewer", path: "/admin/audit", icon: "history" },
        ],
      },
      {
        label: "Provider",
        icon: "medical_services",
        collapsible: true,
        children: [
          {
            label: "Patients",
            icon: "groups",
            collapsible: true,
            children: [
              {
                label: "Patient List",
                path: "/provider/clients",
                icon: "groups",
              },
              {
                label: "Enrollments",
                path: "/provider/enrollments",
                icon: "person_add",
              },
              {
                label: "Care Plans",
                path: "/provider/care-plans",
                icon: "favorite",
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
                label: "PDF Resources",
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
          {
            label: "Insights",
            icon: "analytics",
            collapsible: true,
            children: [
              {
                label: "Metrics",
                path: "/provider/metrics",
                icon: "query_stats",
              },
            ],
          },
        ],
      },
      {
        label: "Support",
        icon: "support_agent",
        collapsible: true,
        children: [
          { label: "FAQ Database", path: "/support/faqs", icon: "help_center" },
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
      },
      {
        label: "Audit Logs",
        path: "/audit-logs",
        icon: "history",
        collapsible: false,
      },
      {
        label: "System Settings",
        path: "/settings",
        icon: "settings",
        collapsible: false,
      },
    ],
  },
];

type Props = {
  collapsed?: boolean;
};

const Sidebar: React.FC<Props> = ({ collapsed = false }) => {
  const pathname = usePathname();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [collapsedOpenGroup, setCollapsedOpenGroup] = useState<string | null>(
    null,
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  useEffect(() => {
    setSelectedKey(pathname ?? null);
  }, [pathname]);

  const toggleGroup = (groupLabel: string) =>
    setOpenGroups((prev) => ({ ...prev, [groupLabel]: !prev[groupLabel] }));

  const handleGroupClick = (item: MenuItem) => {
    const key = `group:${item.label}`;
    setSelectedKey(key);
    if (collapsed)
      setCollapsedOpenGroup((p) => (p === item.label ? null : item.label));
    else toggleGroup(item.label);
  };

  const handleLeafClick = (path: string) => setSelectedKey(path);

  const sidebarWidth = collapsed ? 56 : 220;

  const iconSizeClass = "text-xs";
  const itemFontClass = "text-[11px]";
  const itemPadding = "px-2 py-1.5";
  const itemGap = "gap-2";
  const groupHeaderPadding = "px-2 py-1";
  const childItemPadding = "px-3 py-1";
  const childFont = "text-[10px]";

  const SELECT_BG = "#059669";
  const SELECT_TEXT = "#ffffff";
  const HOVER_BG = "#D1FAE5";

  const groupIsSelected = (group: MenuItem) => {
    const gkey = `group:${group.label}`;
    if (selectedKey === gkey) return true;
    if (group.children)
      return group.children.some((c) => selectedKey === c.path);
    if (group.path) return selectedKey === group.path;
    return false;
  };

  const renderChildrenExpanded = (children: MenuItem[]) =>
    children.map((child) => {
      const key = child.path ?? `group:${child.label}`;
      const isSelected = selectedKey === key;
      const isHovered = hoveredKey === key;
      const bg = isSelected ? SELECT_BG : isHovered ? HOVER_BG : "transparent";
      const color = isSelected ? SELECT_TEXT : COLORS.text;

      if (child.children) {
        const open = !!openGroups[child.label];
        return (
          <div key={key}>
            <button
              onClick={() => {
                setSelectedKey(`group:${child.label}`);
                toggleGroup(child.label);
              }}
              onMouseEnter={() => setHoveredKey(`group:${child.label}`)}
              onMouseLeave={() => setHoveredKey(null)}
              className={`w-full flex items-center ${itemGap} ${groupHeaderPadding} rounded-md ${itemFontClass}`}
              style={{ background: bg, color }}
            >
              <span className={`material-icons ${iconSizeClass}`}>
                {child.icon}
              </span>
              <span className="flex-1 text-left">{child.label}</span>
              <span className="material-icons text-[12px]" aria-hidden>
                {open ? "expand_more" : "chevron_right"}
              </span>
            </button>

            {open && (
              <div className="pl-4 mt-1 space-y-1">
                {child.children.map((gc) => (
                  <Link
                    key={gc.path}
                    href={gc.path!}
                    onClick={() => handleLeafClick(gc.path!)}
                    onMouseEnter={() => setHoveredKey(gc.path!)}
                    onMouseLeave={() => setHoveredKey(null)}
                    className={`flex items-center gap-2 ${childItemPadding} rounded-md ${childFont}`}
                    style={{
                      background:
                        selectedKey === gc.path ? SELECT_BG : "transparent",
                      color:
                        selectedKey === gc.path ? SELECT_TEXT : COLORS.text,
                    }}
                  >
                    <span className={`material-icons ${iconSizeClass}`}>
                      {gc.icon}
                    </span>
                    <span>{gc.label}</span>
                  </Link>
                ))}
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
          className={`flex items-center ${itemGap} ${itemPadding} rounded-md ${itemFontClass}`}
          style={{ background: bg, color }}
        >
          <span className={`material-icons ${iconSizeClass}`}>
            {child.icon}
          </span>
          <span className="text-left">{child.label}</span>
        </Link>
      );
    });

  const renderChildrenCollapsed = (children: MenuItem[]) =>
    children.map((child) => {
      const key = child.path ?? `group:${child.label}`;
      const isSelected = selectedKey === key;
      const bg = isSelected ? SELECT_BG : "transparent";
      const color = isSelected ? SELECT_TEXT : COLORS.text;

      if (child.children) {
        return (
          <div key={key} className="w-full">
            <button
              onClick={() => {
                setSelectedKey(`group:${child.label}`);
                setCollapsedOpenGroup((p) =>
                  p === child.label ? null : child.label,
                );
              }}
              onMouseEnter={() => setHoveredKey(`group:${child.label}`)}
              onMouseLeave={() => setHoveredKey(null)}
              className="w-full flex items-center justify-center p-2 rounded-md"
              title={child.label}
              style={{ background: bg, color }}
            >
              <span className={`material-icons ${iconSizeClass}`}>
                {child.icon}
              </span>
            </button>

            {collapsedOpenGroup === child.label && (
              <div className="flex flex-col items-center mt-1 space-y-1">
                {child.children.map((gc) => (
                  <Link
                    key={gc.path}
                    href={gc.path!}
                    onClick={() => handleLeafClick(gc.path!)}
                    className="w-full flex items-center justify-center p-2 rounded-md"
                    title={gc.label}
                    style={{
                      background:
                        selectedKey === gc.path ? SELECT_BG : "transparent",
                      color:
                        selectedKey === gc.path ? SELECT_TEXT : COLORS.text,
                    }}
                  >
                    <span className={`material-icons ${iconSizeClass}`}>
                      {gc.icon}
                    </span>
                  </Link>
                ))}
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
          className="w-full flex items-center justify-center p-2 rounded-md"
          title={child.label}
          style={{ background: bg, color }}
        >
          <span className={`material-icons ${iconSizeClass}`}>
            {child.icon}
          </span>
        </Link>
      );
    });

  const renderSection = (
    section: { title?: string; items: MenuItem[] },
    keyPrefix: string,
  ) => (
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
          const groupBg = groupSel ? SELECT_BG : "transparent";
          const groupColor = groupSel ? SELECT_TEXT : COLORS.text;

          if (item.children && item.collapsible !== false) {
            const open = !!openGroups[item.label];
            return (
              <div key={item.label} className="relative">
                <button
                  onClick={() => handleGroupClick(item)}
                  onMouseEnter={() => setHoveredKey(groupKey)}
                  onMouseLeave={() => setHoveredKey(null)}
                  className={`w-full flex items-center ${itemGap} ${itemPadding} rounded-md ${itemFontClass}`}
                  title={item.label}
                  style={{ background: groupBg, color: groupColor }}
                >
                  <span className={`material-icons ${iconSizeClass}`}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="flex-1 text-left">{item.label}</span>
                  )}
                  {!collapsed && (
                    <span className="material-icons text-[12px]" aria-hidden>
                      {open ? "expand_more" : "chevron_right"}
                    </span>
                  )}
                </button>

                {!collapsed && open && (
                  <div className="mt-1 space-y-1 pl-4">
                    {renderChildrenExpanded(item.children)}
                  </div>
                )}

                {collapsed && collapsedOpenGroup === item.label && (
                  <div className="mt-1 flex flex-col items-center space-y-1">
                    {renderChildrenCollapsed(item.children)}
                  </div>
                )}
              </div>
            );
          }

          const key = item.path ?? groupKey;
          const isSel = selectedKey === key;
          const bg = isSel ? SELECT_BG : "transparent";
          const color = isSel ? SELECT_TEXT : COLORS.text;

          return (
            <Link
              key={key}
              href={item.path ?? "#"}
              onClick={() => item.path && handleLeafClick(item.path)}
              onMouseEnter={() => setHoveredKey(key)}
              onMouseLeave={() => setHoveredKey(null)}
              className={`flex items-center ${itemGap} ${itemPadding} rounded-md ${itemFontClass}`}
              title={item.label}
              style={{ background: bg, color }}
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

  return (
    <aside
      className="flex h-screen flex-col border-r border-slate-200 bg-white"
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        background: COLORS.sidebarBg,
      }}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 px-2 py-2">
        <Link href="/" className="flex items-center gap-2">
          <div
            className={`relative flex-shrink-0 ${collapsed ? "h-9 w-9" : "h-12 w-12"}`}
            style={{
              minWidth: collapsed ? 36 : 48,
              minHeight: collapsed ? 36 : 48,
            }}
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
                className="text-sm font-semibold text-emerald-600"
                style={{ lineHeight: 1 }}
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
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {topSidebarSections.map((section, idx) =>
            renderSection(section, `top-${idx}`),
          )}
        </nav>

        <div className="border-t border-slate-100 px-1 pt-1.5 pb-1">
          <div className="space-y-2">
            {bottomSidebarSections.map((section, idx) =>
              renderSection(section, `bottom-${idx}`),
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
