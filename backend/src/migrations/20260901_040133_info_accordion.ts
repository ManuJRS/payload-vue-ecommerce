import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "products_info_accordion" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar,
      "content" jsonb
    );

    CREATE TABLE IF NOT EXISTS "_products_v_version_info_accordion" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar,
      "content" jsonb,
      "_uuid" varchar
    );

    DO $$ BEGIN
      ALTER TABLE "products_info_accordion"
        ADD CONSTRAINT "products_info_accordion_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "_products_v_version_info_accordion"
        ADD CONSTRAINT "_products_v_version_info_accordion_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE INDEX IF NOT EXISTS "products_info_accordion_order_idx"
      ON "products_info_accordion" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "products_info_accordion_parent_id_idx"
      ON "products_info_accordion" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_products_v_version_info_accordion_order_idx"
      ON "_products_v_version_info_accordion" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_products_v_version_info_accordion_parent_id_idx"
      ON "_products_v_version_info_accordion" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "_products_v_version_info_accordion" CASCADE;
    DROP TABLE IF EXISTS "products_info_accordion" CASCADE;
  `)
}
