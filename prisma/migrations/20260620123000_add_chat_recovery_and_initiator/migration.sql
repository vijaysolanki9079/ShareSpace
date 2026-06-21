ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "chatRecoveryQuestion" TEXT,
ADD COLUMN IF NOT EXISTS "chatRecoveryAnswerHash" TEXT;

ALTER TABLE "NGO"
ADD COLUMN IF NOT EXISTS "chatRecoveryQuestion" TEXT,
ADD COLUMN IF NOT EXISTS "chatRecoveryAnswerHash" TEXT;

ALTER TABLE "Conversation"
ADD COLUMN IF NOT EXISTS "initiatorId" TEXT;

UPDATE "Conversation" c
SET "initiatorId" = COALESCE(
  (
    SELECT m."senderId"
    FROM "Message" m
    WHERE m."conversationId" = c.id
    ORDER BY m."createdAt" ASC
    LIMIT 1
  ),
  c."user1Id",
  c."ngo1Id"
)
WHERE c."initiatorId" IS NULL;
