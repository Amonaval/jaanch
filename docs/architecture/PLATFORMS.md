# Platform Architecture

Jaanch is mobile-first with a parallel web companion.

## Primary surface
`apps/mobile` uses React Native/Expo for the lowest-friction assessment experience, future notifications, camera/report capture, and longitudinal check-ins.

## Companion surface
`apps/web` uses React/Vite for desktop review, richer reports, clinician/admin workflows, and development/debugging.

## Shared authority
All medical/domain behavior belongs in shared packages. Views must not embed clinical rules.

Shared by both platforms:
- health types and evidence model;
- question/rule configuration;
- adaptive planner;
- assessment engine;
- safety gates;
- HAP protocol;
- validation and test fixtures;
- content strings/design tokens where appropriate.

Views may differ by platform. We explicitly prefer good native mobile and desktop UX over forcing 100% component reuse.
