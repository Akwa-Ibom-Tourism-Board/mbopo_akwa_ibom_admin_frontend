import type { ReactNode } from "react";
import styled from "styled-components";
import { Label } from "@/shared/ui";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Err = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.destructive.DEFAULT};
  font-size: 0.8125rem;
`;

export const FormStack = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 8px;
`;

export function FormRow({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <Wrap>
      <Label htmlFor={htmlFor}>{label}</Label>
      {hint && <small style={{ opacity: 0.7 }}>{hint}</small>}
      {children}
      {error && <Err role="alert">{error}</Err>}
    </Wrap>
  );
}
