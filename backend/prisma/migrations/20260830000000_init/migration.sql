-- AchieveCell Step 1: core data foundation
CREATE TYPE "SkillSource" AS ENUM ('assessment', 'self_reported', 'project', 'certificate');

CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "education" TEXT,
    "year" INTEGER,
    "target_role_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_email_format_check" CHECK ("email" ~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$')
);

CREATE TABLE "skills" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "career_roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "career_roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_skills" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "skill_id" INTEGER NOT NULL,
    "proficiency" INTEGER NOT NULL,
    "source" "SkillSource" NOT NULL DEFAULT 'self_reported',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_skills_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_skills_proficiency_check" CHECK ("proficiency" BETWEEN 0 AND 100)
);

CREATE TABLE "career_skills" (
    "id" SERIAL NOT NULL,
    "career_role_id" INTEGER NOT NULL,
    "skill_id" INTEGER NOT NULL,
    "importance" INTEGER NOT NULL,
    "required_level" INTEGER NOT NULL,
    CONSTRAINT "career_skills_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "career_skills_importance_check" CHECK ("importance" BETWEEN 0 AND 100),
    CONSTRAINT "career_skills_required_level_check" CHECK ("required_level" BETWEEN 0 AND 100)
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");
CREATE UNIQUE INDEX "career_roles_name_key" ON "career_roles"("name");
CREATE UNIQUE INDEX "user_skills_user_id_skill_id_key" ON "user_skills"("user_id", "skill_id");
CREATE INDEX "user_skills_skill_id_idx" ON "user_skills"("skill_id");
CREATE UNIQUE INDEX "career_skills_career_role_id_skill_id_key" ON "career_skills"("career_role_id", "skill_id");
CREATE INDEX "career_skills_skill_id_idx" ON "career_skills"("skill_id");

ALTER TABLE "users" ADD CONSTRAINT "users_target_role_id_fkey"
  FOREIGN KEY ("target_role_id") REFERENCES "career_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_skill_id_fkey"
  FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "career_skills" ADD CONSTRAINT "career_skills_career_role_id_fkey"
  FOREIGN KEY ("career_role_id") REFERENCES "career_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "career_skills" ADD CONSTRAINT "career_skills_skill_id_fkey"
  FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Keep timestamps accurate even if an administrator updates rows outside Prisma.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updated_at" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON "users"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER career_roles_set_updated_at
  BEFORE UPDATE ON "career_roles"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER user_skills_set_updated_at
  BEFORE UPDATE ON "user_skills"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
