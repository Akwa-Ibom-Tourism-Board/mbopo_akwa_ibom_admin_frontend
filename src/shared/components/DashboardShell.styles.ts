import styled from "styled-components";
import { media } from "@/theme";

export const ShellFrame = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;

// The sidebar is `position: fixed` at every breakpoint (see
// DashboardSidebar.styles.ts) so it never stretches or drifts with this
// column's height — this reserves its width instead of relying on flex.
export const ContentPane = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;

  ${media.lg} {
    margin-left: 264px;
  }
`;

export const ContentBody = styled.div`
  flex: 1;
  padding: 24px 20px 48px;

  @media (min-width: 1024px) {
    padding: 32px 32px 64px;
  }
`;
