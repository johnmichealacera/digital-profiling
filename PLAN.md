# Barangay Digital Profiling System - Implementation Plan
## Barangay Taruc, Socorro, Surigao del Norte, Philippines

---

## Tech Stack
- **Framework:** Next.js 15 (App Router) + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Auth:** NextAuth.js (Credentials Provider) with RBAC
- **Charts:** Recharts
- **Maps:** Leaflet + react-leaflet (OpenStreetMap)
- **PDF:** pdf-lib (for certificate generation)
- **Forms:** react-hook-form + zod
- **Data Fetching:** TanStack React Query

---

## Module Priority

### P0 - Must-Have (MVP)
1. Authentication & RBAC (login, roles, middleware)
2. Resident Profiling (individual records, demographics, Filipino name conventions)
3. Household Management (purok system, GIS coordinates)
4. Document Management (clearance, indigency, residency certificates + PDF generation)
5. Barangay Officials (directory, terms, signatures for documents)
6. Dashboard & Analytics (population stats, charts, visual reports)
7. Map/GIS Integration (household pins, purok color-coding)

### P1 - Should-Have
8. Blotter / Complaints (incident reports, case tracking, hearings)
9. Budget & Finance (income, expenses, allocations)
10. Projects Monitoring (project tracking, progress, timeline)
11. Health Records (senior citizens, PWD, pregnant, immunization)
12. User Management (staff accounts, activity log)

### P2 - Nice-to-Have
13. Disaster Preparedness (evacuation zones, vulnerability mapping)
14. Reports & Data Export (CSV/Excel exports)
15. Audit Trail (action log per module)

---

## User Roles (Barangay Staff Only)
| Role | Access |
|------|--------|
| SUPER_ADMIN | Full system access, manages staff accounts |
| CAPTAIN | All modules, signs/approves documents |
| SECRETARY | All modules except user management |
| TREASURER | Dashboard, budget & finance, map |
| KAGAWAD | Dashboard, residents (read), blotter, map |
| SK_CHAIRMAN | Dashboard, residents (read), health, map |

---

## Implementation Phases (14 Weeks)

### Phase 1 - Foundation & Setup (Weeks 1-3)
- **Week 1:** Project scaffolding, install dependencies, Prisma schema, seed data
- **Week 2:** NextAuth setup, RBAC middleware, login page, sidebar layout
- **Week 3:** Resident CRUD (form, table, search, profile view)

### Phase 2 - Core Modules (Weeks 4-7)
- **Week 4:** Household CRUD + Map/GIS foundation (Leaflet with OSM)
- **Week 5:** Document management + PDF certificate generation
- **Week 6:** Blotter/complaints + Officials directory
- **Week 7:** Budget & Finance module

### Phase 3 - Advanced Features (Weeks 8-11)
- **Week 8:** Dashboard & Analytics (Recharts charts, stat cards)
- **Week 9:** Health records (senior, PWD, maternal, immunization)
- **Week 10:** Projects monitoring + Disaster preparedness
- **Week 11:** Reports & data export (CSV, printable reports)

### Phase 4 - Polish & Defense Prep (Weeks 12-14)
- **Week 12:** UI polish, responsiveness, loading states, error boundaries
- **Week 13:** Demo data seeding, role testing, PDF testing
- **Week 14:** Documentation, deployment, defense preparation

---

## Database Schema (Key Models)
- User (staff accounts with roles)
- Purok (barangay subdivisions)
- Household (address, purok, GPS coordinates, housing type, 4Ps)
- Resident (full Filipino demographics, IDs, classifications)
- BarangayOfficial (position, term, signature)
- DocumentRequest (type, status workflow, control number, PDF)
- Blotter + BlotterHearing (complaints, mediation)
- BudgetYear + BudgetAllocation + BudgetTransaction
- Project + ProjectUpdate
- HealthRecord (senior, PWD, maternal, immunization)
- HouseholdDisasterProfile + EvacuationCenter
- AuditLog + SystemSettings

## Philippine-Specific Features
- Purok system (barangay subdivisions)
- Filipino naming (first, middle, last, suffix)
- Civil status per Philippine law (Single, Married, Widowed, Separated, Annulled, Live-in)
- Government IDs (PhilHealth, SSS, Pag-IBIG, TIN, PhilSys National ID)
- 4Ps/Pantawid beneficiary tracking
- Senior Citizen / PWD / Solo Parent / Indigenous People / OFW classification
- SK eligibility (15-30 years old)
- Standard barangay document formats with control numbers
- Philippine Standard Time (UTC+8)
