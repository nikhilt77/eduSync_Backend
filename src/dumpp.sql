toc.dat                                                                                             0000600 0004000 0002000 00000030646 14700527637 0014463 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        PGDMP                   	    |            Project    16.3    16.3 )    !           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false         "           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false         #           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false         $           1262    16398    Project    DATABASE     �   CREATE DATABASE "Project" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE "Project";
                postgres    false         �            1259    16566    admin_credentials    TABLE     �   CREATE TABLE public.admin_credentials (
    username character varying(25) NOT NULL,
    password character varying(25),
    role "char"
);
 %   DROP TABLE public.admin_credentials;
       public         heap    postgres    false         �            1259    16479    assignment_cs5c    TABLE     �   CREATE TABLE public.assignment_cs5c (
    assignment_no integer NOT NULL,
    description character varying(1000),
    marks integer,
    due_date date,
    staff_no integer NOT NULL,
    course_no character varying(25)
);
 #   DROP TABLE public.assignment_cs5c;
       public         heap    postgres    false         �            1259    16478    assignment_assignmentNo_seq    SEQUENCE     �   ALTER TABLE public.assignment_cs5c ALTER COLUMN assignment_no ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."assignment_assignmentNo_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public          postgres    false    221         �            1259    16523    assignment_marks_cs5c    TABLE     �   CREATE TABLE public.assignment_marks_cs5c (
    assign_m_no integer NOT NULL,
    total_marks integer,
    award_marks integer,
    assignment_no integer,
    register_no character varying(25)
);
 )   DROP TABLE public.assignment_marks_cs5c;
       public         heap    postgres    false         �            1259    16533 %   assignment_marks_cs5c_assign_m_no_seq    SEQUENCE     �   ALTER TABLE public.assignment_marks_cs5c ALTER COLUMN assign_m_no ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.assignment_marks_cs5c_assign_m_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public          postgres    false    224         �            1259    16435    attendence_cs5c    TABLE     �   CREATE TABLE public.attendence_cs5c (
    att_id integer NOT NULL,
    date_of_att date,
    hours json,
    day character varying(25),
    register_no character varying
);
 #   DROP TABLE public.attendence_cs5c;
       public         heap    postgres    false         �            1259    16496    attendence_cs5c_attId_seq    SEQUENCE     �   ALTER TABLE public.attendence_cs5c ALTER COLUMN att_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."attendence_cs5c_attId_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public          postgres    false    218         �            1259    16404    courses    TABLE     �   CREATE TABLE public.courses (
    course_name character varying(25) NOT NULL,
    credits integer,
    course_no character varying(25) NOT NULL
);
    DROP TABLE public.courses;
       public         heap    postgres    false         �            1259    16471    schedule_cs5c    TABLE     q   CREATE TABLE public.schedule_cs5c (
    day character varying(10) NOT NULL,
    hours character varying(25)[]
);
 !   DROP TABLE public.schedule_cs5c;
       public         heap    postgres    false         �            1259    16411    staff    TABLE     �   CREATE TABLE public.staff (
    staff_no integer NOT NULL,
    name character varying(20),
    in_charge_of character varying(10),
    course_charges json,
    password character varying(25) NOT NULL
);
    DROP TABLE public.staff;
       public         heap    postgres    false         �            1259    16499    staff_staffNo_seq    SEQUENCE     �   ALTER TABLE public.staff ALTER COLUMN staff_no ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."staff_staffNo_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public          postgres    false    217         �            1259    16399    student    TABLE       CREATE TABLE public.student (
    name character varying(25) NOT NULL,
    class character varying(10) NOT NULL,
    date_of_birth date,
    phone_number bigint,
    register_no character varying(25) NOT NULL,
    password character varying(25) NOT NULL
);
    DROP TABLE public.student;
       public         heap    postgres    false                   0    16566    admin_credentials 
   TABLE DATA           E   COPY public.admin_credentials (username, password, role) FROM stdin;
    public          postgres    false    226       4894.dat           0    16479    assignment_cs5c 
   TABLE DATA           k   COPY public.assignment_cs5c (assignment_no, description, marks, due_date, staff_no, course_no) FROM stdin;
    public          postgres    false    221       4889.dat           0    16523    assignment_marks_cs5c 
   TABLE DATA           r   COPY public.assignment_marks_cs5c (assign_m_no, total_marks, award_marks, assignment_no, register_no) FROM stdin;
    public          postgres    false    224       4892.dat           0    16435    attendence_cs5c 
   TABLE DATA           W   COPY public.attendence_cs5c (att_id, date_of_att, hours, day, register_no) FROM stdin;
    public          postgres    false    218       4886.dat           0    16404    courses 
   TABLE DATA           B   COPY public.courses (course_name, credits, course_no) FROM stdin;
    public          postgres    false    216       4884.dat           0    16471    schedule_cs5c 
   TABLE DATA           3   COPY public.schedule_cs5c (day, hours) FROM stdin;
    public          postgres    false    219       4887.dat           0    16411    staff 
   TABLE DATA           W   COPY public.staff (staff_no, name, in_charge_of, course_charges, password) FROM stdin;
    public          postgres    false    217       4885.dat           0    16399    student 
   TABLE DATA           b   COPY public.student (name, class, date_of_birth, phone_number, register_no, password) FROM stdin;
    public          postgres    false    215       4883.dat %           0    0    assignment_assignmentNo_seq    SEQUENCE SET     L   SELECT pg_catalog.setval('public."assignment_assignmentNo_seq"', 1, false);
          public          postgres    false    220         &           0    0 %   assignment_marks_cs5c_assign_m_no_seq    SEQUENCE SET     T   SELECT pg_catalog.setval('public.assignment_marks_cs5c_assign_m_no_seq', 1, false);
          public          postgres    false    225         '           0    0    attendence_cs5c_attId_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public."attendence_cs5c_attId_seq"', 4, true);
          public          postgres    false    222         (           0    0    staff_staffNo_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public."staff_staffNo_seq"', 4, true);
          public          postgres    false    223         ~           2606    16570 (   admin_credentials admin_credentials_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public.admin_credentials
    ADD CONSTRAINT admin_credentials_pkey PRIMARY KEY (username);
 R   ALTER TABLE ONLY public.admin_credentials DROP CONSTRAINT admin_credentials_pkey;
       public            postgres    false    226         |           2606    16527 0   assignment_marks_cs5c assignment_marks_cs5c_pkey 
   CONSTRAINT     w   ALTER TABLE ONLY public.assignment_marks_cs5c
    ADD CONSTRAINT assignment_marks_cs5c_pkey PRIMARY KEY (assign_m_no);
 Z   ALTER TABLE ONLY public.assignment_marks_cs5c DROP CONSTRAINT assignment_marks_cs5c_pkey;
       public            postgres    false    224         z           2606    16485    assignment_cs5c assignment_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public.assignment_cs5c
    ADD CONSTRAINT assignment_pkey PRIMARY KEY (assignment_no);
 I   ALTER TABLE ONLY public.assignment_cs5c DROP CONSTRAINT assignment_pkey;
       public            postgres    false    221         v           2606    16441 $   attendence_cs5c attendence_cs5c_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.attendence_cs5c
    ADD CONSTRAINT attendence_cs5c_pkey PRIMARY KEY (att_id);
 N   ALTER TABLE ONLY public.attendence_cs5c DROP CONSTRAINT attendence_cs5c_pkey;
       public            postgres    false    218         r           2606    16540    courses courses_pkey 
   CONSTRAINT     Y   ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (course_no);
 >   ALTER TABLE ONLY public.courses DROP CONSTRAINT courses_pkey;
       public            postgres    false    216         x           2606    16477    schedule_cs5c schedule_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.schedule_cs5c
    ADD CONSTRAINT schedule_pkey PRIMARY KEY (day);
 E   ALTER TABLE ONLY public.schedule_cs5c DROP CONSTRAINT schedule_pkey;
       public            postgres    false    219         t           2606    16415    staff staff_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (staff_no);
 :   ALTER TABLE ONLY public.staff DROP CONSTRAINT staff_pkey;
       public            postgres    false    217         p           2606    16572    student student_pkey 
   CONSTRAINT     [   ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_pkey PRIMARY KEY (register_no);
 >   ALTER TABLE ONLY public.student DROP CONSTRAINT student_pkey;
       public            postgres    false    215         �           2606    16556 '   assignment_marks_cs5c assignmnetdetails    FK CONSTRAINT     �   ALTER TABLE ONLY public.assignment_marks_cs5c
    ADD CONSTRAINT assignmnetdetails FOREIGN KEY (assignment_no) REFERENCES public.assignment_cs5c(assignment_no) ON DELETE CASCADE NOT VALID;
 Q   ALTER TABLE ONLY public.assignment_marks_cs5c DROP CONSTRAINT assignmnetdetails;
       public          postgres    false    4730    221    224         �           2606    16551    assignment_cs5c coursedetails    FK CONSTRAINT     �   ALTER TABLE ONLY public.assignment_cs5c
    ADD CONSTRAINT coursedetails FOREIGN KEY (course_no) REFERENCES public.courses(course_no) ON DELETE CASCADE NOT VALID;
 G   ALTER TABLE ONLY public.assignment_cs5c DROP CONSTRAINT coursedetails;
       public          postgres    false    216    4722    221         �           2606    16546    assignment_cs5c staffdetails    FK CONSTRAINT     �   ALTER TABLE ONLY public.assignment_cs5c
    ADD CONSTRAINT staffdetails FOREIGN KEY (staff_no) REFERENCES public.staff(staff_no) ON DELETE CASCADE NOT VALID;
 F   ALTER TABLE ONLY public.assignment_cs5c DROP CONSTRAINT staffdetails;
       public          postgres    false    221    4724    217         �           2606    16573 $   assignment_marks_cs5c studentdetails    FK CONSTRAINT     �   ALTER TABLE ONLY public.assignment_marks_cs5c
    ADD CONSTRAINT studentdetails FOREIGN KEY (register_no) REFERENCES public.student(register_no) ON DELETE CASCADE NOT VALID;
 N   ALTER TABLE ONLY public.assignment_marks_cs5c DROP CONSTRAINT studentdetails;
       public          postgres    false    4720    215    224                    2606    16578    attendence_cs5c studentdetails    FK CONSTRAINT     �   ALTER TABLE ONLY public.attendence_cs5c
    ADD CONSTRAINT studentdetails FOREIGN KEY (register_no) REFERENCES public.student(register_no) ON DELETE CASCADE NOT VALID;
 H   ALTER TABLE ONLY public.attendence_cs5c DROP CONSTRAINT studentdetails;
       public          postgres    false    4720    218    215                                                                                                  4894.dat                                                                                            0000600 0004000 0002000 00000000005 14700527637 0014270 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        \.


                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           4889.dat                                                                                            0000600 0004000 0002000 00000000005 14700527637 0014274 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        \.


                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           4892.dat                                                                                            0000600 0004000 0002000 00000000005 14700527637 0014266 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        \.


                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           4886.dat                                                                                            0000600 0004000 0002000 00000000203 14700527637 0014271 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        4	2024-11-23	\n\t{"cst207": true,\n\t "cst306": false,\n\t "csl009": true,\n\t "csl009": true, \n\t "cst506": false}	"wed"	\N
\.


                                                                                                                                                                                                                                                                                                                                                                                             4884.dat                                                                                            0000600 0004000 0002000 00000000005 14700527637 0014267 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        \.


                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           4887.dat                                                                                            0000600 0004000 0002000 00000000005 14700527637 0014272 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        \.


                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           4885.dat                                                                                            0000600 0004000 0002000 00000000005 14700527637 0014270 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        \.


                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           4883.dat                                                                                            0000600 0004000 0002000 00000000005 14700527637 0014266 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        \.


                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           restore.sql                                                                                         0000600 0004000 0002000 00000025404 14700527637 0015404 0                                                                                                    ustar 00postgres                        postgres                        0000000 0000000                                                                                                                                                                        --
-- NOTE:
--
-- File paths need to be edited. Search for $$PATH$$ and
-- replace it with the path to the directory containing
-- the extracted data files.
--
--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE "Project";
--
-- Name: Project; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE "Project" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';


ALTER DATABASE "Project" OWNER TO postgres;

\connect "Project"

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_credentials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_credentials (
    username character varying(25) NOT NULL,
    password character varying(25),
    role "char"
);


ALTER TABLE public.admin_credentials OWNER TO postgres;

--
-- Name: assignment_cs5c; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assignment_cs5c (
    assignment_no integer NOT NULL,
    description character varying(1000),
    marks integer,
    due_date date,
    staff_no integer NOT NULL,
    course_no character varying(25)
);


ALTER TABLE public.assignment_cs5c OWNER TO postgres;

--
-- Name: assignment_assignmentNo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.assignment_cs5c ALTER COLUMN assignment_no ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."assignment_assignmentNo_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: assignment_marks_cs5c; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assignment_marks_cs5c (
    assign_m_no integer NOT NULL,
    total_marks integer,
    award_marks integer,
    assignment_no integer,
    register_no character varying(25)
);


ALTER TABLE public.assignment_marks_cs5c OWNER TO postgres;

--
-- Name: assignment_marks_cs5c_assign_m_no_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.assignment_marks_cs5c ALTER COLUMN assign_m_no ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.assignment_marks_cs5c_assign_m_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: attendence_cs5c; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendence_cs5c (
    att_id integer NOT NULL,
    date_of_att date,
    hours json,
    day character varying(25),
    register_no character varying
);


ALTER TABLE public.attendence_cs5c OWNER TO postgres;

--
-- Name: attendence_cs5c_attId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.attendence_cs5c ALTER COLUMN att_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."attendence_cs5c_attId_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    course_name character varying(25) NOT NULL,
    credits integer,
    course_no character varying(25) NOT NULL
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- Name: schedule_cs5c; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schedule_cs5c (
    day character varying(10) NOT NULL,
    hours character varying(25)[]
);


ALTER TABLE public.schedule_cs5c OWNER TO postgres;

--
-- Name: staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff (
    staff_no integer NOT NULL,
    name character varying(20),
    in_charge_of character varying(10),
    course_charges json,
    password character varying(25) NOT NULL
);


ALTER TABLE public.staff OWNER TO postgres;

--
-- Name: staff_staffNo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.staff ALTER COLUMN staff_no ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."staff_staffNo_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: student; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student (
    name character varying(25) NOT NULL,
    class character varying(10) NOT NULL,
    date_of_birth date,
    phone_number bigint,
    register_no character varying(25) NOT NULL,
    password character varying(25) NOT NULL
);


ALTER TABLE public.student OWNER TO postgres;

--
-- Data for Name: admin_credentials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_credentials (username, password, role) FROM stdin;
\.
COPY public.admin_credentials (username, password, role) FROM '$$PATH$$/4894.dat';

--
-- Data for Name: assignment_cs5c; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assignment_cs5c (assignment_no, description, marks, due_date, staff_no, course_no) FROM stdin;
\.
COPY public.assignment_cs5c (assignment_no, description, marks, due_date, staff_no, course_no) FROM '$$PATH$$/4889.dat';

--
-- Data for Name: assignment_marks_cs5c; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assignment_marks_cs5c (assign_m_no, total_marks, award_marks, assignment_no, register_no) FROM stdin;
\.
COPY public.assignment_marks_cs5c (assign_m_no, total_marks, award_marks, assignment_no, register_no) FROM '$$PATH$$/4892.dat';

--
-- Data for Name: attendence_cs5c; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendence_cs5c (att_id, date_of_att, hours, day, register_no) FROM stdin;
\.
COPY public.attendence_cs5c (att_id, date_of_att, hours, day, register_no) FROM '$$PATH$$/4886.dat';

--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses (course_name, credits, course_no) FROM stdin;
\.
COPY public.courses (course_name, credits, course_no) FROM '$$PATH$$/4884.dat';

--
-- Data for Name: schedule_cs5c; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schedule_cs5c (day, hours) FROM stdin;
\.
COPY public.schedule_cs5c (day, hours) FROM '$$PATH$$/4887.dat';

--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff (staff_no, name, in_charge_of, course_charges, password) FROM stdin;
\.
COPY public.staff (staff_no, name, in_charge_of, course_charges, password) FROM '$$PATH$$/4885.dat';

--
-- Data for Name: student; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student (name, class, date_of_birth, phone_number, register_no, password) FROM stdin;
\.
COPY public.student (name, class, date_of_birth, phone_number, register_no, password) FROM '$$PATH$$/4883.dat';

--
-- Name: assignment_assignmentNo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."assignment_assignmentNo_seq"', 1, false);


--
-- Name: assignment_marks_cs5c_assign_m_no_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assignment_marks_cs5c_assign_m_no_seq', 1, false);


--
-- Name: attendence_cs5c_attId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."attendence_cs5c_attId_seq"', 4, true);


--
-- Name: staff_staffNo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."staff_staffNo_seq"', 4, true);


--
-- Name: admin_credentials admin_credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_credentials
    ADD CONSTRAINT admin_credentials_pkey PRIMARY KEY (username);


--
-- Name: assignment_marks_cs5c assignment_marks_cs5c_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_marks_cs5c
    ADD CONSTRAINT assignment_marks_cs5c_pkey PRIMARY KEY (assign_m_no);


--
-- Name: assignment_cs5c assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_cs5c
    ADD CONSTRAINT assignment_pkey PRIMARY KEY (assignment_no);


--
-- Name: attendence_cs5c attendence_cs5c_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendence_cs5c
    ADD CONSTRAINT attendence_cs5c_pkey PRIMARY KEY (att_id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (course_no);


--
-- Name: schedule_cs5c schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_cs5c
    ADD CONSTRAINT schedule_pkey PRIMARY KEY (day);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (staff_no);


--
-- Name: student student_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_pkey PRIMARY KEY (register_no);


--
-- Name: assignment_marks_cs5c assignmnetdetails; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_marks_cs5c
    ADD CONSTRAINT assignmnetdetails FOREIGN KEY (assignment_no) REFERENCES public.assignment_cs5c(assignment_no) ON DELETE CASCADE NOT VALID;


--
-- Name: assignment_cs5c coursedetails; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_cs5c
    ADD CONSTRAINT coursedetails FOREIGN KEY (course_no) REFERENCES public.courses(course_no) ON DELETE CASCADE NOT VALID;


--
-- Name: assignment_cs5c staffdetails; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_cs5c
    ADD CONSTRAINT staffdetails FOREIGN KEY (staff_no) REFERENCES public.staff(staff_no) ON DELETE CASCADE NOT VALID;


--
-- Name: assignment_marks_cs5c studentdetails; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment_marks_cs5c
    ADD CONSTRAINT studentdetails FOREIGN KEY (register_no) REFERENCES public.student(register_no) ON DELETE CASCADE NOT VALID;


--
-- Name: attendence_cs5c studentdetails; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendence_cs5c
    ADD CONSTRAINT studentdetails FOREIGN KEY (register_no) REFERENCES public.student(register_no) ON DELETE CASCADE NOT VALID;


--
-- PostgreSQL database dump complete
--

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            