import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardPaste,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/shared/ui";
import { Badge, PageHeader } from "@/shared/components";
import { useAuth } from "@/features/auth";
import { ASSIGNABLE_ROLES, ROLE_LABELS, type Role } from "@/lib/rbac";
import { media } from "@/theme";
import { BulkUserTable } from "../components/BulkUserTable";
import { useCreateUsers, useUsers } from "../api/hooks";
import {
  isBlank,
  newRow,
  parsePaste,
  validateRows,
  type BulkRow,
} from "../utils/bulk";

const Back = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.875rem;
  font-weight: 600;

  &:hover {
    color: ${({ theme }) => theme.colors.foreground};
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
  align-items: start;

  /* Side-by-side only when there is room for the full-width grid. */
  ${media["2xl"]} {
    grid-template-columns: minmax(0, 1fr) 340px;
  }
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.muted.DEFAULT};

  label {
    display: flex;
    align-items: center;
    gap: 10px;
    color: ${({ theme }) => theme.colors.muted.foreground};
    font-size: 0.8125rem;
    font-weight: 600;
  }

  .spacer {
    flex: 1;
  }
`;

const Footer = styled.div`
  position: sticky;
  bottom: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 16px 18px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 0 0 ${({ theme }) => theme.radii.xl}
    ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.card};
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const SideStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Example = styled.pre`
  margin: 12px 0 0;
  padding: 12px 14px;
  overflow-x: auto;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.muted.DEFAULT};
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.75rem;
  line-height: 1.6;
`;

const Banner = styled.div<{ $tone: "ok" | "bad" }>`
  margin: 0 0 20px;
  padding: 14px 18px;
  border: 1px solid
    ${({ theme, $tone }) =>
      $tone === "ok"
        ? theme.colors.primary.DEFAULT
        : theme.colors.destructive.DEFAULT};
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme, $tone }) =>
    theme.alpha(
      $tone === "ok"
        ? theme.colors.primary.DEFAULT
        : theme.colors.destructive.DEFAULT,
      0.07,
    )};
  font-size: 0.875rem;

  strong {
    display: block;
    margin-bottom: 4px;
  }
`;

const MIN_ROWS = 5;
const blankRows = (n: number) => Array.from({ length: n }, () => newRow());

