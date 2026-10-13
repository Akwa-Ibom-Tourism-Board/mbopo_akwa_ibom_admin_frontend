import { Link } from "react-router-dom";
import styled from "styled-components";
import { Button } from "@/shared/ui";

const Frame = styled.div`
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 24px;
  background: ${({ theme }) => theme.colors.background};
  text-align: center;
`;

const Code = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.secondary.DEFAULT};
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 3rem;
  font-weight: 700;
`;

const Text = styled.p`
  margin: 8px 0 20px;
  color: ${({ theme }) => theme.colors.muted.foreground};
`;

export function NotFoundPage() {
  return (
    <Frame>
      <div>
        <Code>404</Code>
        <Text>That page doesn't exist.</Text>
        <Button asChild>
          <Link to="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </Frame>
  );
}
