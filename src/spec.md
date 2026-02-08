# Specification

## Summary
**Goal:** Let users easily copy/share the current live app URL from within the app, and provide clear troubleshooting guidance and deployment documentation.

**Planned changes:**
- Add a clearly labeled header action (e.g., “Copy app link”) that copies the current app entrypoint URL (including any hash routing) to the clipboard and shows a small English confirmation (toast).
- Add a small “Help / Troubleshooting” area accessible from the main UI that explains how to copy the app link, suggests a hard refresh if the app fails to load, and notes to retry later if the canister is upgrading.
- Add a repository markdown document (e.g., `DEPLOYMENT.md`) describing deterministic local/prod deploy steps with `dfx`, how to find the deployed frontend URL, where canister IDs are recorded, and how to verify the app is reachable.

**User-visible outcome:** Users can copy the current live app link directly from the header, view basic troubleshooting steps in the UI if the app doesn’t load after deploy, and developers can follow `DEPLOYMENT.md` to deploy and determine the live frontend URL and canister IDs.
