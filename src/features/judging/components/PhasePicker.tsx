import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import { PHASES, phaseTitle, type PhaseId } from "@/lib/phases";

export function PhasePicker({
  value,
  onChange,
}: {
  value: PhaseId;
  onChange: (phase: PhaseId) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as PhaseId)}>
      <SelectTrigger aria-label="Stage" style={{ width: "min(100%, 280px)" }}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PHASES.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {phaseTitle(p.id)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
