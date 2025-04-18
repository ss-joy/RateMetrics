-- CreateTable
CREATE TABLE "ratings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "shop_domain" TEXT NOT NULL,
    "rate_value" INTEGER NOT NULL
);
