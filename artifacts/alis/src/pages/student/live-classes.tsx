import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";

export default function StudentLiveClasses() {
  const { user } = useAuth();
  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-outfit">Live Classes</h1>
        {/* Placeholder for now */}
      </div>
    </DashboardLayout>
  );
}
