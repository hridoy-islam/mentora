import * as React from 'react';
import {
  IconDashboard,
  IconUsers,
  IconBook,
  IconCalendarTime,
  IconClipboardList,
  IconLayoutGrid,
  IconSettings,
  IconSchool,
  IconUser,
  IconHelp,
  IconSearch
} from '@tabler/icons-react'; // Kept your original imports

import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Box,
  Settings,
  UserRoundSearch,
  GraduationCap,
  Award,
  HelpCircle,
  ClipboardCheck,
  Star,
  CreditCard,
  Headset,
  Bell,
  Heart,
  Briefcase,
  BarChart3,
  Building,
  Calculator,
  Archive,
  DollarSign
} from 'lucide-react';
import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import { useSelector } from 'react-redux';

// --- 1. Define Navigation Items for Each Role ---

const adminNav = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'User Management',
    icon: Users,
    items: [
      { title: 'Organization', url: '/dashboard/organizations' },
      { title: 'Instructor', url: '/dashboard/instructors' },
      { title: 'Student', url: '/dashboard/students' }
    ]
  },
  {
    title: 'Course Manage',
    icon: Box,
    items: [
      { title: 'Category', url: '/dashboard/categories' },
      { title: 'Course', url: '/dashboard/courses' }
    ]
  },
  {
    title: 'Report',
    url: '/dashboard/report',
    icon: Calculator
  },
  {
    title: 'Setting',
    icon: Settings,
    items: [
      // { title: 'Profile', url: '#' },
      { title: 'Email', url: '#' }
    ]
  }
];

const instructorNav = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'My Courses',
    icon: Box,
    items: [
      { title: 'All Courses', url: '/dashboard/instructor/courses' },
      { title: 'Create Course', url: '/dashboard/instructor/create-course' }
    ]
  },
  {
    title: 'Student Management',
    icon: Users,
    items: [
      { title: 'Enrolled Students', url: '/dashboard/instructor/students' },
      { title: 'Reviews', url: '/dashboard/instructor/reviews' },
      { title: 'Q&A', url: '/dashboard/instructor/q-and-a' }
    ]
  },
  {
    title: 'Payouts',
    url: '/dashboard/instructor/payouts',
    icon: CreditCard
  },
  {
    title: 'Support',
    url: '/dashboard/support',
    icon: Headset
  },
  {
    title: 'Settings',
    url: '/dashboard/settings/profile',
    icon: Settings
  }
];

const companyNav = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'My Staff',
    url: '/dashboard/my-staff',
    icon: Users
  },

  {
    title: 'Courses',
    url: '/dashboard/company/courses',
    icon: Box
  },

  {
    title: 'Transactions',
    url: '/dashboard/transactions',
    icon: DollarSign
  }
  // {
  //   title: 'Company Profile',
  //   url: '/dashboard/profile',
  //   icon: Building,
  // },
];

// --- 2. Helper function to get nav items ---
const getNavItemsByRole = (role: string) => {
  switch (role) {
    case 'admin':
      return adminNav;

    case 'instructor':
      return instructorNav;
    case 'company':
      return companyNav;
    default:
      return []; // Return empty for unknown roles or guests
  }
};

// --- 3. Main Sidebar Component ---
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useSelector((state: any) => state.auth);
  const [userData, setUserData] = useState(null);

  // Fetch user details (for footer)
  useEffect(() => {
    const fetchData = async () => {
      if (user?._id) {
        try {
          const response = await axiosInstance.get(`/users/${user._id}`);
          setUserData(response?.data?.data);
        } catch (error) {
          console.error('Failed to fetch user data', error);
        }
      }
    };
    fetchData();
  }, [user]);

  // --- 4. Use useMemo to dynamically select nav items based on role ---
  const navItems = React.useMemo(
    () => getNavItemsByRole(user?.role),
    [user?.role]
  );

  return (
    <Sidebar
      collapsible="offcanvas"
      {...props}
      // Corrected class names for clarity
      className="w-64 min-w-64 border-none"
    >
      <SidebarHeader className="flex h-14 items-center justify-center border-b border-gray-300">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="data-[slot=sidebar-menu-button]:!p-2">
              <div className="flex items-center justify-center gap-2">
                <img
                  src="/logo.png"
                  alt="Medicare Training"
                  className="h-auto w-28 shrink-0"
                />
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="mt-2">
        {/* --- 5. Pass the dynamic navItems to NavMain --- */}
        <NavMain items={navItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
