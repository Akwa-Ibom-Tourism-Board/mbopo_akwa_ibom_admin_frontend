import { Fragment } from "react";
import styled from "styled-components";
import { AlertCircle, X } from "lucide-react";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import { ROLE_LABELS, type Role } from "@/lib/rbac";
import { media } from "@/theme";
import type { BulkRow } from "../utils/bulk";

const Scroll = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  min-width: 0;

  ${media.md} {
    min-width: 820px;
  }
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.875rem;

  th {
    padding: 10px 8px;
    background: ${({ theme }) => theme.colors.muted.DEFAULT};
    color: ${({ theme }) => theme.colors.muted.foreground};
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-align: left;
    text-transform: uppercase;
  }

  td {
    padding: 6px 8px;
    vertical-align: top;
  }

  th:first-child,
  td:first-child {
    width: 44px;
    padding-left: 18px;
    color: ${({ theme }) => theme.colors.muted.foreground};
    font-size: 0.75rem;
    text-align: left;
  }

  th:last-child,
  td:last-child {
    width: 52px;
    padding-right: 14px;
  }

  /* Phones: each row becomes a small card instead of a wide scrolling grid. */
  @media (max-width: 767px) {
    thead {
      display: none;
    }

    tbody {
      display: block;
    }
  }
`;

const Tr = styled.tr<{ $bad: boolean; $blank: boolean }>`
  td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme, $bad }) =>
      $bad
        ? theme.alpha(theme.colors.destructive.DEFAULT, 0.05)
        : "transparent"};
  }

  td:first-child {
    box-shadow: inset 3px 0 0
      ${({ theme, $bad }) => ($bad ? theme.colors.destructive.DEFAULT : "transparent")};
  }

  td:nth-child(2),
  td:nth-child(3) {
    min-width: 130px;
  }

  td:nth-child(4) {
    min-width: 230px;
  }

  td:nth-child(5) {
    min-width: 180px;
  }

  ${({ $blank }) => $blank && "opacity: 0.85;"}

  @media (max-width: 767px) {
    && {
      display: grid;
    }
    grid-template-columns: 1fr 1fr;
    column-gap: 10px;
    row-gap: 8px;
    padding: 14px 16px 10px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme, $bad }) =>
      $bad
        ? theme.alpha(theme.colors.destructive.DEFAULT, 0.05)
        : "transparent"};

    td {
      display: block;
      min-width: 0 !important;
      width: auto !important;
      padding: 0 !important;
      border: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
    }

    /* top line: "Person n" on the left, remove on the right */
    td:nth-child(1) {
      grid-column: 1;
      grid-row: 1;
      align-self: center;
      font-weight: 700;
    }

    td:nth-child(1)::before {
      content: "Person ";
    }

    td:nth-child(6) {
      grid-column: 2;
      grid-row: 1;
      justify-self: end;
    }

    td:nth-child(2) {
      grid-column: 1;
      grid-row: 2;
    }

    td:nth-child(3) {
      grid-column: 2;
      grid-row: 2;
    }

    td:nth-child(4) {
      grid-column: 1 / -1;
      grid-row: 3;
    }

    td:nth-child(5) {
      grid-column: 1 / -1;
      grid-row: 4;
    }
  }
`;

const IssueTr = styled.tr`
  @media (max-width: 767px) {
    display: block;
  }
`;

const Issue = styled.td`
  padding: 0 8px 8px 62px !important;
  color: ${({ theme }) => theme.colors.destructive.DEFAULT};
  font-size: 0.75rem;
  font-weight: 600;

  span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  @media (max-width: 767px) {
    && {
      display: block;
      width: 100% !important;
      padding: 0 16px 12px !important;
    }
    background: ${({ theme }) => theme.alpha(theme.colors.destructive.DEFAULT, 0.05)};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

export interface BulkUserTableProps {
  rows: BulkRow[];
  roles: readonly Role[];
  problems: Record<number, string>;
  isBlank: (r: BulkRow) => boolean;
  onChange: (key: number, patch: Partial<BulkRow>) => void;
  onRemove: (key: number) => void;
}

// The editable grid. Errors show as soon as a row has anything in it, and a
// row the server refused keeps its message until it's edited.
export function BulkUserTable({
  rows,
  roles,
  problems,
  isBlank,
  onChange,
  onRemove,
}: BulkUserTableProps) {
  return (
    <Scroll>
      <Table>
        <thead>
          <tr>
            <th>#</th>
            <th>First name</th>
            <th>Last name</th>
            <th>Email</th>
            <th>Role</th>
            <th aria-label="Remove" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const issue = r.serverError ?? problems[r.key];
            const blank = isBlank(r);
            const edit = (patch: Partial<BulkRow>) =>
              onChange(r.key, { ...patch, serverError: undefined });
            return (
              <Fragment key={r.key}>
                <Tr $bad={!!issue} $blank={blank}>
                  <td>{i + 1}</td>
                  <td>
                    <Input
                      aria-label={`Row ${i + 1} first name`}
                      placeholder="First name"
                      value={r.firstName}
                      invalid={!!issue && !r.firstName.trim()}
                      onChange={(e) => edit({ firstName: e.target.value })}
                    />
                  </td>
                  <td>
                    <Input
                      aria-label={`Row ${i + 1} last name`}
                      placeholder="Last name"
                      value={r.lastName}
                      invalid={!!issue && !r.lastName.trim()}
                      onChange={(e) => edit({ lastName: e.target.value })}
                    />
                  </td>
                  <td>
                    <Input
                      aria-label={`Row ${i + 1} email`}
                      type="email"
                      placeholder="name@example.com"
                      value={r.email}
                      invalid={!!issue && /email|valid|twice/i.test(issue)}
                      onChange={(e) => edit({ email: e.target.value })}
                    />
                  </td>
                  <td>
                    <Select
                      value={r.role}
                      onValueChange={(v) => edit({ role: v as Role })}
                    >
                      <SelectTrigger
                        aria-label={`Row ${i + 1} role`}
                        invalid={!!issue && !r.role}
                      >
                        <SelectValue placeholder="Choose role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Remove row ${i + 1}`}
                      onClick={() => onRemove(r.key)}
                    >
                      <X size={16} />
                    </Button>
                  </td>
                </Tr>
                {issue && (
                  <IssueTr>
                    <Issue colSpan={6}>
                      <span role="alert">
                        <AlertCircle size={13} />
                        {issue}
                      </span>
                    </Issue>
                  </IssueTr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </Table>
    </Scroll>
  );
}
