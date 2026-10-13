import { useState } from "react";
import { ChevronDown, LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { ROLE_LABELS } from "@/lib/rbac";
import {
  Avatar,
  AvatarFallback,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/ui";
import {
  TopbarFrame,
  TopbarRow,
  MenuToggle,
  Title,
  RightCluster,
  ProfileTrigger,
  UserMeta,
  UserName,
  UserReference,
  DropdownGreeting,
} from "./DashboardTopbar.styles";

export interface AdminTopbarProps {
  title: string;
  onOpenSidebar: () => void;
}

export function AdminTopbar({ title, onOpenSidebar }: AdminTopbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const displayName = user ? `${user.firstName} ${user.lastName}` : "";
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "";

  const handleLogout = () => {
    setConfirmOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <TopbarFrame>
      <TopbarRow>
        <MenuToggle
          type="button"
          aria-label="Open menu"
          onClick={onOpenSidebar}
        >
          <Menu size={20} />
        </MenuToggle>
        <Title>{title}</Title>
        <RightCluster>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ProfileTrigger type="button" aria-label="Account menu">
                <Avatar>
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                {user && (
                  <UserMeta>
                    <UserName>{displayName}</UserName>
                    <UserReference>{ROLE_LABELS[user.role]}</UserReference>
                  </UserMeta>
                )}
                <ChevronDown size={16} />
              </ProfileTrigger>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {user && (
                <DropdownGreeting>Welcome {user.firstName}!</DropdownGreeting>
              )}
              <DropdownMenuItem
                destructive
                onSelect={() => setConfirmOpen(true)}
              >
                <LogOut size={16} />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </RightCluster>
      </TopbarRow>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log out?</DialogTitle>
            <DialogDescription>
              You will need to pick an account again to get back in.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TopbarFrame>
  );
}
