"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BadgeCheck,
  BellDot,
  BookOpenCheck,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  FileBadge,
  FileText,
  FolderOpen,
  Gamepad2,
  Gauge,
  Headphones,
  HelpCircle,
  LayoutDashboard,
  type LucideIcon,
  MessagesSquare,
  NotebookTabs,
  Settings,
  ShieldCheck,
  Stethoscope,
  TicketCheck,
  UserCog,
  UsersRound,
  Video,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { hasRole, type Role } from "@/lib/rbac";

type MenuItem = {
  label: string;
  path?: string;
  icon?: keyof typeof SIDEBAR_ICONS;
  children?: MenuItem[];
  collapsible?: boolean;
  requiredRole?: Role | Role[];
};

const SIDEBAR_ICONS = {
  dashboard: LayoutDashboard,
  admin_panel_settings: ShieldCheck,
  medical_services: Stethoscope,
  support_agent: Headphones,
  shield: ShieldCheck,
  task: ClipboardCheck,
  verified_user: BadgeCheck,
  groups: UsersRound,
  manage_accounts: UserCog,
  medical_information: NotebookTabs,
  assignment: ClipboardList,
  compare_arrows: Activity,
  task_alt: BookOpenCheck,
  check_circle: ClipboardCheck,
  assessment: FileBadge,
  event: CalendarClock,
  videocam: Video,
  folder: FolderOpen,
  description: FileText,
  sports_esports: Gamepad2,
  confirmation_number: TicketCheck,
  help_center: HelpCircle,
  settings: Settings,
  notifications: BellDot,
  messages: MessagesSquare,
  overview: Gauge,
} satisfies Record<string, LucideIcon>;

function SidebarIcon({ name, className }: { name?: keyof typeof SIDEBAR_ICONS; className?: string }) {
  const Icon = name ? SIDEBAR_ICONS[name] : LayoutDashboard;
  return <Icon className={className} strokeWidth={2} aria-hidden />;
}

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
        label: "Provider Verification",
        path: "/admin/approvals/providers",
        icon: "verified_user",
        requiredRole: "admin",
      },
      {
        label: "Users",
        path: "/admin/users",
        icon: "groups",
        requiredRole: "admin",
      },
      {
        label: "Roles & Access",
        path: "/admin/roles-access",
        icon: "verified_user",
        requiredRole: "admin",
      },
      {
        label: "Role Assignments",
        path: "/admin/role-assignments",
        icon: "manage_accounts",
        requiredRole: "admin",
      },
      {
        label: "Patient List",
        path: "/provider/cp-patient",
        icon: "groups",
        requiredRole: "provider",
      },
      {
        label: "Assessments",
        path: "/provider/assessments",
        icon: "assignment",
        requiredRole: "provider",
      },
      {
        label: "Referrals",
        path: "/provider/referrals",
        icon: "compare_arrows",
        requiredRole: "provider",
      },
      {
        label: "Tasks & Notes",
        path: "/provider/tasks",
        icon: "task_alt",
        requiredRole: "provider",
      },
      {
        label: "Care Plans",
        path: "/provider/care-plans",
        icon: "assignment",
        requiredRole: "provider",
      },
      {
        label: "Reports",
        path: "/admin/reports",
        icon: "assessment",
        requiredRole: ["admin", "provider"],
      },
      {
        label: "Appointments",
        path: "/provider/appointments",
        icon: "event",
        requiredRole: "provider",
      },
      {
        label: "Telehealth",
        path: "/provider/telehealth",
        icon: "videocam",
        requiredRole: "provider",
      },
      {
        label: "Documents",
        path: "/provider/resources",
        icon: "description",
        requiredRole: "provider",
      },
      {
        label: "Games & Wellbeing",
        path: "/provider/games",
        icon: "sports_esports",
        requiredRole: "provider",
      },
      {
        label: "My Tickets",
        path: "/support/tickets",
        icon: "confirmation_number",
        requiredRole: ["provider", "support"],
      },
      {
        label: "FAQ Database",
        path: "/support/faqs",
        icon: "help_center",
        requiredRole: ["provider", "support"],
      },
    ],
  },
];

