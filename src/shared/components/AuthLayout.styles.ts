import styled from "styled-components";
import { Link } from "react-router-dom";
import { media } from "@/theme";

export const Shell = styled.div`
  display: flex;
  height: 100dvh;
  min-height: 100dvh;
  overflow: hidden;
  /* Off-white canvas, exactly like the bursary portal's own auth shell,
     with the white LeftPane sitting on top of it rather than the whole
     screen being one flat white field. */
  background: ${({ theme }) => theme.colors.muted.DEFAULT};
`;

export const LeftPane = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.card};

  ${media.lg} {
    width: 50%;
    flex: 0 0 50%;
  }
`;

export const LeftPaneBody = styled.div`
  display: flex;
  flex: 1 0 auto;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 24px;

  ${media.sm} {
    padding: 48px 32px;
  }
`;

export const ContentColumn = styled.div`
  width: 100%;
  max-width: 440px;
  padding-top: 8px;
  text-align: center;

  ${media.lg} {
    text-align: left;
  }
`;

// All three logos sit on a single row, same size, as one clickable
// identity mark that takes the visitor home from any of them.
export const LogoBlock = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 36px;

  ${media.lg} {
    justify-content: flex-start;
  }
`;

export const LogoLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 16px;
`;

export const LogoImage = styled.img`
  height: 40px;
  width: auto;
  object-fit: contain;
`;

export const PageFooter = styled.footer`
  flex: 0 0 auto;
  padding: 16px 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  text-align: center;
`;

export const PageFooterText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted.foreground};
  font-size: 12px;
`;
