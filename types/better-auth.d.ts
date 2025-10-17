import { UserRole } from "@/db/schema/auth";

declare module "better-auth/types" {
  interface User {
    role: UserRole;
  }
}