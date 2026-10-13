import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import { Badge, type BadgeTone } from "@/shared/components";
import {
  SOURCE_LABELS,
  STATUS_LABELS,
  type ComplaintSource,
  type ComplaintStatus,
} from "../types";

const STATUS_TONE: Record<ComplaintStatus, BadgeTone> = {
  open: "danger",
  in_progress: "secondary",
  resolved: "primary",
};

export function ComplaintStatusBadge({ status }: { status: ComplaintStatus }) {
  return <Badge $tone={STATUS_TONE[status]}>{STATUS_LABELS[status]}</Badge>;
}

export function StatusFilter({
  status,
  source,
  onStatus,
  onSource,
}: {
  status: string;
  source: string;
  onStatus: (v: string) => void;
  onSource: (v: string) => void;
}) {
  return (
    <>
      <Select value={status} onValueChange={onStatus}>
        <SelectTrigger aria-label="Status" style={{ minWidth: 160 }}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {(Object.keys(STATUS_LABELS) as ComplaintStatus[]).map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={source} onValueChange={onSource}>
        <SelectTrigger aria-label="Source" style={{ minWidth: 170 }}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All sources</SelectItem>
          {(Object.keys(SOURCE_LABELS) as ComplaintSource[]).map((s) => (
            <SelectItem key={s} value={s}>
              {SOURCE_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
