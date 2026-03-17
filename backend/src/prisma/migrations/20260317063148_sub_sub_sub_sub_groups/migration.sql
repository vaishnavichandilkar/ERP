-- CreateTable
CREATE TABLE "sub_sub_sub_sub_groups" (
    "id" SERIAL NOT NULL,
    "sub_sub_sub_group_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "userId" INTEGER,
    "status" "MasterStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_sub_sub_sub_groups_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sub_sub_sub_sub_groups" ADD CONSTRAINT "sub_sub_sub_sub_groups_sub_sub_sub_group_id_fkey" FOREIGN KEY ("sub_sub_sub_group_id") REFERENCES "sub_sub_sub_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_sub_sub_sub_groups" ADD CONSTRAINT "sub_sub_sub_sub_groups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
