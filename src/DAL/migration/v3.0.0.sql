ALTER TABLE "records" ALTER identifier DROP DEFAULT;
ALTER TABLE "records" ADD COLUMN display_path text;
UPDATE "records" SET display_path=uuid_generate_v4();
ALTER TABLE "records" ALTER display_path SET NOT NULL;
