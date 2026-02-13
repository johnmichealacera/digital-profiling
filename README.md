# Barangay Digital Profiling System

A full-featured **barangay management and digital profiling system** built for **Barangay Taruc, Socorro, Surigao del Norte, Philippines**. It centralizes resident data, household records, document requests with PDF certificate generation, blotter/complaints, barangay map (GIS), budget, projects, health records, and role-based access for barangay staff.

---

## Features & Capabilities

### Dashboard & Analytics
- **Real-time statistics**: Total population, households, male/female ratio, senior citizens, PWD, 4Ps beneficiaries, solo parents, registered voters, OFW count
- **Pending documents** and **active blotter** counts
- **Charts**: Age distribution (0–14, 15–30, 31–59, 60+), sex ratio, population by purok, civil status distribution
- Role-based visibility; all staff roles can access the dashboard

### Resident Profiling
- Full **CRUD** for residents with Filipino naming (first, middle, last, suffix)
- **Demographics**: Sex, date of birth, civil status (Single, Married, Widowed, Separated, Annulled, Live-in), education, employment
- **Government IDs**: PhilHealth, SSS, Pag-IBIG, TIN, PhilSys National ID
- **Classifications**: Senior Citizen, PWD (with type), 4Ps/Pantawid beneficiary, Solo Parent, Indigenous People, OFW, voter status
- **SK eligibility** (15–30 years) and relationship to household head
- Search, filters, and resident profile view with household and purok info

### Household Management
- **Household CRUD** linked to **puroks** (barangay subdivisions)
- **Housing profile**: Housing type (Owned, Rented, Shared, Informal Settler), roof/wall materials, toilet facility, water source
- **4Ps** and **GPS coordinates** for mapping
- List and detail views with resident linkage

### Barangay Map (GIS)
- **Interactive map** (Leaflet + OpenStreetMap) centered on Barangay Taruc
- Households plotted by GPS with purok-based organization
- Visual overview of resident and household distribution

### Document Management
- **Document request workflow**: Create requests for residents with purpose, optional fee, and official receipt number
- **Document types**: Barangay Clearance, Certificate of Indigency, Certificate of Residency, Business Permit, Certificate of Good Moral Character, Barangay ID, First Time Job Seeker Certificate, Solo Parent Certificate
- **Business Permit** fields: Business name, type, address
- **Status flow**: Pending → Processing → Ready → Released (or Rejected/Cancelled)
- **PDF certificate generation** (pdf-lib) with control numbers, resident and barangay details, and captain signature
- Filtering by status, type, and date; table view of all requests

### Blotter / Complaints
- Blotter module for **incident reports** and case tracking
- **Nature of complaint**: Physical/verbal assault, theft, trespassing, noise, domestic dispute, property damage, estafa, threat, other
- **Status workflow**: Filed, Under Mediation, Settled, Escalated, Closed, Withdrawn
- Dashboard shows count of active (Filed / Under Mediation) blotters

### Barangay Officials
- **Officials directory** with position, term, and signature support for document signing
- Used in PDF certificate generation (e.g. Punong Barangay)

### Budget & Finance
- **Budget years**, allocations, and transactions
- **Categories**: Personal Services, MOOE, Capital Outlay, Trust Fund
- Access for Captain, Secretary, Treasurer, Super Admin

### Projects
- **Project monitoring** with status: Planned, Ongoing, Completed, Suspended, Cancelled
- Project updates and timeline support
- Access for Captain, Secretary, Kagawad, Super Admin

### Health & Safety
- **Health records** (senior citizens, PWD, maternal, immunization)
- **Disaster preparedness**: Evacuation centers, household disaster profiles, vulnerability mapping
- Roles: Captain, Secretary, SK Chairman, Super Admin

### System & Administration
- **User management** (staff accounts, roles) — Super Admin only
- **Settings / Puroks** — manage purok list and order
- **Role-based sidebar**: Menu items shown per role

### Authentication & Roles
- **NextAuth.js** (Credentials Provider) with session and middleware protection
- **Roles**: Super Admin, Barangay Captain, Secretary, Treasurer, Kagawad, SK Chairman
- **RBAC**: Route and UI visibility by role; dashboard, residents, map, documents, blotter, officials, budget, projects, health, disaster, users, and settings scoped per role

---

## Philippine-Specific Design
- **Purok system** for barangay subdivisions
- **Filipino civil status** and naming conventions
- **Government ID fields** (PhilHealth, SSS, Pag-IBIG, TIN, PhilSys)
- **4Ps/Pantawid** and special classifications (Senior, PWD, Solo Parent, IP, OFW)
- **SK eligibility** (age 15–30)
- **Standard barangay document types** and control number prefixes (BC, CI, CR, BP, etc.)
- **Barangay Taruc** branding and address in PDFs and UI

---

## Tech Stack
| Layer        | Technology |
|-------------|------------|
| Framework   | Next.js 16 (App Router) + TypeScript |
| Database    | PostgreSQL + Prisma ORM |
| Auth        | NextAuth.js (Credentials, RBAC) |
| UI          | Tailwind CSS v4, shadcn/ui, Radix UI |
| Forms       | react-hook-form + Zod |
| Data        | TanStack React Query |
| Charts      | Recharts |
| Maps        | Leaflet + react-leaflet (OpenStreetMap) |
| PDF         | pdf-lib (certificate generation) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm (or yarn/pnpm)

### 1. Clone and install
```bash
git clone <repository-url>
cd digital-profiling
npm install
```

### 2. Environment
Create `.env` in the project root (see `.env.example` if present). Minimum:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database
```bash
npm run db:push      # Push schema (dev)
# or
npm run db:migrate   # Run migrations
npm run db:seed      # Seed puroks, users, sample data
```

### 4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Log in with a seeded user (e.g. from `prisma/seed.ts`).

---

## Scripts
| Command        | Description |
|----------------|-------------|
| `npm run dev`  | Start dev server (Turbopack) |
| `npm run build`| Prisma generate + Next.js build |
| `npm run start`| Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push`     | Push schema to DB (no migrations) |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed`    | Seed database |
| `npm run db:reset`   | Reset DB and re-seed |
| `npm run typecheck`  | TypeScript check |
| `npm run lint`       | ESLint |

---

## Project Structure (high level)
- `src/app/` — App Router: `(auth)/login`, `(dashboard)/` (dashboard, residents, households, map, documents, blotter, officials, budget, projects, health, disaster, settings)
- `src/app/api/` — API routes: auth, residents, households, map/households, documents (CRUD + generate PDF)
- `src/components/` — UI: layout (sidebar, topbar), dashboard charts, residents, households, map, documents
- `src/lib/` — Prisma client, auth, permissions, validations (Zod), PDF generation, constants, utils
- `prisma/` — Schema, migrations, seed

---

## License
Private / project use. Adjust as needed for your organization.
