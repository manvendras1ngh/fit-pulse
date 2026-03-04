import { PlanPageClient } from "@/components/plan/plan-page-client";
import { getAllPlans, getActivePlan, getPlanWithDays } from "@/lib/queries/plans";

export default async function PlanPage() {
  const [plans, activePlan] = await Promise.all([
    getAllPlans(),
    getActivePlan(),
  ]);

  // If there's an active plan, load it for editing
  const editingPlan = activePlan
    ? await getPlanWithDays(activePlan.id)
    : null;

  return <PlanPageClient plans={plans} editingPlan={editingPlan} />;
}
