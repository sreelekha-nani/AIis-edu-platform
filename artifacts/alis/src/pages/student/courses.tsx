import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useListEnrollments, useListCourses, useEnrollCourse } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Book, Target, PlaySquare, FileText, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { toast } from "sonner";

export default function StudentCourses() {
  const { user } = useAuth();
  const { data: enrollments, isLoading: enrollmentsLoading, refetch: refetchEnrollments } = useListEnrollments({ studentId: user?.id });
  const { data: allCourses, isLoading: coursesLoading } = useListCourses({});
  const enrollCourse = useEnrollCourse();
  const [enrollingId, setEnrollingId] = useState<number | null>(null);

  const enrolledCourseIds = new Set(enrollments?.map(e => e.courseId) || []);
  const availableCourses = allCourses?.filter(c => !enrolledCourseIds.has(c.id)) || [];

  const handleEnroll = async (courseId: number) => {
    setEnrollingId(courseId);
    try {
      await enrollCourse.mutateAsync({ data: { courseId } });
      toast.success("Enrolled successfully!");
      refetchEnrollments();
    } catch (err: any) {
      toast.error(err.message || "Failed to enroll");
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-outfit">My Courses</h1>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </div>

        {/* My Enrolled Courses */}
        <div>
          <h2 className="text-xl font-bold font-outfit mb-4">In Progress</h2>
          {enrollmentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full" />)}
            </div>
          ) : enrollments?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enr) => (
                <Card key={enr.id} className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow">
                  {enr.courseThumbnail ? (
                    <div className="h-32 w-full">
                      <img src={enr.courseThumbnail} alt={enr.courseTitle} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-32 w-full bg-primary/10 flex items-center justify-center">
                      <Book className="w-10 h-10 text-primary" />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-1">{enr.courseTitle}</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-1">{enr.courseSubject}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 pb-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{Math.round(enr.completionRate)}%</span>
                      </div>
                      <Progress value={enr.completionRate} className="h-2" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/student/courses/${enr.courseId}`} className="w-full">
                      <Button className="w-full" variant="default">
                        {enr.completionRate === 100 ? "Review Course" : "Continue Learning"}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
              <Book className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No courses yet</h3>
              <p className="text-muted-foreground mt-1">Enroll in a course below to get started.</p>
            </div>
          )}
        </div>

        {/* Available Courses */}
        <div>
          <h2 className="text-xl font-bold font-outfit mb-4">Discover New Courses</h2>
          {coursesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full" />)}
            </div>
          ) : availableCourses.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map((course) => (
                <Card key={course.id} className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow">
                  {course.thumbnail ? (
                    <div className="h-32 w-full">
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-32 w-full bg-secondary/10 flex items-center justify-center">
                      <Book className="w-10 h-10 text-secondary" />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 pb-2">
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                        {course.subject}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                        Level: {course.level}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                        {course.totalLessons} Lessons
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant="outline" 
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrollingId === course.id}
                    >
                      {enrollingId === course.id ? "Enrolling..." : "Enroll Now"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
              <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">You're all caught up!</h3>
              <p className="text-muted-foreground mt-1">You are enrolled in all available courses.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
