import * as React from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  CardContent,
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
import {
  Award,
  BookCopy,
  ClipboardCheck,
  ClipboardList,
} from 'lucide-react';

// --- 🔹 Mock Data for Student Dashboard ---

const studentStats = [
  {
    title: 'Course in progress',
    value: '35',
    icon: ClipboardList,
    color: 'bg-indigo-100 text-indigo-700',
  },
  {
    title: 'Completed course',
    value: '00',
    icon: ClipboardCheck,
    color: 'bg-green-100 text-green-700',
  },
  {
    title: 'Enrolled Course',
    value: '08',
    icon: BookCopy,
    color: 'bg-blue-100 text-blue-700',
  },
  {
    title: 'Certificate',
    value: '01',
    icon: Award,
    color: 'bg-yellow-100 text-yellow-700',
  },
];

const enrolledCourses = [
  {
    id: 1,
    title: 'Build a Blockchain and a Cryptocurrency from Scratch',
    instructor: 'John Abraham',
    category: 'Tech',
    price: 'Free',
    status: 'Processing',
    imageUrl: 'https://github.com/shadcn.png', // Placeholder
  },
  {
    id: 2,
    title: 'App Development with Flutter and react native',
    instructor: 'Kaber Hossen',
    category: 'Tech',
    price: 'Free',
    status: 'Processing',
    imageUrl: 'https://github.com/shadcn.png', // Placeholder
  },
  {
    id: 3,
    title: 'The Complete Digital Marketing Analysis Guide',
    instructor: 'John Abraham',
    category: 'Digital Marketing',
    price: 'Free',
    status: 'Processing',
    imageUrl: 'https://github.com/shadcn.png', // Placeholder
  },
];



export function StudentDashboard() {
  // Get user from Redux store
  const { user } = useSelector((state: any) => state.auth);

  return (
    <div className="flex-1 space-y-6">
      {/* Section 1: Welcome Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        {/* Welcome Text */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome Back, {user?.name || 'Ahsan'} 👋
          </h1>
        </div>
       
      </div>

      {/* Section 2: Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {studentStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Section 3: Latest Enrolled Course */}
      <Card>
        <CardHeader>
          <CardTitle>Latest Enrolled Course</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[40%]">Course title</TableHead>
                <TableHead>Course Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrolledCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 rounded-md">
                        <AvatarImage
                          src={course.imageUrl}
                          alt={course.title}
                        />
                        <AvatarFallback className="rounded-md">
                          {course.title.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{course.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Instructor: {course.instructor}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    Category: {course.category}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {course.price}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-orange-600 border-orange-600 bg-orange-100"
                    >
                      {course.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}