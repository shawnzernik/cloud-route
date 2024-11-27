CREATE TABLE "payloads" (
    "guid" UUID PRIMARY KEY,
    "content" TEXT NOT NULL
);

ALTER TABLE "payloads" ADD CONSTRAINT "fk_payloads_contents"
    FOREIGN KEY ("guid") REFERENCES "contents"("guid");