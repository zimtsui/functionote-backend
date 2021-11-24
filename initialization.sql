BEGIN TRANSACTION;
DROP TABLE IF EXISTS "users";
CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER NOT NULL UNIQUE,
	"name"	TEXT NOT NULL UNIQUE,
	"password"	TEXT NOT NULL,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "branches";
CREATE TABLE IF NOT EXISTS "branches" (
	"id"	INTEGER NOT NULL UNIQUE,
	"latest_version_id"	BIGINT NOT NULL UNIQUE,
	FOREIGN KEY("latest_version_id") REFERENCES "fnodes_metadata"("id"),
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "subscriptions";
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"user_id"	INTEGER NOT NULL,
	"branch_name"	TEXT NOT NULL,
	"branch_id"	INTEGER NOT NULL,
	FOREIGN KEY("user_id") REFERENCES "users"("id"),
	FOREIGN KEY("branch_id") REFERENCES "branches"("id"),
	PRIMARY KEY("user_id","branch_name")
);
INSERT INTO "users" ("id","name","password") VALUES (1,'admin','admin');
INSERT INTO "branches" ("id","latest_version_id") VALUES (1,1);
INSERT INTO "subscriptions" ("user_id","branch_name","branch_id") VALUES (1,'master',1);
COMMIT;
