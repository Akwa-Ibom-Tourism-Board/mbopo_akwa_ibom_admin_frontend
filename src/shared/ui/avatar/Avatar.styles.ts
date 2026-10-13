import styled from "styled-components";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

export const StyledRoot = styled(AvatarPrimitive.Root)`
  position: relative;
  display: flex;
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.full};
`;

export const StyledImage = styled(AvatarPrimitive.Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const StyledFallback = styled(AvatarPrimitive.Fallback)`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.primary.DEFAULT};
  color: ${({ theme }) => theme.colors.primary.foreground};
  font-size: 0.9375rem;
  font-weight: 700;
`;
