import { useEffect, useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
} from 'recharts';
import { motion } from 'framer-motion';
import axiosInstance from "@/lib/axios";
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import moment from 'moment';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Enhanced modern icons
const statsConfig = {
  sale: { 
    color: 'bg-gradient-to-br from-blue-500 to-blue-600', 
    textColor: 'text-blue-600',
    bgLight: 'bg-blue-50',
    icon: <DollarSign className="h-5 w-5" />,
  },
  enrollments: { 
    color: 'bg-gradient-to-br from-purple-500 to-purple-600', 
    textColor: 'text-purple-600',
    bgLight: 'bg-purple-50',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  courses: { 
    color: 'bg-gradient-to-br from-orange-500 to-orange-600', 
    textColor: 'text-orange-600',
    bgLight: 'bg-orange-50',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      </svg>
    ),
  },
  instructors: { 
    color: 'bg-gradient-to-br from-indigo-500 to-indigo-600', 
    textColor: 'text-indigo-600',
    bgLight: 'bg-indigo-50',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  organizations: { 
    color: 'bg-gradient-to-br from-pink-500 to-pink-600', 
    textColor: 'text-pink-600',
    bgLight: 'bg-pink-50',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  students: { 
    color: 'bg-gradient-to-br from-teal-500 to-teal-600', 
    textColor: 'text-teal-600',
    bgLight: 'bg-teal-50',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
};

// Modern Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-2xl shadow-2xl p-5">
        <p className="text-sm font-semibold text-gray-200 mb-3">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-3 mb-2">
            <div 
              className="w-2 h-2 rounded-full ring-2 ring-offset-2 ring-offset-gray-900" 
              style={{ backgroundColor: entry.color, ringColor: entry.color }}
            />
            <span className="text-sm text-gray-400">{entry.name}:</span>
            <span className="text-sm font-semibold text-white">
              {entry.name === 'Revenue' ? `£${entry.value.toLocaleString()}` : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Animated Custom Dot for chart
const CustomDot = (props) => {
  const { cx, cy, stroke } = props;
  return (
    <circle 
      cx={cx} 
      cy={cy} 
      r={4} 
      fill="white" 
      stroke={stroke} 
      strokeWidth={3}
      className="transition-all duration-300 hover:r-6"
    />
  );
};

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
  const [selectedYear, setSelectedYear] = useState(moment().year().toString());
  const [availableYears, setAvailableYears] = useState([]);
  const [greeting, setGreeting] = useState('');
  useEffect(() => {
    const currentHour = moment().hour();
    if (currentHour < 12) setGreeting('Good Morning');
    else if (currentHour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Generate list of available years (from 2020 to current year)
        const currentYear = moment().year();
        const years = [];
        for (let year = 2020; year <= currentYear; year++) {
          years.push(year.toString());
        }
        setAvailableYears(years);

        const [enrollRes, usersRes, coursesRes, ordersRes] = await Promise.all([
          axiosInstance.get('/enrolled-courses?limit=all'),
          axiosInstance.get('/users?fields=name,role'),
          axiosInstance.get('/courses?fields=title'),
          axiosInstance.get(`/order?year=${selectedYear}&limit=all&paymentStatus=paid`),
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
  }, [selectedYear]); // Re-fetch when year changes

  const chartData = useMemo(() => {
    const months = moment.monthsShort();
    const year = parseInt(selectedYear);

    const dataMap = months.map(month => ({
      month,
      revenue: 0,
      enrollments: 0
    }));

    rawData.enrollments.forEach(item => {
      const itemDate = moment(item.createdAt);
      if (itemDate.year() === year) {
        const monthIndex = itemDate.month();
        dataMap[monthIndex].enrollments += 1;
      }
    });

    rawData.orders.forEach(item => {
      const itemDate = moment(item.createdAt);
      if (itemDate.year() === year) {
        const monthIndex = itemDate.month();
        dataMap[monthIndex].revenue += (item.totalAmount || 0);
      }
    });

    return dataMap;
  }, [rawData, selectedYear]);

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const displayStats = [
    { title: 'Total Revenue', value: `£${stats.totalSale.toLocaleString()}`, ...statsConfig.sale },
    { title: 'Enrollments', value: stats.totalEnrollments.toLocaleString(), ...statsConfig.enrollments },
    { title: 'Active Courses', value: stats.totalCourses.toLocaleString(), ...statsConfig.courses },
    { title: 'Instructors', value: stats.totalInstructors.toLocaleString(), ...statsConfig.instructors },
    { title: 'Organizations', value: stats.totalOrganizations.toLocaleString(), ...statsConfig.organizations },
    { title: 'Students', value: stats.totalStudents.toLocaleString(), ...statsConfig.students },
  ];

  return (
    <div className="flex-1 space-y-8 p-1">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {greeting}, Admin! 👋
            </h1>
            <p className="text-gray-500 mt-1">Here's what's happening with your platform today.</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {displayStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="group relative overflow-hidden border border-gray-200/60 hover:border-gray-300 hover:shadow-xl transition-all duration-300 rounded-2xl">
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${stat.bgLight}`} />
              
              <CardContent className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <div className="flex items-baseline gap-2">
                      {loading ? (
                        <div className="h-8 w-24 bg-gray-200 animate-pulse rounded-lg" />
                      ) : (
                        <p className={`text-3xl font-bold ${stat.textColor}`}>
                          {stat.value}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">
                      {stat.icon}
                    </div>
                  </div>
                </div>

                <div className={`absolute bottom-0 right-0 w-24 h-24 rounded-tl-full opacity-5 group-hover:opacity-10 transition-opacity duration-300 ${stat.color}`} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

   <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border border-gray-200/60 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-gray-100 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Revenue & Enrollment Analytics
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Monthly performance for {selectedYear}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {/* Year Selector */}
                <Select value={selectedYear} onValueChange={handleYearChange}>
                  <SelectTrigger className="w-[120px] border-gray-200 hover:border-gray-300 transition-colors">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-sm text-gray-600">Enrollments</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#f1f5f9" 
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                    axisLine={{ stroke: '#e2e8f0' }} 
                    tickLine={false}
                  />
                  <YAxis 
                    yAxisId="left" 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(value) => `£${value}`}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    iconType="circle"
                    wrapperStyle={{
                      paddingTop: '20px'
                    }}
                  />
                  {/* FIXED: Changed dataKey from "sales" to "revenue" */}
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    fill="url(#salesGradient)"
                    stroke="#3B82F6"
                    strokeWidth={3}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="enrollments"
                    name="Enrollments"
                    fill="url(#enrollmentGradient)"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}