import { useEffect, useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import axiosInstance from "@/lib/axios";

const statsConfig = {
  sale: { color: 'bg-blue-100 text-blue-700', icon: <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /> },
  enrollments: { color: 'bg-purple-100 text-purple-700', icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></> },
  courses: { color: 'bg-orange-100 text-orange-700', icon: <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /> },
  instructors: { color: 'bg-indigo-100 text-indigo-700', icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></> },
  organizations: { color: 'bg-pink-100 text-pink-700', icon: <><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></> },
  students: { color: 'bg-teal-100 text-teal-700', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></> },
};

const StatIcon = ({ children }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {children}
  </svg>
);

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState({ enrollments: [], orders: [] });
  const [stats, setStats] = useState({
    totalSale: 0,
    totalEnrollments: 0,
    totalCourses: 0,
    totalInstructors: 0,
    totalOrganizations: 0,
    totalStudents: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [enrollRes, usersRes, coursesRes, ordersRes] = await Promise.all([
          axiosInstance.get('/enrolled-courses?limit=1000'), // Adjust limit to get enough data for the year
          axiosInstance.get('/users?fields=name,role'),
          axiosInstance.get('/courses?fields=title'),
          axiosInstance.get('/order?limit=1000'), 
        ]);

        const allUsers = usersRes.data?.data?.result || [];
        const enrollments = enrollRes.data?.data?.result || [];
        const orders = ordersRes.data?.data?.result || [];

        setRawData({ enrollments, orders });

        setStats({
          totalEnrollments: enrollRes.data?.data?.meta?.total || 0,
          totalCourses: coursesRes.data?.data?.meta?.total || 0,
          totalSale: orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0),
          totalInstructors: allUsers.filter((u) => u.role === 'instructor').length,
          totalStudents: allUsers.filter((u) => u.role === 'student').length,
          totalOrganizations: allUsers.filter((u) => u.role === 'company').length,
        });
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Process data for the chart
  const chartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();

    // Initialize the structure
    const dataMap = months.map(month => ({
      month,
      sales: 0,
      enrollments: 0
    }));

    // Aggregate Enrollments
    rawData.enrollments.forEach(item => {
      const date = new Date(item.createdAt);
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        dataMap[monthIndex].enrollments += 1;
      }
    });

    // Aggregate Sales
    rawData.orders.forEach(item => {
      const date = new Date(item.createdAt);
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        dataMap[monthIndex].sales += (item.totalAmount || 0);
      }
    });

    return dataMap;
  }, [rawData]);

  const displayStats = [
    { title: 'Total Sale', value: `$${stats.totalSale.toLocaleString()}`, ...statsConfig.sale },
    { title: 'Total Enrollments', value: stats.totalEnrollments, ...statsConfig.enrollments },
    { title: 'Total Courses', value: stats.totalCourses, ...statsConfig.courses },
    { title: 'Total Instructors', value: stats.totalInstructors, ...statsConfig.instructors },
    { title: 'Total Organization', value: stats.totalOrganizations, ...statsConfig.organizations },
    { title: 'Total Students', value: stats.totalStudents, ...statsConfig.students },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Welcome Back, Academine 👋</h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <StatIcon>{stat.icon}</StatIcon>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <span className="animate-pulse">...</span> : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales & Enrollments Performance ({new Date().getFullYear()})</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }}
                formatter={(value, name) => [name === 'sales' ? `$${value}` : value, name.charAt(0).toUpperCase() + name.slice(1)]}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="sales" name="Sales ($)" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line yAxisId="right" type="monotone" dataKey="enrollments" name="Enrollments" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}