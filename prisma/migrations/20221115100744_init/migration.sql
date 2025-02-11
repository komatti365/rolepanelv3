-- CreateTable
CREATE TABLE "selected_message" (
    "key" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,

    CONSTRAINT "selected_message_pkey" PRIMARY KEY ("key")
);
