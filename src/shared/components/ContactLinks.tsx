import type { MouseEvent } from "react";
import styled from "styled-components";

const Link = styled.a`
  color: ${({ theme }) => theme.colors.primary.DEFAULT};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

// Stops the click from also firing a parent row's onRowClick (DataTable
// rows are clickable-to-navigate) — without this, tapping a phone/email
// link inside a table would both open the dialer/mail app AND navigate to
// the detail page.
const stop = (event: MouseEvent) => event.stopPropagation();

export function PhoneLink({
  value,
  fallback = "—",
}: {
  value: string | null | undefined;
  fallback?: string;
}) {
  if (!value) return <>{fallback}</>;
  return (
    <Link href={`tel:${value}`} onClick={stop}>
      {value}
    </Link>
  );
}

export function EmailLink({
  value,
  fallback = "—",
}: {
  value: string | null | undefined;
  fallback?: string;
}) {
  if (!value) return <>{fallback}</>;
  return (
    <Link href={`mailto:${value}`} onClick={stop}>
      {value}
    </Link>
  );
}
