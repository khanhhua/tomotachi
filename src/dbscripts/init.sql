-- Table: public.friends

CREATE TABLE IF NOT EXISTS public.friends
(
    email character varying(255) COLLATE pg_catalog."en_US.utf8" NOT NULL,
    friends character varying(255)[] COLLATE pg_catalog."en_US.utf8",
    subcribers character varying(255)[] COLLATE pg_catalog."en_US.utf8",
    blockers character varying(255)[] COLLATE pg_catalog."en_US.utf8",
    CONSTRAINT "PK_key" PRIMARY KEY (email)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.friends
    OWNER to postgres;
COMMENT ON TABLE public.friends
    IS 'Friends and their list of friends';

COMMENT ON COLUMN public.friends.friends
    IS 'List of friends (email addresses)';
