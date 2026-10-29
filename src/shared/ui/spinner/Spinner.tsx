import { SpinnerRing, SpinnerRow } from "./Spinner.styles";

export function Spinner({ size = 20 }: { size?: number }) {
  return <SpinnerRing $size={size} role="status" aria-label="Loading" />;
}

// The common case: a centered spinner with a label, replacing a bare
// "Loading…" text wherever a table, page or panel is waiting on data.
export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <SpinnerRow role="status">
      <Spinner size={18} />
      {label}
    </SpinnerRow>
  );
}
