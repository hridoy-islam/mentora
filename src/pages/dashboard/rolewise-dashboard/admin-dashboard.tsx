import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

// --- 🔹 New Mock Data (Matching Screenshot) ---

// Stats
const topRowStats = [
  {
    title: 'Total Sale',
    value: '$4,265.30',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    color: 'bg-blue-100 text-blue-700',
  },
 
  {
    title: 'Total Enrollments',
    value: '54',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: 'bg-purple-100 text-purple-700',
  },
  {
    title: 'Total Courses',
    value: '120',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      </svg>
    ),
    color: 'bg-orange-100 text-orange-700',
  },
];

const bottomRowStats = [
  {
    title: 'Total Instructors',
    value: '10',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: 'bg-indigo-100 text-indigo-700',
  },
  {
    title: 'Total Organization',
    value: '10',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    color: 'bg-pink-100 text-pink-700',
  },
  {
    title: 'Total Students',
    value: '10',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    ),
    color: 'bg-teal-100 text-teal-700',
  },
];

// Chart Data
const registrationData = [
  { date: '01 Nov 24', students: 5, instructors: 1 },
  { date: '03 Nov 24', students: 7, instructors: 0 },
  { date: '05 Nov 24', students: 10, instructors: 2 },
  { date: '07 Nov 24', students: 8, instructors: 1 },
  { date: '09 Nov 24', students: 12, instructors: 1 },
  { date: '11 Nov 24', students: 15, instructors: 3 },
  { date: '13 Nov 24', students: 14, instructors: 2 },
];

// Bottom Cards Data
const trendingCategories = [
  { id: 1, name: 'Digital Marketing', courses: 3, color: 'bg-blue-500' },
  { id: 2, name: 'text1', courses: 8, color: 'bg-green-500' },
  { id: 3, name: 'UX/UI', courses: 5, color: 'bg-purple-500' },
  { id: 4, name: 'Robotics', courses: 2, color: 'bg-orange-500' },
];

const topCourses = [
  {
    id: 1,
    name: 'App Development...',
    author: 'Kaber Hossen',
    publishDate: '28 Nov 2024',
    enrolled: 17,
    price: 'Free',
    avatar: 'https://github.com/shadcn.png',
  },
  {
    id: 2,
    name: 'UI/UX Design Fu...',
    author: 'Kaber Hossen',
    publishDate: '27 Nov 2024',
    enrolled: 8,
    price: 'Free',
    avatar: 'https://github.com/shadcn.png',
  },
  {
    id: 3,
    name: 'Full Stack Web...',
    author: 'John Smith',
    publishDate: '28 Nov 2024',
    enrolled: 5,
    price: 'Free',
    avatar: 'https://github.com/shadcn.png',
  },
  {
    id: 4,
    name: 'Intro to Photog...',
    author: 'Alice Mahmud',
    publishDate: '27 Nov 2024',
    enrolled: 5,
    price: '$10.00',
    avatar: 'https://github.com/shadcn.png',
  },
];

const supportRequests = [
  {
    id: 1,
    name: 'Ahsan Hossen',
    time: '08:15 am',
    message: 'sales',
    avatar: 'https://github.com/shadcn.png',
  },
  {
    id: 2,
    name: 'A Chan',
    time: '06:12 pm',
    message: 'aaa',
    avatar: 'https://github.com/shadcn.png',
  },
  {
    id: 3,
    name: 'Ahsan Hossen',
    time: '07:11 am',
    message: 'bbbbbb',
    avatar: 'https://github.com/shadcn.png',
  },
  {
    id: 4,
    name: 'Ahsan Hossen',
    time: '09:10 am',
    message: 'AOT-GEP9RGF-SM-CIJ',
    avatar: 'https://github.com/shadcn.png',
  },
];

// --- 🔹 New Dashboard Component ---

export function AdminDashboard() {
  return (
    <div className="flex-1 space-y-6 6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Welcome Back, Academine 👋</h1>
      </div>

      {/* Stats Grid - Top Row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {topRowStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Grid - Second Row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {bottomRowStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Registration Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Statistical Register Of Students & Instructors</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={registrationData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="students"
                name="Student Register"
                stroke="#22C55E" // Green
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="instructors"
                name="Instructor Register"
                stroke="#8B5CF6" // Purple
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        

        {/* Top Performing Courses */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Performing Courses</CardTitle>
            <Button variant="ghost" size="sm">
              See all
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Publish on</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={course.avatar} alt={course.name} />
                          <AvatarFallback>
                            {course.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium truncate max-w-[150px]">
                            {course.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{course.author}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {course.publishDate}
                    </TableCell>
                    <TableCell className="text-sm">{course.enrolled}</TableCell>
                    <TableCell>
                      <Badge
                        variant={course.price === 'Free' ? 'secondary' : 'default'}
                        className={
                          course.price === 'Free'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }
                      >
                        {course.price}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Support Request */}
        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Support Request</CardTitle>
            <Button variant="ghost" size="sm">
              See all
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {supportRequests.map((request) => (
              <div key={request.id} className="flex items-start gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={request.avatar} alt={request.name} />
                  <AvatarFallback>{request.name.substring(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{request.name}</p>
                    <p className="text-xs text-muted-foreground">{request.time}</p>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{request.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}