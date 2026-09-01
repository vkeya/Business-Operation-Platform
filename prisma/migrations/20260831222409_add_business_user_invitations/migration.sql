-- CreateTable
CREATE TABLE "BusinessUserInvitation" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "roleId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessUserInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessUserInvitation_token_key" ON "BusinessUserInvitation"("token");

-- CreateIndex
CREATE INDEX "BusinessUserInvitation_businessId_idx" ON "BusinessUserInvitation"("businessId");

-- CreateIndex
CREATE INDEX "BusinessUserInvitation_email_idx" ON "BusinessUserInvitation"("email");

-- CreateIndex
CREATE INDEX "BusinessUserInvitation_roleId_idx" ON "BusinessUserInvitation"("roleId");

-- AddForeignKey
ALTER TABLE "BusinessUserInvitation" ADD CONSTRAINT "BusinessUserInvitation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessUserInvitation" ADD CONSTRAINT "BusinessUserInvitation_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
