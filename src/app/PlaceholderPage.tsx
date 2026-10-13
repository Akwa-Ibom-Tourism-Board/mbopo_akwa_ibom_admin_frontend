import { PageHeader, EmptyState } from "@/shared/components";

// Stand-in for routes whose feature lands in a later build stage.
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} />
      <EmptyState>This screen is built in a later stage.</EmptyState>
    </>
  );
}
