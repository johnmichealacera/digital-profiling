-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'CAPTAIN', 'SECRETARY', 'TREASURER', 'KAGAWAD', 'SK_CHAIRMAN');

-- CreateEnum
CREATE TYPE "CivilStatus" AS ENUM ('SINGLE', 'MARRIED', 'WIDOWED', 'SEPARATED', 'ANNULLED', 'LIVE_IN');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "EducationalAttainment" AS ENUM ('NO_FORMAL_EDUCATION', 'ELEMENTARY_LEVEL', 'ELEMENTARY_GRADUATE', 'HIGH_SCHOOL_LEVEL', 'HIGH_SCHOOL_GRADUATE', 'VOCATIONAL', 'COLLEGE_LEVEL', 'COLLEGE_GRADUATE', 'POST_GRADUATE');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('EMPLOYED', 'SELF_EMPLOYED', 'UNEMPLOYED', 'RETIRED', 'STUDENT', 'OFW');

-- CreateEnum
CREATE TYPE "ResidentStatus" AS ENUM ('ACTIVE', 'DECEASED', 'TRANSFERRED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('BARANGAY_CLEARANCE', 'CERTIFICATE_OF_INDIGENCY', 'CERTIFICATE_OF_RESIDENCY', 'BUSINESS_PERMIT', 'CERTIFICATE_OF_GOOD_MORAL', 'BARANGAY_ID', 'FIRST_TIME_JOB_SEEKER', 'SOLO_PARENT_CERTIFICATE');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'RELEASED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BlotterStatus" AS ENUM ('FILED', 'UNDER_MEDIATION', 'SETTLED', 'ESCALATED', 'CLOSED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "BlotterNature" AS ENUM ('PHYSICAL_ASSAULT', 'VERBAL_ASSAULT', 'THEFT', 'TRESPASSING', 'NOISE_COMPLAINT', 'DOMESTIC_DISPUTE', 'PROPERTY_DAMAGE', 'ESTAFA', 'THREAT', 'OTHER');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNED', 'ONGOING', 'COMPLETED', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BudgetCategory" AS ENUM ('PERSONAL_SERVICES', 'MAINTENANCE_AND_OTHER_OPERATING_EXPENSES', 'CAPITAL_OUTLAY', 'TRUST_FUND');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "HealthCategory" AS ENUM ('SENIOR_CITIZEN', 'PWD', 'PREGNANT', 'LACTATING', 'CHILD_0_TO_5', 'MALNOURISHED', 'HYPERTENSIVE', 'DIABETIC');

-- CreateEnum
CREATE TYPE "DisasterRiskLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW', 'SAFE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'SECRETARY',
    "position" TEXT,
    "contactNo" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "puroks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "puroks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "households" (
    "id" TEXT NOT NULL,
    "houseNo" TEXT,
    "streetSitio" TEXT,
    "purokId" TEXT NOT NULL,
    "barangay" TEXT NOT NULL DEFAULT 'Taruc',
    "municipality" TEXT NOT NULL DEFAULT 'Socorro',
    "province" TEXT NOT NULL DEFAULT 'Surigao del Norte',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "housingType" TEXT,
    "roofMaterial" TEXT,
    "wallMaterial" TEXT,
    "toiletFacility" TEXT,
    "waterSource" TEXT,
    "is4PsBeneficiary" BOOLEAN NOT NULL DEFAULT false,
    "fourPsHouseholdId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "households_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "residents" (
    "id" TEXT NOT NULL,
    "householdId" TEXT,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "suffix" TEXT,
    "sex" "Sex" NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "placeOfBirth" TEXT,
    "civilStatus" "CivilStatus" NOT NULL DEFAULT 'SINGLE',
    "citizenship" TEXT NOT NULL DEFAULT 'Filipino',
    "religion" TEXT,
    "bloodType" TEXT,
    "contactNo" TEXT,
    "emailAddress" TEXT,
    "voterStatus" BOOLEAN NOT NULL DEFAULT false,
    "voterIdNo" TEXT,
    "philhealthNo" TEXT,
    "sssNo" TEXT,
    "pagibigNo" TEXT,
    "tinNo" TEXT,
    "nationalIdNo" TEXT,
    "isSeniorCitizen" BOOLEAN NOT NULL DEFAULT false,
    "seniorCitizenIdNo" TEXT,
    "isPwd" BOOLEAN NOT NULL DEFAULT false,
    "pwdIdNo" TEXT,
    "pwdType" TEXT,
    "isSoloParent" BOOLEAN NOT NULL DEFAULT false,
    "soloParentIdNo" TEXT,
    "is4PsBeneficiary" BOOLEAN NOT NULL DEFAULT false,
    "isOFW" BOOLEAN NOT NULL DEFAULT false,
    "isIndigenousPeople" BOOLEAN NOT NULL DEFAULT false,
    "indigenousGroup" TEXT,
    "isSkMember" BOOLEAN NOT NULL DEFAULT false,
    "educationalAttainment" "EducationalAttainment",
    "occupation" TEXT,
    "employmentStatus" "EmploymentStatus",
    "employer" TEXT,
    "monthlyIncome" DECIMAL(12,2),
    "photoUrl" TEXT,
    "yearsInBarangay" INTEGER,
    "previousAddress" TEXT,
    "status" "ResidentStatus" NOT NULL DEFAULT 'ACTIVE',
    "isHouseholdHead" BOOLEAN NOT NULL DEFAULT false,
    "relationshipToHead" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "residents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barangay_officials" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "suffix" TEXT,
    "position" TEXT NOT NULL,
    "committee" TEXT,
    "termStart" TIMESTAMP(3) NOT NULL,
    "termEnd" TIMESTAMP(3) NOT NULL,
    "isIncumbent" BOOLEAN NOT NULL DEFAULT true,
    "contactNo" TEXT,
    "photoUrl" TEXT,
    "signature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barangay_officials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_requests" (
    "id" TEXT NOT NULL,
    "controlNo" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "purpose" TEXT NOT NULL,
    "businessName" TEXT,
    "businessType" TEXT,
    "businessAddress" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "officialReceipt" TEXT,
    "feeAmount" DECIMAL(8,2),
    "encodedById" TEXT,
    "issuedById" TEXT,
    "releasedAt" TIMESTAMP(3),
    "remarks" TEXT,
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blotters" (
    "id" TEXT NOT NULL,
    "blotterNo" TEXT NOT NULL,
    "incidentDate" TIMESTAMP(3) NOT NULL,
    "incidentPlace" TEXT NOT NULL,
    "nature" "BlotterNature" NOT NULL,
    "natureDetails" TEXT,
    "narrative" TEXT NOT NULL,
    "complainantId" TEXT,
    "complainantName" TEXT,
    "respondentId" TEXT,
    "respondentName" TEXT,
    "witnesses" TEXT[],
    "status" "BlotterStatus" NOT NULL DEFAULT 'FILED',
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "resolvedById" TEXT,
    "filedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blotters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blotter_hearings" (
    "id" TEXT NOT NULL,
    "blotterId" TEXT NOT NULL,
    "hearingDate" TIMESTAMP(3) NOT NULL,
    "venue" TEXT NOT NULL DEFAULT 'Barangay Hall',
    "notes" TEXT,
    "outcome" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blotter_hearings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_years" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "totalBudget" DECIMAL(15,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_allocations" (
    "id" TEXT NOT NULL,
    "budgetYearId" TEXT NOT NULL,
    "category" "BudgetCategory" NOT NULL,
    "particulars" TEXT NOT NULL,
    "allocatedAmount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_transactions" (
    "id" TEXT NOT NULL,
    "budgetYearId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "category" "BudgetCategory" NOT NULL,
    "particulars" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "officialReceipt" TEXT,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "remarks" TEXT,
    "encodedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "location" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNED',
    "startDate" TIMESTAMP(3),
    "targetEndDate" TIMESTAMP(3),
    "actualEndDate" TIMESTAMP(3),
    "budget" DECIMAL(12,2),
    "fundSource" TEXT,
    "contractor" TEXT,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "beneficiaries" INTEGER,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_updates" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "updateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "narrative" TEXT NOT NULL,
    "progressPercent" INTEGER,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_records" (
    "id" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "category" "HealthCategory" NOT NULL,
    "seniorCategory" TEXT,
    "disabilityType" TEXT,
    "disabilityCause" TEXT,
    "lastMenstrualPeriod" TIMESTAMP(3),
    "expectedDueDate" TIMESTAMP(3),
    "deliveryDate" TIMESTAMP(3),
    "deliveryOutcome" TEXT,
    "bcg" BOOLEAN NOT NULL DEFAULT false,
    "dpt1" BOOLEAN NOT NULL DEFAULT false,
    "dpt2" BOOLEAN NOT NULL DEFAULT false,
    "dpt3" BOOLEAN NOT NULL DEFAULT false,
    "opv1" BOOLEAN NOT NULL DEFAULT false,
    "opv2" BOOLEAN NOT NULL DEFAULT false,
    "opv3" BOOLEAN NOT NULL DEFAULT false,
    "measles" BOOLEAN NOT NULL DEFAULT false,
    "hepaB1" BOOLEAN NOT NULL DEFAULT false,
    "hepaB2" BOOLEAN NOT NULL DEFAULT false,
    "hepaB3" BOOLEAN NOT NULL DEFAULT false,
    "weightKg" DECIMAL(5,2),
    "heightCm" DECIMAL(5,2),
    "nutritionalStatus" TEXT,
    "lastVisitDate" TIMESTAMP(3),
    "nextVisitDate" TIMESTAMP(3),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "household_disaster_profiles" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "riskLevel" "DisasterRiskLevel" NOT NULL DEFAULT 'LOW',
    "hazardTypes" TEXT[],
    "evacuationCenter" TEXT,
    "distanceToEvacCenter" DOUBLE PRECISION,
    "hasPWD" BOOLEAN NOT NULL DEFAULT false,
    "hasSenior" BOOLEAN NOT NULL DEFAULT false,
    "hasPregnant" BOOLEAN NOT NULL DEFAULT false,
    "hasInfant" BOOLEAN NOT NULL DEFAULT false,
    "hasChronicIll" BOOLEAN NOT NULL DEFAULT false,
    "emergencyContactName" TEXT,
    "emergencyContactNo" TEXT,
    "emergencyContactRelation" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "household_disaster_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evacuation_centers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "capacity" INTEGER,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "contactNo" TEXT,
    "facilities" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evacuation_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "puroks_name_key" ON "puroks"("name");

-- CreateIndex
CREATE INDEX "residents_lastName_firstName_idx" ON "residents"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "residents_householdId_idx" ON "residents"("householdId");

-- CreateIndex
CREATE INDEX "residents_isSeniorCitizen_idx" ON "residents"("isSeniorCitizen");

-- CreateIndex
CREATE INDEX "residents_isPwd_idx" ON "residents"("isPwd");

-- CreateIndex
CREATE INDEX "residents_is4PsBeneficiary_idx" ON "residents"("is4PsBeneficiary");

-- CreateIndex
CREATE UNIQUE INDEX "document_requests_controlNo_key" ON "document_requests"("controlNo");

-- CreateIndex
CREATE INDEX "document_requests_residentId_idx" ON "document_requests"("residentId");

-- CreateIndex
CREATE INDEX "document_requests_documentType_idx" ON "document_requests"("documentType");

-- CreateIndex
CREATE INDEX "document_requests_status_idx" ON "document_requests"("status");

-- CreateIndex
CREATE INDEX "document_requests_createdAt_idx" ON "document_requests"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "blotters_blotterNo_key" ON "blotters"("blotterNo");

-- CreateIndex
CREATE INDEX "blotters_blotterNo_idx" ON "blotters"("blotterNo");

-- CreateIndex
CREATE INDEX "blotters_status_idx" ON "blotters"("status");

-- CreateIndex
CREATE INDEX "blotters_incidentDate_idx" ON "blotters"("incidentDate");

-- CreateIndex
CREATE UNIQUE INDEX "budget_years_year_key" ON "budget_years"("year");

-- CreateIndex
CREATE INDEX "budget_transactions_budgetYearId_idx" ON "budget_transactions"("budgetYearId");

-- CreateIndex
CREATE INDEX "budget_transactions_type_idx" ON "budget_transactions"("type");

-- CreateIndex
CREATE INDEX "budget_transactions_transactionDate_idx" ON "budget_transactions"("transactionDate");

-- CreateIndex
CREATE INDEX "health_records_residentId_idx" ON "health_records"("residentId");

-- CreateIndex
CREATE INDEX "health_records_category_idx" ON "health_records"("category");

-- CreateIndex
CREATE UNIQUE INDEX "household_disaster_profiles_householdId_key" ON "household_disaster_profiles"("householdId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "households" ADD CONSTRAINT "households_purokId_fkey" FOREIGN KEY ("purokId") REFERENCES "puroks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residents" ADD CONSTRAINT "residents_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_requests" ADD CONSTRAINT "document_requests_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "residents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_requests" ADD CONSTRAINT "document_requests_encodedById_fkey" FOREIGN KEY ("encodedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_requests" ADD CONSTRAINT "document_requests_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blotters" ADD CONSTRAINT "blotters_complainantId_fkey" FOREIGN KEY ("complainantId") REFERENCES "residents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blotters" ADD CONSTRAINT "blotters_respondentId_fkey" FOREIGN KEY ("respondentId") REFERENCES "residents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blotters" ADD CONSTRAINT "blotters_filedById_fkey" FOREIGN KEY ("filedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blotters" ADD CONSTRAINT "blotters_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blotter_hearings" ADD CONSTRAINT "blotter_hearings_blotterId_fkey" FOREIGN KEY ("blotterId") REFERENCES "blotters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_allocations" ADD CONSTRAINT "budget_allocations_budgetYearId_fkey" FOREIGN KEY ("budgetYearId") REFERENCES "budget_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_transactions" ADD CONSTRAINT "budget_transactions_budgetYearId_fkey" FOREIGN KEY ("budgetYearId") REFERENCES "budget_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_transactions" ADD CONSTRAINT "budget_transactions_encodedById_fkey" FOREIGN KEY ("encodedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_updates" ADD CONSTRAINT "project_updates_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_records" ADD CONSTRAINT "health_records_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "residents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_disaster_profiles" ADD CONSTRAINT "household_disaster_profiles_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
