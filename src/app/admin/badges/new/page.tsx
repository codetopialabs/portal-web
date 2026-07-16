import { RouteGuard } from "@/components/auth/RouteGuard";
import { BadgeForm } from "@/components/badges/BadgeForm";

export default function NewBadgePage() {
  return (
    <RouteGuard permission="badges.create">
      <BadgeForm />
    </RouteGuard>
  );
}
