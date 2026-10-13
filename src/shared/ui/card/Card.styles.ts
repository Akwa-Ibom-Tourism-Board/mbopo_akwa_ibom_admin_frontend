import styled from "styled-components";

export const StyledCard = styled.div`
  border-radius: ${({ theme }) => theme.radii.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.cardForeground};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition:
    background-color ${({ theme }) => theme.transitions.base},
    border-color ${({ theme }) => theme.transitions.base};
`;

export const StyledCardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 1.5rem;
`;

export const StyledCardTitle = styled.h3`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.3;
`;

export const StyledCardDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.muted.foreground};
`;

export const StyledCardContent = styled.div`
  padding: 0 1.5rem 1.5rem;
`;

export const StyledCardFooter = styled.div`
  display: flex;
  align-items: center;
  padding: 0 1.5rem 1.5rem;
`;
