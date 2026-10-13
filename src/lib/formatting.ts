import { format, formatDistanceToNow, parseISO } from "date-fns";

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export const formatNaira = (amount: number) => naira.format(amount);

export const formatNumber = (n: number) => n.toLocaleString("en-NG");

const toDate = (value: string | Date) =>
  typeof value === "string" ? parseISO(value) : value;

export const formatDate = (value: string | Date) =>
  format(toDate(value), "d MMM yyyy");

export const formatDateTime = (value: string | Date) =>
  format(toDate(value), "d MMM yyyy, h:mm a");

export const formatRelative = (value: string | Date) =>
  formatDistanceToNow(toDate(value), { addSuffix: true });
