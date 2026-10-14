import type { ReactNode } from "react";
import styled from "styled-components";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";

const Dl = styled.dl`
  display: grid;
  grid-template-columns: minmax(110px, max-content) minmax(0, 1fr);
  gap: 10px 20px;
  margin: 0;
  font-size: 0.875rem;

  dt {
    color: ${({ theme }) => theme.colors.muted.foreground};
  }

  dd {
    margin: 0;
    font-weight: 600;
    word-break: break-word;
  }
`;

export interface Fact {
  label: string;
  value: ReactNode;
}

// A titled card of label/value rows. Empty values show as an em dash.
export function FactCard({
  title,
  facts,
  action,
}: {
  title: string;
  facts: Fact[];
  action?: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <CardTitle>{title}</CardTitle>
          {action}
        </div>
      </CardHeader>
      <CardContent>
        <Dl>
          {facts.map((f) => (
            <div key={f.label} style={{ display: "contents" }}>
              <dt>{f.label}</dt>
              <dd>{f.value || "—"}</dd>
            </div>
          ))}
        </Dl>
      </CardContent>
    </Card>
  );
}
