-- Migration: add_nextauth_models (SQLite)
-- Safely evolve existing tables and add NextAuth models.

PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

--------------------------------------------------------------------------------
-- 1) Recreate User (make email/password optional, add emailVerified/image)
--------------------------------------------------------------------------------

-- Create the new shape of the User table
CREATE TABLE "User_new" (
  "id"            TEXT PRIMARY KEY NOT NULL,
  "email"         TEXT,                -- now nullable
  "password"      TEXT,                -- now nullable
  "name"          TEXT,
  "createdAt"     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "tenantId"      TEXT,
  "emailVerified" DATETIME,            -- new
  "image"         TEXT,                -- new
  CONSTRAINT "User_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

-- Copy existing data (new columns will be NULL by default)
INSERT INTO "User_new" ("id","email","password","name","createdAt","tenantId")
SELECT "id","email","password","name","createdAt","tenantId" FROM "User";

-- Drop old table and rename
DROP TABLE "User";
ALTER TABLE "User_new" RENAME TO "User";

-- Unique index on email (SQLite allows multiple NULLs)
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

--------------------------------------------------------------------------------
-- 2) Recreate Session to add ON DELETE CASCADE and keep indexes
--------------------------------------------------------------------------------

-- Create a new Session with FK CASCADE
CREATE TABLE "Session_new" (
  "id"            TEXT PRIMARY KEY NOT NULL,
  "sessionToken"  TEXT NOT NULL,
  "userId"        TEXT NOT NULL,
  "expires"       DATETIME NOT NULL,
  CONSTRAINT "Session_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- Copy data
INSERT INTO "Session_new" ("id","sessionToken","userId","expires")
SELECT "id","sessionToken","userId","expires" FROM "Session";

-- Swap tables
DROP TABLE "Session";
ALTER TABLE "Session_new" RENAME TO "Session";

-- Indexes for Session
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

--------------------------------------------------------------------------------
-- 3) Create Account (NextAuth OAuth accounts)
--------------------------------------------------------------------------------

CREATE TABLE "Account" (
  "id"                 TEXT PRIMARY KEY NOT NULL,
  "userId"             TEXT NOT NULL,
  "type"               TEXT NOT NULL,
  "provider"           TEXT NOT NULL,
  "providerAccountId"  TEXT NOT NULL,

  "refresh_token"      TEXT,
  "access_token"       TEXT,
  "expires_at"         INTEGER,
  "token_type"         TEXT,
  "scope"              TEXT,
  "id_token"           TEXT,
  "session_state"      TEXT,

  CONSTRAINT "Account_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- Uniqueness + lookup performance
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key"
  ON "Account"("provider","providerAccountId");
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

--------------------------------------------------------------------------------
-- 4) Create VerificationToken (NextAuth Email)
--------------------------------------------------------------------------------

CREATE TABLE "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token"      TEXT NOT NULL,
  "expires"    DATETIME NOT NULL
);

-- Uniqueness constraints
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key"
  ON "VerificationToken"("identifier","token");

COMMIT;
PRAGMA foreign_keys=ON;
