import type { ReactNode } from "react";
import akwaIbomLogo from "@/assets/akwa-ibom-logo-main.png";
import ariseLogo from "@/assets/arise-logo-main.png";
import mbopoLogo from "@/assets/mbopo-logo.webp";
import mbopoLogoDark from "@/assets/mbopo-logo-dark.webp";
import {
  Shell,
  LeftPane,
  LeftPaneBody,
  ContentColumn,
  LogoBlock,
  LogoLink,
  LogoImage,
  PageFooter,
  PageFooterText,
  RightPane,
  RightPaneLogo,
  RightPaneTitle,
  RightPaneText,
} from "./AuthLayout.styles";

// Same centered-card look as the applicant platform's auth pages; the right
// pane is a static brand panel (the applicant site's governor carousel isn't
// relevant to an internal tool).
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Shell>
      <LeftPane>
        <LeftPaneBody>
          <ContentColumn>
            <LogoBlock>
              <LogoLink to="/login" aria-label="Mbopo Akwa Ibom admin portal">
                <LogoImage
                  src={akwaIbomLogo}
                  alt="Akwa Ibom State Government"
                />
                <LogoImage src={ariseLogo} alt="ARISE Akwa Ibom" />
                <LogoImage src={mbopoLogo} alt="Mbopo Akwa Ibom" />
              </LogoLink>
            </LogoBlock>
            {children}
          </ContentColumn>
        </LeftPaneBody>
        <PageFooter>
          <PageFooterText>
            © {new Date().getFullYear()} Mbopo Akwa Ibom. Internal use only.
          </PageFooterText>
        </PageFooter>
      </LeftPane>
      <RightPane>
        <RightPaneLogo src={mbopoLogoDark} alt="" />
        <RightPaneTitle>Admin Portal</RightPaneTitle>
        <RightPaneText>
          Mbopo Akwa Ibom — Beauty with Purpose. <br /> Sign in with your staff
          account to continue.
        </RightPaneText>
      </RightPane>
    </Shell>
  );
}
