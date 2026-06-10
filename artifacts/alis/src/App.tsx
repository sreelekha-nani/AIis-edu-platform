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
import TeacherDashboard from "@/pages/teacher";
import ParentDashboard from "@/pages/parent";
import AdminDashboard from "@/pages/admin";

const queryClient = new QueryClient();

// Route wrappers to enforce auth
const StudentRoute = ({ component: Component }: any) => {
  useRequireAuth("student");
  return <Component />;
};
const TeacherRoute = ({ component: Component }: any) => {
  useRequireAuth("teacher");
  return <Component />;
};
const ParentRoute = ({ component: Component }: any) => {
  useRequireAuth("parent");
  return <Component />;
};
const AdminRoute = ({ component: Component }: any) => {
  useRequireAuth("admin");
  return <Component />;
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      
      <Route path="/student" component={() => <StudentRoute component={StudentDashboard} />} />
      <Route path="/teacher" component={() => <TeacherRoute component={TeacherDashboard} />} />
      <Route path="/parent" component={() => <ParentRoute component={ParentDashboard} />} />
      <Route path="/admin" component={() => <AdminRoute component={AdminDashboard} />} />
      
      {/* TODO: Add all other nested routes */}
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
