import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { DashboardLayout as DashboardLayoutComponent } from "@/components/layout/DashboardLayout";

// Just a placeholder to pass types checks
export default function StudentTests() {
  const { user } = useAuth();
  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-outfit">Assessments</h1>
        {/* Placeholder for now */}
      </div>
    </DashboardLayout>
  );
}
