import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import type { CandidateStage } from "@/features/candidates/types";
import { STAGES } from "../data/mock-stages";

export function StagePicker({
  value,
  onChange,
}: {
  value: CandidateStage;
  onChange: (stage: CandidateStage) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as CandidateStage)}>
      <SelectTrigger aria-label="Stage" style={{ width: "min(100%, 320px)" }}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STAGES.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            Stage {s.order}: {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
