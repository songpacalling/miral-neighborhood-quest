CREATE TABLE `answers` (
	`seed` integer NOT NULL,
	`student` text NOT NULL,
	`qid` text NOT NULL,
	`choice` text NOT NULL,
	`correct` integer NOT NULL,
	`created` text NOT NULL,
	PRIMARY KEY(`seed`, `student`, `qid`)
);
--> statement-breakpoint
CREATE TABLE `room` (
	`id` integer PRIMARY KEY NOT NULL,
	`seed` integer NOT NULL,
	`revealed` integer DEFAULT 0 NOT NULL
);
