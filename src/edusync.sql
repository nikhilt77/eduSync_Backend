-- Database: Project

-- DROP DATABASE IF EXISTS "Project";

CREATE DATABASE "Project"
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_United States.1252'
    LC_CTYPE = 'English_United States.1252'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

-- Table: public.admin_credentials

-- DROP TABLE IF EXISTS public.admin_credentials;

CREATE TABLE IF NOT EXISTS public.admin_credentials
(
    username character varying(25) COLLATE pg_catalog."default" NOT NULL,
    password character varying(25) COLLATE pg_catalog."default",
    role "char",
    CONSTRAINT admin_credentials_pkey PRIMARY KEY (username)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.admin_credentials
    OWNER to postgres;

-- Table: public.assignment_cs5c

-- DROP TABLE IF EXISTS public.assignment_cs5c;

-- Table: public.student

-- DROP TABLE IF EXISTS public.student;

CREATE TABLE IF NOT EXISTS public.student
(
    name character varying(25) COLLATE pg_catalog."default" NOT NULL,
    class character varying(10) COLLATE pg_catalog."default" NOT NULL,
    date_of_birth date,
    phone_number bigint,
    register_no character varying(25) COLLATE pg_catalog."default" NOT NULL,
    password character varying(25) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT student_pkey PRIMARY KEY (register_no)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.student
    OWNER to postgres;

GRANT ALL ON TABLE public.student TO postgres;

-- Table: public.courses

-- DROP TABLE IF EXISTS public.courses;

CREATE TABLE IF NOT EXISTS public.courses
(
    course_name character varying(25) COLLATE pg_catalog."default" NOT NULL,
    credits integer,
    course_no character varying(25) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT courses_pkey PRIMARY KEY (course_no)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.courses
    OWNER to postgres;

GRANT ALL ON TABLE public.courses TO postgres;

-- Table: public.staff

-- DROP TABLE IF EXISTS public.staff;

CREATE TABLE IF NOT EXISTS public.staff
(
    staff_no integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    name character varying(20) COLLATE pg_catalog."default",
    in_charge_of character varying(10) COLLATE pg_catalog."default",
    course_charges json,
    password character varying(25) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT staff_pkey PRIMARY KEY (staff_no)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.staff
    OWNER to postgres;

GRANT ALL ON TABLE public.staff TO postgres;

-- Table: public.schedule_cs5c

-- DROP TABLE IF EXISTS public.schedule_cs5c;

CREATE TABLE IF NOT EXISTS public.schedule_cs5c
(
    day character varying(10) COLLATE pg_catalog."default" NOT NULL,
    hours character varying(25)[] COLLATE pg_catalog."default",
    CONSTRAINT schedule_pkey PRIMARY KEY (day)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.schedule_cs5c
    OWNER to postgres;

GRANT ALL ON TABLE public.schedule_cs5c TO postgres;


CREATE TABLE IF NOT EXISTS public.assignment_cs5c
(
    assignment_no integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    description character varying(1000) COLLATE pg_catalog."default",
    marks integer,
    due_date date,
    staff_no integer NOT NULL,
    course_no character varying(25) COLLATE pg_catalog."default",
    CONSTRAINT assignment_pkey PRIMARY KEY (assignment_no),
    CONSTRAINT coursedetails FOREIGN KEY (course_no)
        REFERENCES public.courses (course_no) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT staffdetails FOREIGN KEY (staff_no)
        REFERENCES public.staff (staff_no) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.assignment_cs5c
    OWNER to postgres;

GRANT ALL ON TABLE public.assignment_cs5c TO postgres;

-- Table: public.assignment_marks_cs5c

-- DROP TABLE IF EXISTS public.assignment_marks_cs5c;

CREATE TABLE IF NOT EXISTS public.assignment_marks_cs5c
(
    assign_m_no integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    total_marks integer,
    award_marks integer,
    assignment_no integer,
    register_no character varying(25) COLLATE pg_catalog."default",
    CONSTRAINT assignment_marks_cs5c_pkey PRIMARY KEY (assign_m_no),
    CONSTRAINT assignmnetdetails FOREIGN KEY (assignment_no)
        REFERENCES public.assignment_cs5c (assignment_no) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT studentdetails FOREIGN KEY (register_no)
        REFERENCES public.student (register_no) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.assignment_marks_cs5c
    OWNER to postgres;

GRANT ALL ON TABLE public.assignment_marks_cs5c TO postgres;

-- Table: public.attendence_cs5c

-- DROP TABLE IF EXISTS public.attendence_cs5c;

CREATE TABLE IF NOT EXISTS public.attendence_cs5c
(
    att_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    date_of_att date,
    hours json,
    day character varying(25) COLLATE pg_catalog."default",
    register_no character varying COLLATE pg_catalog."default",
    CONSTRAINT attendence_cs5c_pkey PRIMARY KEY (att_id),
    CONSTRAINT studentdetails FOREIGN KEY (register_no)
        REFERENCES public.student (register_no) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.attendence_cs5c
    OWNER to postgres;

GRANT ALL ON TABLE public.attendence_cs5c TO postgres;

-- SEQUENCE: public.assignment_assignmentNo_seq

-- DROP SEQUENCE IF EXISTS public."assignment_assignmentNo_seq";

CREATE SEQUENCE IF NOT EXISTS public."assignment_assignmentNo_seq"
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public."assignment_assignmentNo_seq"
    OWNER TO postgres;

-- SEQUENCE: public.assignment_marks_cs5c_assign_m_no_seq

-- DROP SEQUENCE IF EXISTS public.assignment_marks_cs5c_assign_m_no_seq;

CREATE SEQUENCE IF NOT EXISTS public.assignment_marks_cs5c_assign_m_no_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.assignment_marks_cs5c_assign_m_no_seq
    OWNER TO postgres;

-- SEQUENCE: public.attendence_cs5c_attId_seq

-- DROP SEQUENCE IF EXISTS public."attendence_cs5c_attId_seq";

CREATE SEQUENCE IF NOT EXISTS public."attendence_cs5c_attId_seq"
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public."attendence_cs5c_attId_seq"
    OWNER TO postgres;

-- SEQUENCE: public.staff_staffNo_seq

-- DROP SEQUENCE IF EXISTS public."staff_staffNo_seq";

CREATE SEQUENCE IF NOT EXISTS public."staff_staffNo_seq"
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public."staff_staffNo_seq"
    OWNER TO postgres;