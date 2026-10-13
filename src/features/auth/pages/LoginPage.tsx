import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import styled from "styled-components";
import { ArrowRight } from "lucide-react";
import { AuthLayout } from "@/shared/components";
import {
  Heading,
  Subtitle,
  FormBlock,
  Field,
  FieldLabel,
  StyledField,
  StyledPasswordField,
  ErrorText,
  SubmitButton,
} from "@/shared/components/AuthForm.styles";
import { ROLE_LABELS } from "@/lib/rbac";
import { DUMMY_ACCOUNTS } from "../data/dummy-accounts";
import { useAuth } from "../hooks/useAuth";

/*
 * ⚠️  DEV-ONLY LOGIN. Credentials are checked against a hardcoded list of
 * dummy accounts — there is no real authentication. The role comes from the
 * matched account, never from a choice on this form. Replace this page (and
 * AuthContext) once real backend auth exists, and delete <DemoAccounts />
 * before going live.
 */

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email")
    .email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});
type FormValues = z.infer<typeof schema>;

const DemoBox = styled.div`
  margin-top: 28px;
  padding: 14px 16px;
  border: 1px dashed ${({ theme }) => theme.colors.secondary.DEFAULT};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.alpha(theme.colors.secondary.DEFAULT, 0.08)};
  text-align: left;
`;

const DemoTitle = styled.p`
  margin: 0 0 4px;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.8125rem;
  font-weight: 700;
`;

const DemoHint = styled.p`
  margin: 0 0 10px;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.75rem;
`;

const DemoRow = styled.button`
  display: block;
  width: 100%;
  padding: 8px 0;
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: none;
  text-align: left;
  cursor: pointer;

  &:hover span:first-child {
    text-decoration: underline;
  }
`;

const DemoRole = styled.span`
  display: block;
  color: ${({ theme }) => theme.colors.primary.DEFAULT};
  font-size: 0.8125rem;
  font-weight: 700;
`;

const DemoCreds = styled.span`
  display: block;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 0.75rem;
  word-break: break-all;
`;

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (user) return <Navigate to="/dashboard" replace />;

  const from = (location.state as { from?: { pathname: string } } | null)?.from
    ?.pathname;

  const onSubmit = ({ email, password }: FormValues) => {
    const result = login(email, password);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    // The signed-in account's own role decides what the dashboard shows;
    // a guarded deep link only survives if that role may open it.
    navigate(from && from !== "/login" ? from : "/dashboard", {
      replace: true,
    });
  };

  return (
    <AuthLayout>
      <Heading>Welcome back</Heading>
      <Subtitle>Sign in to the Mbopo Akwa Ibom admin portal.</Subtitle>

      <FormBlock onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <StyledField
            id="email"
            type="email"
            autoComplete="username"
            placeholder="you@example.com"
            invalid={!!errors.email}
            {...register("email", { onChange: () => setFormError(null) })}
          />
          {errors.email && <ErrorText>{errors.email.message}</ErrorText>}
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <StyledPasswordField
            id="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            invalid={!!errors.password}
            {...register("password", { onChange: () => setFormError(null) })}
          />
          {errors.password && <ErrorText>{errors.password.message}</ErrorText>}
        </Field>
        {formError && <ErrorText role="alert">{formError}</ErrorText>}
        <SubmitButton type="submit" size="lg" style={{ marginTop: 16 }}>
          Sign in <ArrowRight size={18} />
        </SubmitButton>
      </FormBlock>

      {/* DEMO ONLY — remove before going live. */}
      <DemoBox>
        <DemoTitle>Demo accounts</DemoTitle>
        <DemoHint>Click one to fill the form, then sign in.</DemoHint>
        {DUMMY_ACCOUNTS.map((a) => (
          <DemoRow
            key={a.id}
            type="button"
            onClick={() => {
              setValue("email", a.email, { shouldValidate: true });
              setValue("password", a.password, { shouldValidate: true });
              setFormError(null);
            }}
          >
            <DemoRole>
              {ROLE_LABELS[a.role]} — {a.firstName} {a.lastName}
            </DemoRole>
            <DemoCreds>
              {a.email} · {a.password}
            </DemoCreds>
          </DemoRow>
        ))}
      </DemoBox>
    </AuthLayout>
  );
}
