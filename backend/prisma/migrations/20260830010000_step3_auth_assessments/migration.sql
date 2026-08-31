ALTER TABLE "users" ADD COLUMN "password_hash" TEXT;

CREATE TABLE "assessments" (
    "id" SERIAL NOT NULL,
    "skill_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "assessment_questions" (
    "id" SERIAL NOT NULL,
    "assessment_id" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correct_option" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "assessment_questions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "assessment_questions_correct_option_check" CHECK ("correct_option" >= 0)
);

CREATE TABLE "assessment_attempts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "assessment_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "previous_proficiency" INTEGER NOT NULL,
    "updated_proficiency" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "assessment_attempts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "assessment_attempts_score_check" CHECK ("score" BETWEEN 0 AND 100),
    CONSTRAINT "assessment_attempts_previous_proficiency_check" CHECK ("previous_proficiency" BETWEEN 0 AND 100),
    CONSTRAINT "assessment_attempts_updated_proficiency_check" CHECK ("updated_proficiency" BETWEEN 0 AND 100)
);

CREATE UNIQUE INDEX "assessments_skill_id_key" ON "assessments"("skill_id");
CREATE UNIQUE INDEX "assessment_questions_assessment_id_order_key" ON "assessment_questions"("assessment_id", "order");
CREATE INDEX "assessment_attempts_user_id_created_at_idx" ON "assessment_attempts"("user_id", "created_at");

ALTER TABLE "assessments" ADD CONSTRAINT "assessments_skill_id_fkey"
  FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_assessment_id_fkey"
  FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_assessment_id_fkey"
  FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
