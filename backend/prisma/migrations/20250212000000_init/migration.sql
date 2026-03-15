-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SwipeDirection" AS ENUM ('LEFT', 'RIGHT');

-- CreateEnum
CREATE TYPE "DietaryPreference" AS ENUM ('VEGETARIAN', 'VEGAN', 'HALAL', 'KOSHER', 'GLUTEN_FREE', 'NONE');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "google_id" TEXT,
    "name" TEXT,
    "avatar_url" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "refresh_token_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "search_radius_km" INTEGER NOT NULL DEFAULT 5,
    "price_range_min" INTEGER,
    "price_range_max" INTEGER,
    "dietary_preferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cuisine_preferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurants" (
    "id" UUID NOT NULL,
    "external_id" TEXT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "cuisine_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "price_level" INTEGER,
    "rating" REAL,
    "image_url" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "swipes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "direction" "SwipeDirection" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "swipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "invite_code" VARCHAR(12) NOT NULL,
    "admin_id" UUID NOT NULL,
    "match_threshold" INTEGER NOT NULL DEFAULT 100,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_members" (
    "id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_matches" (
    "id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "matched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_matches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_external_id_key" ON "restaurants"("external_id");

-- CreateIndex
CREATE INDEX "restaurants_latitude_longitude_idx" ON "restaurants"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "restaurants_deleted_at_idx" ON "restaurants"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "swipes_user_id_restaurant_id_key" ON "swipes"("user_id", "restaurant_id");

-- CreateIndex
CREATE INDEX "swipes_user_id_idx" ON "swipes"("user_id");

-- CreateIndex
CREATE INDEX "swipes_restaurant_id_idx" ON "swipes"("restaurant_id");

-- CreateIndex
CREATE INDEX "swipes_user_id_direction_idx" ON "swipes"("user_id", "direction");

-- CreateIndex
CREATE UNIQUE INDEX "groups_invite_code_key" ON "groups"("invite_code");

-- CreateIndex
CREATE INDEX "groups_admin_id_idx" ON "groups"("admin_id");

-- CreateIndex
CREATE INDEX "groups_deleted_at_idx" ON "groups"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "group_members_group_id_user_id_key" ON "group_members"("group_id", "user_id");

-- CreateIndex
CREATE INDEX "group_members_group_id_idx" ON "group_members"("group_id");

-- CreateIndex
CREATE INDEX "group_members_user_id_idx" ON "group_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_matches_group_id_restaurant_id_key" ON "group_matches"("group_id", "restaurant_id");

-- CreateIndex
CREATE INDEX "group_matches_group_id_idx" ON "group_matches"("group_id");

-- CreateIndex
CREATE INDEX "group_matches_matched_at_idx" ON "group_matches"("matched_at");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_matches" ADD CONSTRAINT "group_matches_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_matches" ADD CONSTRAINT "group_matches_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
