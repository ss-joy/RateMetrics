/*
  Warnings:

  - You are about to alter the column `product_id` on the `ratings` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `shop_id` on the `ratings` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `user_id` on the `ratings` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ratings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "shop_id" BIGINT NOT NULL,
    "shop_domain" TEXT NOT NULL,
    "rate_value" INTEGER NOT NULL
);
INSERT INTO "new_ratings" ("id", "product_id", "rate_value", "shop_domain", "shop_id", "user_id") SELECT "id", "product_id", "rate_value", "shop_domain", "shop_id", "user_id" FROM "ratings";
DROP TABLE "ratings";
ALTER TABLE "new_ratings" RENAME TO "ratings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
