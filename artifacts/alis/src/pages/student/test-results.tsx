import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";

export default function StudentTestResults() {
  const { user } = useAuth();
  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-outfit">Test Results</h1>
        {/* Placeholder for now */}
      </div>
    </DashboardLayout>
  );
}
