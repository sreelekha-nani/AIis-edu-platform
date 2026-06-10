import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";

export default function ParentDashboard() {
  const { user } = useAuth();
  return (
    <DashboardLayout role="parent">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-outfit">Parent Dashboard</h1>
        {/* Placeholder for now */}
      </div>
    </DashboardLayout>
  );
}
