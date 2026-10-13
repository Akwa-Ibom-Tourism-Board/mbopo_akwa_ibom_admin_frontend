import { PageHeader } from "@/shared/components";
import { PricingEditor } from "../components/PricingEditor";

export function PricingPage() {
  return (
    <>
      <PageHeader
        title="Vote pricing"
        description="The tiers voters can buy on the public voting site. Prices can differ per tier (for example a bulk discount); tiers that aren't the flat ₦100 per vote are flagged."
      />
      <PricingEditor />
    </>
  );
}
