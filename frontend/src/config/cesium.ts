import { Ion } from "cesium";

const DEFAULT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiMTAyMWQxZS1iMzllLTQ2ODEtYjEzMC0yM2E3NTdmZjMwYjciLCJpZCI6MzQ1MjE5LCJzdWIiOiJTYXd5ZXJGbHlubiIsImlzcyI6Imh0dHBzOi8vaW9uLmNlc2l1bS5jb20iLCJhdWQiOiJVbnRpdGxlZCIsImlhdCI6MTc3NzYxNjAzMX0.Rf-JCWN1GCHBrxZfP8rqXVOfLerDEU7bxjQ01J2H8O4";

export function configureCesiumIon(): string {
  const token =
    (import.meta.env.VITE_CESIUM_ION_TOKEN as string | undefined) ||
    DEFAULT_TOKEN;
  Ion.defaultAccessToken = token;
  return token;
}
