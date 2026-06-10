import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";

export default function TeacherDashboard() {
  const { user } = useAuth();
  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-outfit">Teacher Dashboard</h1>
        {/* Placeholder for now */}
      </div>
    </DashboardLayout>
  );
}
