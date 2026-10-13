import { useEffect, useState } from "react";
import styled from "styled-components";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, Input } from "@/shared/ui";
import { Badge } from "@/shared/components";
import { formatNaira } from "@/lib/formatting";
import { BASE_VOTE_PRICE_NAIRA } from "../data/mock-tiers";
import { useSaveVoteTiers, useVoteTiers } from "../api/hooks";

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.card};
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  min-width: 560px;
  border-collapse: collapse;
  font-size: 0.875rem;

  th,
  td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  th {
    background: ${({ theme }) => theme.colors.muted.DEFAULT};
    color: ${({ theme }) => theme.colors.muted.foreground};
    font-size: 0.75rem;
    text-transform: uppercase;
  }

  input {
    max-width: 140px;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
`;

const Err = styled.p`
  margin: 12px 0 0;
  color: ${({ theme }) => theme.colors.destructive.DEFAULT};
  font-size: 0.875rem;
`;

interface Row {
  key: number;
  votes: string;
  price: string;
}

let keySeed = 0;

// Per-tier prices are editable (e.g. for bulk discounts). The per-vote rate
// column flags any tier that departs from the flat base rate so a change is
// always deliberate.
export function PricingEditor() {
  const { data, isLoading } = useVoteTiers();
  const save = useSaveVoteTiers();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (data) {
      setRows(
        data.map((t) => ({
          key: keySeed++,
          votes: String(t.votes),
          price: String(t.priceNaira),
        })),
      );
    }
  }, [data]);

  const parsed = rows.map((r) => ({
    votes: Number(r.votes),
    priceNaira: Number(r.price),
  }));
  const isInt = (n: number) => Number.isInteger(n) && n > 0;
  const allValid = parsed.every((t) => isInt(t.votes) && isInt(t.priceNaira));
  const unique = new Set(parsed.map((t) => t.votes)).size === parsed.length;
  const error =
    rows.length === 0
      ? "Add at least one tier."
      : !allValid
        ? "Votes and prices must be positive whole numbers."
        : !unique
          ? "Each tier needs a different number of votes."
          : null;

  const dirty =
    JSON.stringify([...parsed].sort((a, b) => a.votes - b.votes)) !==
    JSON.stringify(data ?? []);

  const update = (key: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  if (isLoading) return <p>Loading…</p>;

  return (
    <>
      <Card>
        <Table>
          <thead>
            <tr>
              <th>Votes</th>
              <th>Price (₦)</th>
              <th>Per vote</th>
              <th aria-label="Remove" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const t = parsed[i]!;
              const rate =
                isInt(t.votes) && isInt(t.priceNaira)
                  ? t.priceNaira / t.votes
                  : null;
              return (
                <tr key={r.key}>
                  <td>
                    <Input
                      aria-label="Votes in tier"
                      inputMode="numeric"
                      value={r.votes}
                      onChange={(e) => update(r.key, { votes: e.target.value })}
                    />
                  </td>
                  <td>
                    <Input
                      aria-label="Tier price in naira"
                      inputMode="numeric"
                      value={r.price}
                      onChange={(e) => update(r.key, { price: e.target.value })}
                    />
                  </td>
                  <td>
                    {rate == null ? (
                      "—"
                    ) : rate === BASE_VOTE_PRICE_NAIRA ? (
                      formatNaira(rate)
                    ) : (
                      <Badge $tone="secondary">
                        {formatNaira(rate)} (not flat)
                      </Badge>
                    )}
                  </td>
                  <td>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label="Remove tier"
                      onClick={() =>
                        setRows((rs) => rs.filter((x) => x.key !== r.key))
                      }
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      {error && dirty && <Err role="alert">{error}</Err>}

      <Actions>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setRows((rs) => [...rs, { key: keySeed++, votes: "", price: "" }])
          }
        >
          <Plus size={16} /> Add tier
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setRows((rs) =>
              rs.map((r) =>
                isInt(Number(r.votes))
                  ? {
                      ...r,
                      price: String(Number(r.votes) * BASE_VOTE_PRICE_NAIRA),
                    }
                  : r,
              ),
            )
          }
        >
          Reset to flat {formatNaira(BASE_VOTE_PRICE_NAIRA)} per vote
        </Button>
        <Button
          type="button"
          disabled={!!error || !dirty || save.isPending}
          onClick={() =>
            save.mutate(parsed, {
              onSuccess: () => toast.success("Vote pricing saved"),
              onError: (e) => toast.error(e.message),
            })
          }
        >
          {save.isPending ? "Saving…" : "Save pricing"}
        </Button>
      </Actions>
    </>
  );
}
