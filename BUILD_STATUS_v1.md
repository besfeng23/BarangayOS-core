# BarangayOS Build Status Report (v1 Baseline)

This report provides a consolidated snapshot of the project's current state, outlining active modules, data schemas, critical code implementations, and the immediate technical roadmap to a shippable V1.

---

### 1. Module Inventory

The following core modules are implemented and reachable through the main application router and sidebar navigation. All primary user flows are wired.

- **`/` (Dashboard)** - `src/app/page.tsx` - **[Status: Active/Wired]**
- **`/residents` (Resident Index)** - `src/app/residents/page.tsx` - **[Status: Active/Wired]**
- **`/blotter` (Blotter Log)** - `src/app/blotter/page.tsx` - **[Status: Active/Wired]**
- **`/certificates` (Certificates)** - `src/app/certificates/page.tsx` - **[Status: Active/Wired]**
- **`/permits` (Business Permits)** - `src/app/permits/page.tsx` - **[Status: Active/Wired]**
- **`/reports` (Reports & Analytics)** - `src/app/reports/page.tsx` - **[Status: Active/Wired]**
- **`/settings` (Admin Settings)** - `src/app/settings/page.tsx` - **[Status: Active/Wired]**
- **`/login` (Login Page)** - `src/app/login/page.tsx` - **[Status: Active/Wired]**

---

### 2. Data Architecture (Schema Snapshot)

The following schemas represent the core data structures being saved to Firestore.

#### Residents Collection (`/residents`)

```json
{
  "id": "string",
  "barangayId": "string",
  "rbiId": "string",
  "fullName": {
    "first": "string",
    "last": "string",
    "middle": "string"
  },
  "displayName": "string",
  "displayNameLower": "string",
  "sex": "string",
  "dateOfBirth": "Timestamp",
  "civilStatus": "string",
  "addressSnapshot": {
    "purok": "string",
    "addressLine": "string"
  },
  "status": "string ('active', 'archived')",
  "createdBy": "string",
  "createdAt": "Timestamp",
  "updatedBy": "string",
  "updatedAt": "Timestamp"
}
```

#### Blotter Collection (`/blotter_cases`)

```json
{
  "id": "string",
  "caseId": "string",
  "complainant": "string",
  "respondent": "string",
  "nature": "string",
  "narrative": "string",
  "status": "string ('ACTIVE', 'SETTLED')",
  "incidentAt": "Timestamp",
  "barangayId": "string",
  "createdBy": "string",
  "createdAt": "Timestamp"
}
```

#### Certificates & Transactions Collection (`/transactions`)

```json
{
  "id": "string",
  "barangayId": "string",
  "residentRef": "string",
  "residentNameSnapshot": "string",
  "type": "string ('Barangay Clearance', 'Indigency', etc.)",
  "purpose": "string",
  "feesCollected": "number",
  "officialSignee": "string",
  "transactionDate": "Timestamp",
  "status": "string ('COMPLETED')",
  "createdBy": "string",
  "createdAt": "Timestamp"
}
```

#### Business Permits Collection (`/business_permits`)
```json
{
  "id": "string",
  "permitNo": "string",
  "businessName": "string",
  "businessAddress": {
      "purok": "string",
      "street": "string"
  },
  "owner": {
      "fullName": "string",
      "residentId": "string"
  },
  "category": "string",
  "feesCollected": "number",
  "status": "string ('Active')",
  "issuedAt": "Timestamp",
  "issuedBy": "string",
  "barangayId": "string"
}
```

---

### 3. "Critical Fix" Verification

An analysis of the codebase confirms the status of recent critical fixes.

*   **Search Logic ("Ghost Click"):**
    *   **STATUS: FIXED.** The `ResidentPicker.tsx` component correctly uses an `onMouseDown` event on its `PopoverContent` to prevent the search input from losing focus (`onBlur`). This resolves the race condition and makes search results reliably selectable on touch devices.

*   **Layout Logic (Sidebar Overlap):**
    *   **STATUS: FIXED.** The main application layout in `src/app/layout.tsx` uses a standard flexbox model (`<div class="flex">...</div>`). The sidebar (`<Sidebar />`) has a fixed width, and the main content area (`<main>`) is set to `flex-1`, allowing it to fill the remaining space without overlapping. Pages like `/blotter` that previously had custom, conflicting layouts have been refactored to correctly render within this main content area.

---

### 4. "Next Step" Roadmap to Shippable V1

Based on the current state, the following technical debt must be cleared to achieve a stable V1 release.

1.  **Implement Backend Logic for Role Management:**
    *   The UI for changing user roles and resetting PINs exists in the Settings module, but the backend Cloud Functions to securely modify user custom claims (`role`) and handle PIN resets are not yet implemented. This is the highest priority security and administration gap.

2.  **Activate Data Export Functionality:**
    *   The "Export All Data" button in Settings is a UI placeholder. A secure Cloud Function needs to be created to query the relevant collections, generate CSV files, zip them, and provide a downloadable link to the authenticated admin.

3.  **Finalize Print Template Configuration:**
    *   The print templates currently use hardcoded values for barangay name, captain name, and seal. The logic needs to be connected to read these values from the Firestore configuration (`/barangay/{id}/config/identity`) that the Settings module writes to.

4.  **Full Test of Offline-to-Online Sync:**
    *   While individual components are built with offline persistence in mind, a full integration test is required. We must simulate a secretary working offline for an extended period (e.g., creating 10 blotter entries, 20 certificates), then reconnecting to ensure all data syncs correctly and in the right order without conflicts.