// Bulk add (Admin and Super Admin): fill the grid, or paste rows from a
// spreadsheet, review what needs attention, then create everyone at once.
export function BulkAddUsersPage() {
  const navigate = useNavigate();
  const { role: actorRole } = useAuth();
  const roles = useMemo<readonly Role[]>(
    () => (actorRole ? ASSIGNABLE_ROLES[actorRole] : []),
    [actorRole],
  );
  const users = useUsers();
  const create = useCreateUsers();

  const [rows, setRows] = useState<BulkRow[]>(() => blankRows(MIN_ROWS));
  const [pasteText, setPasteText] = useState("");
  const [bulkRole, setBulkRole] = useState<Role | "">("");
  const [failedCount, setFailedCount] = useState(0);

  const problems = useMemo(
    () => validateRows(rows, users.data ?? [], roles),
    [rows, users.data, roles],
  );
  const filled = rows.filter((r) => !isBlank(r));
  const flagged = filled.filter((r) => problems[r.key] || r.serverError);
  const ready = filled.length - flagged.length;
  const canCreate =
    filled.length > 0 && flagged.length === 0 && !create.isPending;

  const byRole = useMemo(() => {
    const m = new Map<Role, number>();
    filled.forEach((r) => r.role && m.set(r.role, (m.get(r.role) ?? 0) + 1));
    return [...m];
  }, [filled]);

  // Keep one spare blank row at the end, spreadsheet-style.
  const withSpare = (list: BulkRow[]) => {
    const out = list.length ? list : blankRows(1);
    return isBlank(out[out.length - 1]!) ? out : [...out, newRow()];
  };

  const update = (key: number, patch: Partial<BulkRow>) =>
    setRows((rs) =>
      withSpare(rs.map((r) => (r.key === key ? { ...r, ...patch } : r))),
    );

  const remove = (key: number) =>
    setRows((rs) => withSpare(rs.filter((r) => r.key !== key)));

  const addPasted = () => {
    const parsed = parsePaste(pasteText, bulkRole);
    if (!parsed.length) {
      toast.error("Nothing to add — paste one person per line.");
      return;
    }
    setRows((rs) => withSpare([...rs.filter((r) => !isBlank(r)), ...parsed]));
    setPasteText("");
    toast.success(
      `Added ${parsed.length} row${parsed.length === 1 ? "" : "s"} to the list`,
    );
  };

  const applyRoleToAll = (role: Role) => {
    setBulkRole(role);
    setRows((rs) =>
      rs.map((r) => (isBlank(r) ? r : { ...r, role, serverError: undefined })),
    );
  };

  const submit = () => {
    const batch = filled;
    create.mutate(
      batch.map((r) => ({
        firstName: r.firstName.trim(),
        lastName: r.lastName.trim(),
        email: r.email.trim(),
        role: r.role as Role,
      })),
      {
        onSuccess: ({ created, failed }) => {
          if (!failed.length) {
            toast.success(
              `${created.length} account${created.length === 1 ? "" : "s"} created — sign-in details emailed`,
            );
            navigate("/users");
            return;
          }
          // Keep only the rows that failed, each with its reason.
          const reasons = new Map(
            failed.map((f) => [batch[f.index]!.key, f.error]),
          );
          setRows((rs) =>
            withSpare(
              rs
                .filter((r) => reasons.has(r.key))
                .map((r) => ({ ...r, serverError: reasons.get(r.key) })),
            ),
          );
          setFailedCount(failed.length);
          toast.success(
            `${created.length} created — ${failed.length} need attention`,
          );
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  return (
    <>
      <Back to="/users">
        <ArrowLeft size={16} /> All users
      </Back>
      <PageHeader
        title="Add users in bulk"
        description="Type accounts into the list, or paste rows from a spreadsheet. Everyone gets created together once every row checks out."
      />

      {failedCount > 0 && (
        <Banner $tone="bad" role="status">
          <strong>
            {failedCount} account{failedCount === 1 ? "" : "s"} could not be
            added
          </strong>
          The rest were created. The rows below are the ones that failed, each
          with the reason — fix them and create again.
        </Banner>
      )}

      <Layout>
        <Card>
          <CardHeader>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <CardTitle>Accounts</CardTitle>
              <Badge $tone="primary">
                {filled.length} {filled.length === 1 ? "person" : "people"}
              </Badge>
            </div>
            <CardDescription>
              A new row appears as you type. Rows with a problem are marked in
              red.
            </CardDescription>
          </CardHeader>

          <Toolbar>
            <label>
              Set role for everyone
              <Select
                value={bulkRole}
                onValueChange={(v) => applyRoleToAll(v as Role)}
              >
                <SelectTrigger
                  aria-label="Set role for everyone"
                  style={{ minWidth: 190 }}
                >
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <span className="spacer" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRows((rs) => [...rs, ...blankRows(5)])}
            >
              <Plus size={14} /> Add 5 rows
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={filled.length === 0}
              onClick={() => {
                setRows(blankRows(MIN_ROWS));
                setFailedCount(0);
              }}
            >
              <Trash2 size={14} /> Clear all
            </Button>
          </Toolbar>

          <BulkUserTable
            rows={rows}
            roles={roles}
            problems={problems}
            isBlank={isBlank}
            onChange={update}
            onRemove={remove}
          />

          <Footer>
            <Chips aria-live="polite">
              {filled.length === 0 ? (
                <span style={{ fontSize: "0.875rem", opacity: 0.7 }}>
                  Nothing to create yet.
                </span>
              ) : (
                <>
                  <Badge $tone="primary">
                    <CheckCircle2 size={12} style={{ marginRight: 4 }} />
                    {ready} ready
                  </Badge>
                  {flagged.length > 0 && (
                    <Badge $tone="danger">
                      {flagged.length} need attention
                    </Badge>
                  )}
                  {byRole.map(([r, n]) => (
                    <Badge key={r} $tone="neutral">
                      {n} {ROLE_LABELS[r]}
                    </Badge>
                  ))}
                </>
              )}
            </Chips>
            <Actions>
              <Button asChild variant="outline">
                <Link to="/users">Cancel</Link>
              </Button>
              <Button disabled={!canCreate} onClick={submit}>
                <Users size={16} />
                {create.isPending
                  ? "Creating…"
                  : filled.length > 0
                    ? `Create ${filled.length} account${filled.length === 1 ? "" : "s"}`
                    : "Create accounts"}
              </Button>
            </Actions>
          </Footer>
        </Card>

        <SideStack>
          <Card>
            <CardHeader>
              <CardTitle
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <ClipboardPaste size={18} /> Paste from a spreadsheet
              </CardTitle>
              <CardDescription>
                One person per line. Columns can be separated by tabs, commas or
                semicolons.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                aria-label="Paste rows"
                rows={7}
                placeholder={
                  "Ada, Okon, ada.okon@example.com, Media\nUche Etim, uche@example.com, Judge"
                }
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
              />
              <Button
                type="button"
                style={{ marginTop: 12, width: "100%" }}
                disabled={!pasteText.trim()}
                onClick={addPasted}
              >
                Add to the list
              </Button>
              <Example>{`first, last, email, role\nfull name, email, role`}</Example>
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: "0.75rem",
                  opacity: 0.7,
                }}
              >
                A header row is skipped. If a row has no role, the one chosen
                under “Set role for everyone” is used.
              </p>
            </CardContent>
          </Card>
        </SideStack>
      </Layout>
    </>
  );
}
