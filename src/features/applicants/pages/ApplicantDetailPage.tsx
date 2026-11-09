import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { ArrowLeft, Check, SearchX, Trash2, UserX } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  LoadingState,
} from "@/shared/ui";
import {
  Badge,
  ConfirmDialog,
  EmailLink,
  EmptyState,
  PhoneLink,
} from "@/shared/components";
import { useCan } from "@/lib/rbac";
import { formatDate } from "@/lib/formatting";
import {
  useApplicant,
  useDeleteApplicant,
  useSetApplicantActive,
} from "../api/hooks";

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

const Head = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 1.5rem;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
`;

const Dl = styled.dl`
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 10px 20px;
  margin: 0;
  font-size: 0.875rem;

  dt {
    color: ${({ theme }) => theme.colors.muted.foreground};
  }

  dd {
    margin: 0;
    font-weight: 600;
  }
`;

const StepList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StepRow = styled.li<{ $done: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.875rem;
  color: ${({ theme, $done }) => ($done ? theme.colors.foreground : theme.colors.muted.foreground)};

  svg {
    flex-shrink: 0;
    margin-top: 2px;
    color: ${({ theme, $done }) => ($done ? theme.colors.primary.DEFAULT : theme.colors.border)};
  }
`;

export function ApplicantDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const can = useCan();
  const { data: a, isLoading } = useApplicant(id);
  const setActive = useSetApplicantActive();
  const deleteApplicant = useDeleteApplicant();
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (isLoading) return <LoadingState />;
  if (!a) {
    return (
      <>
        <Back to="/applicants">
          <ArrowLeft size={16} /> All applicants
        </Back>
        <EmptyState
          icon={<SearchX size={26} />}
          title="Applicant not found"
          message="We couldn't find that applicant."
          action={
            <Button asChild>
              <Link to="/applicants">Back to applicants</Link>
            </Button>
          }
        />
      </>
    );
  }

  const canManage = can("applicants.manage");

  return (
    <>
      <Back to="/applicants">
        <ArrowLeft size={16} /> All applicants
      </Back>

      <Head>
        <h2>
          {a.firstName || a.lastName
            ? `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim()
            : a.email}
        </h2>
        {canManage && (
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="outline" onClick={() => setToggling(true)}>
              <UserX size={16} /> {a.active ? "Disable" : "Reactivate"}
            </Button>
            <Button variant="destructive" onClick={() => setDeleting(true)}>
              <Trash2 size={16} /> Delete
            </Button>
          </div>
        )}
      </Head>

      <Grid>
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <Dl>
              <dt>Email</dt>
              <dd>
                <EmailLink value={a.email} />{" "}
                <Badge $tone={a.emailVerified ? "primary" : "neutral"}>
                  {a.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </dd>
              <dt>Phone</dt>
              <dd>
                <PhoneLink value={a.phoneNumber} />
              </dd>
              <dt>Identity</dt>
              <dd>
                <Badge $tone={a.identityVerified ? "primary" : "neutral"}>
                  {a.identityVerified ? "NIN verified" : "Not verified"}
                </Badge>
              </dd>
              <dt>Account</dt>
              <dd>
                <Badge $tone={a.active ? "primary" : "danger"}>
                  {a.active ? "Active" : "Disabled"}
                </Badge>
              </dd>
              <dt>Registered</dt>
              <dd>{formatDate(a.createdAt)}</dd>
            </Dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registration progress</CardTitle>
          </CardHeader>
          <CardContent>
            {a.progress.applicationStatus === "submitted" ? (
              <Badge $tone="primary">Fully submitted — now a Contestant</Badge>
            ) : (
              <StepList>
                {a.progress.steps.map((step) => (
                  <StepRow key={step.step} $done={step.completed}>
                    <Check size={16} />
                    <span>
                      {step.label}
                      {!step.completed && step.missingFields.length > 0 && (
                        <span style={{ display: "block", opacity: 0.8 }}>
                          Missing: {step.missingFields.join(", ")}
                        </span>
                      )}
                    </span>
                  </StepRow>
                ))}
              </StepList>
            )}
          </CardContent>
        </Card>
      </Grid>

      <ConfirmDialog
        open={toggling}
        onOpenChange={setToggling}
        title={a.active ? "Disable this account?" : "Reactivate this account?"}
        description={
          a.active
            ? "They will no longer be able to sign in or continue their application."
            : "They will be able to sign in and continue their application again."
        }
        destructive={a.active}
        confirmLabel={a.active ? "Disable" : "Reactivate"}
        loading={setActive.isPending}
        onConfirm={() =>
          setActive.mutate(
            { id: a.id, active: !a.active },
            {
              onSuccess: () => {
                toast.success(
                  a.active ? "Account disabled" : "Account reactivated",
                );
                setToggling(false);
              },
              onError: (e) => {
                toast.error(e.message);
                setToggling(false);
              },
            },
          )
        }
      />
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title="Delete this applicant?"
        description="This permanently removes their account and any application they've started. This can't be undone."
        destructive
        confirmLabel="Delete"
        loading={deleteApplicant.isPending}
        onConfirm={() =>
          deleteApplicant.mutate(a.id, {
            onSuccess: () => {
              toast.success("Applicant deleted");
              navigate("/applicants");
            },
            onError: (e) => {
              toast.error(e.message);
              setDeleting(false);
            },
          })
        }
      />
    </>
  );
}
