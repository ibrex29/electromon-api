export interface DashboardNavItem {
    href: string;
    label: string;
    icon?: string;
}
export declare function getNavItemsForRole(role?: string): DashboardNavItem[];
export declare function getDefaultDashboardPath(role?: string): string;
