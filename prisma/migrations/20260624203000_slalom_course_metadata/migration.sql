ALTER TABLE "SlalomCourse"
  ADD COLUMN IF NOT EXISTS "authorName" TEXT NOT NULL DEFAULT 'Invitado',
  ADD COLUMN IF NOT EXISTS "layout" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "SlalomCourse"
SET
  "authorName" = COALESCE("authorName", 'Invitado'),
  "layout" = COALESCE("layout", '[]'::jsonb),
  "createdAt" = COALESCE("createdAt", CURRENT_TIMESTAMP),
  "updatedAt" = COALESCE("updatedAt", CURRENT_TIMESTAMP);

CREATE INDEX IF NOT EXISTS "SlalomCourse_createdAt_idx" ON "SlalomCourse"("createdAt");
