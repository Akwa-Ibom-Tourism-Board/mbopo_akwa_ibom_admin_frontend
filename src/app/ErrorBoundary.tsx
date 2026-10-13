import { Component, type ErrorInfo, type ReactNode } from "react";
import styled from "styled-components";

// This boundary wraps AppProviders (see App.tsx) so it can also catch
// errors thrown by the providers themselves — which means its own fallback
// UI renders OUTSIDE the styled-components ThemeProvider and can't read
// `theme` (that's what threw "Cannot read properties of undefined (reading
// 'background')" previously). Every style below is a hardcoded, theme-
// independent value for exactly that reason — don't reach for `theme.*` here.
const Frame = styled.div`
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 24px;
  background: #ffffff;
  text-align: center;
`;

const Title = styled.h1`
  margin: 0 0 8px;
  font-size: 1.125rem;
  font-weight: 600;
  color: #0b4923;
`;

const Copy = styled.p`
  margin: 0 0 20px;
  color: #677e76;
  font-size: 0.9375rem;
`;

const ErrorDetails = styled.pre`
  margin: 0 0 20px;
  max-width: 32rem;
  padding: 12px;
  border-radius: 8px;
  background: #f3f7f5;
  color: #384252;
  font-size: 0.75rem;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-word;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 10px 18px;
  border-radius: 6px;
  border: 1px solid #e0ebe7;
  background: #0b4923;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
`;

const ActionLink = styled.a`
  display: inline-flex;
  align-items: center;
  padding: 10px 18px;
  border-radius: 6px;
  border: 1px solid #e0ebe7;
  color: #0b4923;
  font-size: 0.875rem;
  font-weight: 600;
`;

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info);
  }

  override render() {
    if (this.state.error) {
      return (
        <Frame>
          <div>
            <Title>This page did not load</Title>
            <Copy>
              Something went wrong. You can try refreshing or head back home.
            </Copy>
            {import.meta.env.DEV && (
              <ErrorDetails>
                {this.state.error.stack ?? this.state.error.message}
              </ErrorDetails>
            )}
            <Actions>
              <ActionButton onClick={() => window.location.reload()}>
                Try again
              </ActionButton>
              <ActionLink href="/">Go home</ActionLink>
            </Actions>
          </div>
        </Frame>
      );
    }

    return this.props.children;
  }
}
