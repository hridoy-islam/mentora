import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Book, Plus, Star } from 'lucide-react';
import { useSelector } from 'react-redux';



const companyStats = [
  { title: 'Purchase Amount', value: '$513.40' },
  { title: 'Platform Fee', value: '$10.00' },
  { title: 'Total Profit', value: '$503.4' },
  { title: 'Available Balance', value: '$0.00' },
  { title: 'Total Course', value: '11' },
  { title: 'Total Bundles', value: '01' }
];

const companyCourses = [
  {
    id: 1,
    name: 'App Development...',
    publishDate: '28 Nov 2024',
    enrolled: 17,
    price: 'Free',
    status: 'Published'
  },
  {
    id: 2,
    name: 'UI/UX Design Fu...',
    publishDate: '27 Nov 2024',
    enrolled: 8,
    price: '$50.00',
    status: 'Published'
  },
  {
    id: 3,
    name: 'Full Stack Web...',
    publishDate: '28 Nov 2024',
    enrolled: 5,
    price: 'Free',
    status: 'Pending'
  },
  {
    id: 4,
    name: 'Intro to Photog...',
    publishDate: '27 Nov 2024',
    enrolled: 5,
    price: '$10.00',
    status: 'Published'
  }
];

// --- 🔹 Company Dashboard Component ---

export function CompanyDashboard() {

      const { user } = useSelector((state: any) => state.auth);

  return (
    <div className="flex-1 space-y-6 ">
      {/* Section 1: Profile & Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Profile Card */}
        <div className="lg:col-span-4">
          <Card className="overflow-hidden">
            <div className="relative h-32 w-full">
              <img
                src={user.image}
                alt="Banner"
                className="h-full w-full object-cover"
              />
              <Avatar className="absolute -bottom-10 left-6 h-20 w-20 border-4 border-white">
                <AvatarImage src={user?.image} />
                <AvatarFallback>
                  {user?.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardContent className="mt-12">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{user?.rating}</span>
                <span>({user?.reviews}+ Positive)</span>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Book className="h-4 w-4" />
                <span>{user?.totalCourses} Courses</span>
              </div>

              <Button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700">
                <Plus className="mr-2 h-4 w-4" />
                New course
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-8">
          <div className="grid gap-6 sm:grid-cols-3">
            {companyStats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Course List */}
      <Card>
        <CardHeader>
          <CardTitle>My Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Publish on</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companyCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <p className="text-sm font-medium">{course.name}</p>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {course.publishDate}
                  </TableCell>
                  <TableCell className="text-sm">{course.enrolled}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        course.price === 'Free' ? 'secondary' : 'default'
                      }
                      className={
                        course.price === 'Free'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }
                    >
                      {course.price}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        course.status === 'Published' ? 'default' : 'outline'
                      }
                      className={
                        course.status === 'Published'
                          ? 'bg-green-600 text-white'
                          : 'border-orange-600 text-orange-600'
                      }
                      Check
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
