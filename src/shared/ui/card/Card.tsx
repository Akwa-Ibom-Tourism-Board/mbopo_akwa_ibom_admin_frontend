import { forwardRef, type HTMLAttributes } from "react";
import {
  StyledCard,
  StyledCardHeader,
  StyledCardTitle,
  StyledCardDescription,
  StyledCardContent,
  StyledCardFooter,
} from "./Card.styles";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  (props, ref) => <StyledCard ref={ref} {...props} />,
);
Card.displayName = "Card";

export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>((props, ref) => <StyledCardHeader ref={ref} {...props} />);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>((props, ref) => <StyledCardTitle ref={ref} {...props} />);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>((props, ref) => <StyledCardDescription ref={ref} {...props} />);
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>((props, ref) => <StyledCardContent ref={ref} {...props} />);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>((props, ref) => <StyledCardFooter ref={ref} {...props} />);
CardFooter.displayName = "CardFooter";
