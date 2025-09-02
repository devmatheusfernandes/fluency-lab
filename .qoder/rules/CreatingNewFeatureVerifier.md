---
trigger: always_on
alwaysApply: true
---

When creating a new feature pay attention to:
Architecture Compliance:
✅ Client-side code only uses client-side dependencies
✅ Server-side code handles all Firebase Admin operations
✅ API routes act as the boundary between client and server
✅ Business logic remains in service layer (UserService)
✅ Data access remains in repository layer (UserAdminRepository)

Observations:
Client components and hooks communicate with API routes
API routes handle server-side operations using Firebase Admin SDK
Services and repositories contain business logic and data access respectively
No server-only modules are imported in client-accessible code paths