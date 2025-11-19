"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname if items not provided
  const breadcrumbs = items || generateBreadcrumbs(pathname);

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors smooth-fast"
      >
        <Home className="w-4 h-4" />
      </Link>

      {breadcrumbs.map((item, index) => (
        <div key={item.href} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600" />

          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-gray-900 dark:text-white">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors smooth-fast"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  let currentPath = "";

  // Map of path segments to readable labels
  const labelMap: Record<string, string> = {
    dashboard: "Dashboard",
    sales: "Sales",
    orders: "Orders",
    customers: "Customers",
    products: "Products",
    mailchimp: "MailChimp",
    expenses: "Expenses",
    settings: "Settings",
  };

  paths.forEach((path, index) => {
    // Skip the first "dashboard" as it's represented by the home icon
    if (index === 0 && path === "dashboard") {
      return;
    }

    currentPath += `/${path}`;
    breadcrumbs.push({
      label: labelMap[path] || capitalize(path),
      href: currentPath,
    });
  });

  return breadcrumbs;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
