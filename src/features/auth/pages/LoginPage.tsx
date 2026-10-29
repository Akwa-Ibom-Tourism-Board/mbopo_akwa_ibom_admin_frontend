import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { useAuth } from "../hooks/useAuth";

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email")
    .email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (user) return <Navigate to="/dashboard" replace />;

  const from = (location.state as { from?: { pathname: string } } | null)?.from
    ?.pathname;

  const onSubmit = async ({ email, password }: FormValues) => {
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
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
        <SubmitButton type="submit" size="lg" style={{ marginTop: 16 }} disabled={submitting}>
          {submitting ? "Signing in…" : <>Sign in <ArrowRight size={18} /></>}
        </SubmitButton>
      </FormBlock>
    </AuthLayout>
  );
}
