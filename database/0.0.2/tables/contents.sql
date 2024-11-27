CREATE TABLE "contents" (
    "guid" UUID PRIMARY KEY,

    "title" VARCHAR(250) NOT NULL,
    "path_and_name" VARCHAR(500) NOT NULL UNIQUE,
    "mime_type" VARCHAR(250) NOT NULL,
    "binary" BOOLEAN NOT NULL,
    "encoded_size" INT NOT NULL,
    "securables_guid" UUID NOT NULL,

    "created" TIMESTAMP NOT NULL,
    "created_by" UUID NOT NULL,
    "modified" TIMESTAMP NOT NULL,
    "modified_by" UUID NOT NULL,
    "deleted" TIMESTAMP,
    "deleted_by" UUID
);

CREATE UNIQUE INDEX "uk_contents_path_and_name_deleted" ON "contents" ("path_and_name", "deleted");