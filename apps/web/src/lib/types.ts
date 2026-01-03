export type UserRole = "analyst" | "admin" | "manager";

export const roleLabels: Record<UserRole, string> = {
  analyst: "Financial Analyst",
  admin: "Administrator",
  manager: "Portfolio Manager",
};