const bottomSidebarSections: { title?: string; items: MenuItem[] }[] = [
  {
    title: "SYSTEM",
    items: [
      {
        label: "System Settings",
        path: "/settings",
        icon: "settings",
        collapsible: false,
        requiredRole: ["admin", "provider"],
      },
    ],
  },
];

type Props = {
  collapsed?: boolean;
};

const Sidebar: React.FC<Props> = ({ collapsed = false }) => {
  const pathname = usePathname() ?? '';
  const { user } = useAuth();

  /**
   * Menu visibility rules:
   * - MAIN section items: only shown if user has the exact required role
   * - WORKSPACES items: admin sees ALL workspaces (Admin + Provider + Support),
   *   other users only see their own workspace
   * - SYSTEM items: only shown if user has the exact required role
   */
  const canViewMenuItem = React.useCallback((item: MenuItem): boolean => {
    if (!user) return false;
    // Items with no requiredRole are always visible (e.g. Dashboard, Profile)
    if (!item.requiredRole) return true;
    const requiredRoles = Array.isArray(item.requiredRole) ? item.requiredRole : [item.requiredRole];

    if (hasRole(user, 'admin')) return true;
    
    // Users with explicit roles get access to their role's workspace
    if (requiredRoles.some((role) => hasRole(user, role))) return true;
    
    // SERVICE_PROVIDER userType gets access to provider workspace even without an assigned role
    if (user.userType === 'SERVICE_PROVIDER' && requiredRoles.includes('provider')) return true;
    
    return false;
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

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

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

  const handleGroupClick = (item: MenuItem) => {
    const key = item.label;
    setOpenGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLeafClick = (path: string) => {
    setSelectedKey(path);
  };

  const groupIsSelected = (group: MenuItem) => {
    if (itemOrChildMatchesPath(group)) return true;
    if (group.children)
      return group.children.some((c) => isPathSelected(c.path));
    if (group.path) return isPathSelected(group.path);
    return false;
  };

  const iconSizeClass = collapsed ? "h-4 w-4" : "h-[18px] w-[18px]";
  const itemFontClass = "text-[12px]";
  const itemPadding = collapsed ? "px-2 py-2" : "px-3 py-2.5";
  const itemGap = "gap-3";

  const renderChildrenExpanded = (children: MenuItem[]) =>
    children.filter(canViewMenuItem).map((child) => {
      const key = child.path ?? `group:${child.label}`;
      const isSelected =
        selectedKey === key || pathname === key || isPathSelected(child.path) || itemOrChildMatchesPath(child);
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
              style={{ color: isSelected ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)' }}
              title={child.label}
            >
              <SidebarIcon name={child.icon} className={iconSizeClass} />
              <span className="flex-1 text-left">{child.label}</span>
              <span className="text-[12px]" aria-hidden>{open ? "⌄" : "›"}</span>
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
          style={{ color: isSelected ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)' }}
          title={child.label}
        >
          <SidebarIcon name={child.icon} className={iconSizeClass} />
          <span className="text-left">{child.label}</span>
        </Link>
      );
    });

  const renderChildrenCollapsed = (children: MenuItem[]) =>
    children.filter(canViewMenuItem).map((child) => {
      const key = child.path ?? `group:${child.label}`;
      if (child.children) {
        return (
          <div key={key} className="flex flex-col items-center">
            <button
              onClick={() => handleGroupClick(child)}
              className="flex h-9 w-9 items-center justify-center rounded-md"
              style={{ color: 'var(--sidebar-text)' }}
              title={child.label}
              aria-label={child.label}
            >
              <SidebarIcon name={child.icon} className="h-4 w-4" />
            </button>
          </div>
        );
      }
      return (
        <Link
          key={key}
          href={child.path ?? "#"}
          onClick={() => child.path && handleLeafClick(child.path)}
          className="flex h-9 w-9 items-center justify-center rounded-md"
          style={{ color: 'var(--sidebar-text)' }}
          title={child.label}
          aria-label={child.label}
        >
          <SidebarIcon name={child.icon} className="h-4 w-4" />
        </Link>
      );
    });

  function renderSection(
    section: { title?: string; items: MenuItem[] },
    keyPrefix: string,
  ) {
    return (
      <div key={keyPrefix}>
        {!collapsed && section.title && (
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--color-brand)' }}>
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
                    style={{ color: groupSel ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)' }}
                    title={item.label}
                  >
                    <SidebarIcon name={item.icon} className={iconSizeClass} />
                    {!collapsed && (
                      <span className="flex-1 text-left">{item.label}</span>
                    )}
                    {!collapsed && (
                      <span className="text-sm transition-transform" aria-hidden>{open ? "⌄" : "›"}</span>
                    )}
                  </button>
                  {!collapsed && open && (
                    <div className="mt-1 space-y-1 pl-4">
                      {renderChildrenExpanded(item.children)}
                    </div>
                  )}
                  {collapsed && open && (
                    <div
                      className="absolute top-0 z-10 w-48 rounded-md border py-1 shadow-lg sidebar-shadow"
                      style={{
                        borderColor: 'var(--sidebar-border)',
                        backgroundColor: 'var(--sidebar-bg)',
                        color: 'var(--sidebar-text)',
                      }}
                    >
                      {renderChildrenCollapsed(item.children)}
                    </div>
                  )}
                </div>
              );
            }

            const key = item.path ?? groupKey;
            const isSel = selectedKey === key || pathname === key || isPathSelected(item.path);
            const isHoveredItem = hoveredKey === key;

            return (
              <Link
                key={key}
                href={item.path ?? "#"}
                onClick={() => item.path && handleLeafClick(item.path)}
                onMouseEnter={() => setHoveredKey(key)}
                onMouseLeave={() => setHoveredKey(null)}
                className={`flex items-center ${itemGap} ${itemPadding} rounded-md ${itemFontClass} ${isSel ? "sidebar-selected" : isHoveredItem ? "sidebar-hovered" : ""}`}
                style={{ color: isSel ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)' }}
                title={item.label}
              >
                <SidebarIcon name={item.icon} className={iconSizeClass} />
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
      className={`flex h-screen flex-col sidebar-shadow ${collapsed ? 'sidebar-width-collapsed' : 'sidebar-width'}`}
      style={{
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
      }}
    >
      <div className={`flex items-center px-4 py-4 ${collapsed ? 'justify-center' : 'justify-start'}`}>
        <Link href="/" className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div
            className={`relative shrink-0 ${collapsed ? "h-9 w-9 min-w-9 min-h-9" : "h-12 w-12 min-w-12 min-h-12"}`}
          >
            <Image
              src="/logo.png"
              alt="GmNC"
              fill
              sizes={collapsed ? "36px" : "48px"}
              className="rounded-md object-contain"
              style={{ filter: 'drop-shadow(0 0 0 transparent)' }}
            />
          </div>

          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span
                className="text-sm font-black leading-tight tracking-wide"
                style={{ color: 'var(--color-brand)' }}
              >
                GMNC
              </span>
              <span className="text-[10px] font-semibold tracking-[0.08em]" style={{ color: 'var(--sidebar-muted)' }}>
                GET MY NEURO CARE
              </span>
            </div>
          )}
        </Link>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <nav
          className="scrollbar-none flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-3 py-2"
        >
          {visibleTopSidebarSections.map((section, idx) =>
            renderSection(section, `top-${idx}`),
          )}
        </nav>

        <div className="px-3 pt-2 pb-3">
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
