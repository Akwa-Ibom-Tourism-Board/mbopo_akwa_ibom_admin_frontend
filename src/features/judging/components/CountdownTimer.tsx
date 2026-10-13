import { useEffect, useState } from "react";
import styled from "styled-components";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/shared/ui";

const Box = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 6px 6px 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.card};
  font-size: 0.8125rem;
`;

const Time = styled.span<{ $over: boolean }>`
  min-width: 3ch;
  color: ${({ theme, $over }) =>
    $over ? theme.colors.destructive.DEFAULT : theme.colors.primary.DEFAULT};
  font-size: 1.125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`;

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// A simple count-down for timed rounds and Round 2's think-time pause.
export function CountdownTimer({
  seconds,
  label,
}: {
  seconds: number;
  label: string;
}) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setLeft(seconds);
    setRunning(false);
  }, [seconds]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          setRunning(false);
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  return (
    <Box>
      <span>{label}</span>
      <Time $over={left === 0} aria-live="off">
        {fmt(left)}
      </Time>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label={running ? "Pause timer" : "Start timer"}
        disabled={left === 0}
        onClick={() => setRunning((r) => !r)}
      >
        {running ? <Pause size={16} /> : <Play size={16} />}
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label="Reset timer"
        onClick={() => {
          setRunning(false);
          setLeft(seconds);
        }}
      >
        <RotateCcw size={16} />
      </Button>
    </Box>
  );
}
