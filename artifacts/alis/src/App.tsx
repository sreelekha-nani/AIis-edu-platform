import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useRequireAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";

import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";

import StudentDashboard from "@/pages/student";
import StudentCourses from "@/pages/student/courses";
import StudentTests from "@/pages/student/tests";
import StudentResults from "@/pages/student/test-results";
import StudentLiveClasses from "@/pages/student/live-classes";
import StudentDiscussions from "@/pages/student/discussions";
import StudentAssignments from "@/pages/student/assignments";

import TeacherDashboard from "@/pages/teacher";
import TeacherCourses from "@/pages/teacher/courses";
import TeacherTests from "@/pages/teacher/tests";
import TeacherLiveClasses from "@/pages/teacher/live-classes";
import TeacherStudents from "@/pages/teacher/students";
import TeacherAnalytics from "@/pages/teacher/analytics";

import ParentDashboard from "@/pages/parent";
import ParentChildren from "@/pages/parent/children";
import ParentReports from "@/pages/parent/reports";

import AdminDashboard from "@/pages/admin";
import AdminUsers from "@/pages/admin/users";
import AdminCourses from "@/pages/admin/courses";
import AdminAnalytics from "@/pages/admin/analytics";

const queryClient = new QueryClient();

const StudentRoute = ({ component: C }: any) => { useRequireAuth("student"); return <C />; };
const TeacherRoute = ({ component: C }: any) => { useRequireAuth("teacher"); return <C />; };
const ParentRoute  = ({ component: C }: any) => { useRequireAuth("parent");  return <C />; };
const AdminRoute   = ({ component: C }: any) => { useRequireAuth("admin");   return <C />; };

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />

      {/* Student */}
      <Route path="/student" component={() => <StudentRoute component={StudentDashboard} />} />
      <Route path="/student/courses" component={() => <StudentRoute component={StudentCourses} />} />
      <Route path="/student/tests" component={() => <StudentRoute component={StudentTests} />} />
      <Route path="/student/results" component={() => <StudentRoute component={StudentResults} />} />
      <Route path="/student/live-classes" component={() => <StudentRoute component={StudentLiveClasses} />} />
      <Route path="/student/discussions" component={() => <StudentRoute component={StudentDiscussions} />} />
      <Route path="/student/assignments" component={() => <StudentRoute component={StudentAssignments} />} />

      {/* Teacher */}
      <Route path="/teacher" component={() => <TeacherRoute component={TeacherDashboard} />} />
      <Route path="/teacher/courses" component={() => <TeacherRoute component={TeacherCourses} />} />
      <Route path="/teacher/tests" component={() => <TeacherRoute component={TeacherTests} />} />
      <Route path="/teacher/live-classes" component={() => <TeacherRoute component={TeacherLiveClasses} />} />
      <Route path="/teacher/students" component={() => <TeacherRoute component={TeacherStudents} />} />
      <Route path="/teacher/analytics" component={() => <TeacherRoute component={TeacherAnalytics} />} />

      {/* Parent */}
      <Route path="/parent" component={() => <ParentRoute component={ParentDashboard} />} />
      <Route path="/parent/children" component={() => <ParentRoute component={ParentChildren} />} />
      <Route path="/parent/reports" component={() => <ParentRoute component={ParentReports} />} />

      {/* Admin */}
      <Route path="/admin" component={() => <AdminRoute component={AdminDashboard} />} />
      <Route path="/admin/users" component={() => <AdminRoute component={AdminUsers} />} />
      <Route path="/admin/courses" component={() => <AdminRoute component={AdminCourses} />} />
      <Route path="/admin/analytics" component={() => <AdminRoute component={AdminAnalytics} />} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
