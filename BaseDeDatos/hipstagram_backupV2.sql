--
-- PostgreSQL database dump
--



-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

-- Started on 2026-04-25 11:38:32

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- TOC entry 231 (class 1259 OID 41076)
-- Name: auditoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditoria (
    id integer NOT NULL,
    usuario_id integer,
    accion character varying(100) NOT NULL,
    tabla_afectada character varying(50),
    detalles text,
    direccion_ip character varying(45),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.auditoria OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 41075)
-- Name: auditoria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auditoria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auditoria_id_seq OWNER TO postgres;

--
-- TOC entry 5106 (class 0 OID 0)
-- Dependencies: 230
-- Name: auditoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auditoria_id_seq OWNED BY public.auditoria.id;


--
-- TOC entry 229 (class 1259 OID 41052)
-- Name: comentarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comentarios (
    id integer NOT NULL,
    publicacion_id integer NOT NULL,
    usuario_id integer NOT NULL,
    contenido text NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.comentarios OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 41051)
-- Name: comentarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comentarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comentarios_id_seq OWNER TO postgres;

--
-- TOC entry 5109 (class 0 OID 0)
-- Dependencies: 228
-- Name: comentarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comentarios_id_seq OWNED BY public.comentarios.id;


--
-- TOC entry 232 (class 1259 OID 57347)
-- Name: configuracion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuracion (
    clave character varying(50) NOT NULL,
    detalles jsonb NOT NULL
);


ALTER TABLE public.configuracion OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 41000)
-- Name: hashtags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hashtags (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL
);


ALTER TABLE public.hashtags OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 40999)
-- Name: hashtags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hashtags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hashtags_id_seq OWNER TO postgres;

--
-- TOC entry 5113 (class 0 OID 0)
-- Dependencies: 223
-- Name: hashtags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hashtags_id_seq OWNED BY public.hashtags.id;


--
-- TOC entry 222 (class 1259 OID 40983)
-- Name: publicacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.publicacion (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    imagen_url character varying(255) CONSTRAINT publicacion_s3_key_not_null NOT NULL,
    descripcion character varying(128),
    estado character varying(20) DEFAULT 'EN_REVISION'::character varying,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    likes_count integer DEFAULT 0,
    dislikes_count integer DEFAULT 0
);


ALTER TABLE public.publicacion OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 41010)
-- Name: publicacion_hashtags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.publicacion_hashtags (
    publicacion_id integer NOT NULL,
    hashtag_id integer NOT NULL
);


ALTER TABLE public.publicacion_hashtags OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 40982)
-- Name: publicacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.publicacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.publicacion_id_seq OWNER TO postgres;

--
-- TOC entry 5117 (class 0 OID 0)
-- Dependencies: 221
-- Name: publicacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.publicacion_id_seq OWNED BY public.publicacion.id;


--
-- TOC entry 220 (class 1259 OID 40965)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre_usuario character varying(50) NOT NULL,
    correo character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    rol character varying(10) DEFAULT 'USER'::character varying,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    activo boolean DEFAULT true,
    CONSTRAINT usuarios_rol_check CHECK (((rol)::text = ANY ((ARRAY['ADMIN'::character varying, 'USER'::character varying])::text[])))
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 40964)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- TOC entry 5120 (class 0 OID 0)
-- Dependencies: 219
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 227 (class 1259 OID 41028)
-- Name: votos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.votos (
    id integer NOT NULL,
    publicacion_id integer NOT NULL,
    usuario_id integer NOT NULL,
    tipo_voto smallint NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.votos OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 41027)
-- Name: votos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.votos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.votos_id_seq OWNER TO postgres;

--
-- TOC entry 5123 (class 0 OID 0)
-- Dependencies: 226
-- Name: votos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.votos_id_seq OWNED BY public.votos.id;


--
-- TOC entry 4903 (class 2604 OID 41079)
-- Name: auditoria id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria ALTER COLUMN id SET DEFAULT nextval('public.auditoria_id_seq'::regclass);


--
-- TOC entry 4901 (class 2604 OID 41055)
-- Name: comentarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentarios ALTER COLUMN id SET DEFAULT nextval('public.comentarios_id_seq'::regclass);


--
-- TOC entry 4898 (class 2604 OID 41003)
-- Name: hashtags id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hashtags ALTER COLUMN id SET DEFAULT nextval('public.hashtags_id_seq'::regclass);


--
-- TOC entry 4893 (class 2604 OID 40986)
-- Name: publicacion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publicacion ALTER COLUMN id SET DEFAULT nextval('public.publicacion_id_seq'::regclass);


--
-- TOC entry 4889 (class 2604 OID 40968)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 4899 (class 2604 OID 41031)
-- Name: votos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votos ALTER COLUMN id SET DEFAULT nextval('public.votos_id_seq'::regclass);


--
-- TOC entry 5097 (class 0 OID 41076)
-- Dependencies: 231
-- Data for Name: auditoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (1, 4, 'REGISTRO', 'usuarios', '{"correo":"martin@gmail.com"}', '::1', '2026-04-18 12:10:14.708332');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (2, 4, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-18 12:12:45.14785');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (3, 4, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-18 12:52:15.584112');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (4, 4, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-18 16:14:19.081779');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (6, 5, 'REGISTRO', 'usuarios', '{"correo":"sebas@gmail.com"}', '::1', '2026-04-18 23:35:03.418859');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (7, 5, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-18 23:35:34.74396');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (8, 5, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-19 00:12:30.159058');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (9, 5, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-19 00:12:40.102955');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (10, 5, 'POST_CREADO', 'publicacion', '{"post_id":1}', '::1', '2026-04-19 00:14:05.604406');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (11, 5, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-19 00:24:11.019113');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (12, 5, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-19 00:24:24.135057');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (13, 5, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-19 00:24:31.743713');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (14, 5, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-19 00:24:45.050742');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (15, 5, 'COMENTARIO_CREADO', 'comentarios', '{"post_id":1}', '::1', '2026-04-19 01:08:19.019935');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (16, 5, 'POST_CREADO', 'publicacion', '{"post_id":2}', '::1', '2026-04-19 01:14:43.561412');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (17, 5, 'POST_CREADO', 'publicacion', '{"post_id":3}', '::1', '2026-04-19 01:34:25.657732');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (18, 5, 'POST_CREADO', 'publicacion', '{"post_id":4}', '::1', '2026-04-19 01:38:45.605848');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (19, 5, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-19 01:39:37.466071');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (20, 5, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-19 01:39:45.974942');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (21, 5, 'COMENTARIO_CREADO', 'comentarios', '{"post_id":3}', '::1', '2026-04-19 01:40:44.49043');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (22, 5, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-19 01:57:54.724824');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (23, 5, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-19 01:58:06.863842');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (24, 5, 'POST_CREADO', 'publicacion', '{"post_id":5}', '::1', '2026-04-19 08:22:59.890887');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (25, 5, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-19 08:30:13.561486');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (30, 6, 'REGISTRO', 'usuarios', '{"correo":"admin@gmail.com"}', '::1', '2026-04-19 08:39:54.626062');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (31, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-19 08:40:38.123056');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (32, 6, 'VOTO', 'votos', '{"post_id":1,"tipo":1}', '::1', '2026-04-19 08:40:49.028077');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (33, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-19 08:43:03.366385');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (34, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-19 08:43:10.285473');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (35, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-19 16:11:46.407176');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (36, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-19 16:11:54.81562');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (37, 6, 'POST_CREADO', 'publicacion', '{"post_id":6}', '::1', '2026-04-19 16:14:31.652711');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (38, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-19 16:35:28.15303');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (39, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-19 16:35:41.1114');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (40, 6, 'POST_CREADO', 'publicacion', '{"post_id":7}', '::1', '2026-04-19 16:36:58.095869');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (41, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-19 16:40:06.093045');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (42, 5, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-19 16:41:06.058776');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (43, 5, 'POST_CREADO', 'publicacion', '{"post_id":8}', '::1', '2026-04-19 16:41:35.880041');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (44, 5, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-19 16:41:53.964901');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (45, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-19 16:42:02.202969');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (46, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-19 16:54:36.561379');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (47, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-19 16:54:45.741305');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (48, 6, 'APROBAR_POST', 'publicacion', '{"post_id":7,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-19 16:59:42.789307');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (49, 6, 'APROBAR_POST', 'publicacion', '{"post_id":6,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-19 16:59:48.556276');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (50, 6, 'ACTUALIZAR_PALABRAS_PROHIBIDAS', 'configuracion', '{"accion":"actualización de filtro","cantidad":5}', '::1', '2026-04-19 17:15:54.679062');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (51, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-19 17:27:09.43561');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (52, 5, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-19 17:27:18.54935');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (53, 5, 'POST_AUTO_BLOQUEADO', 'publicacion', '{"post_id":9,"motivo":"Filtro automático"}', '::1', '2026-04-19 17:29:34.629808');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (54, 5, 'POST_AUTO_BLOQUEADO', 'publicacion', '{"post_id":10,"motivo":"Filtro automático"}', '::1', '2026-04-19 17:29:36.580925');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (55, 5, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-19 17:35:24.738899');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (56, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-19 17:35:33.844228');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (57, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-19 17:47:44.501406');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (58, 5, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-19 17:47:54.088606');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (59, 5, 'POST_AUTO_BLOQUEADO', 'publicacion', '{"post_id":11,"motivo":"Filtro automático"}', '::1', '2026-04-19 17:51:12.022177');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (60, 5, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-19 17:52:46.188528');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (61, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-19 17:53:03.700864');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (62, 6, 'BLOQUEAR_POST', 'publicacion', '{"post_id":7,"anterior_estado":"PUBLICADO"}', '::1', '2026-04-19 18:00:58.458089');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (63, 6, 'APROBAR_POST', 'publicacion', '{"post_id":7,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-19 18:01:36.482204');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (64, 6, 'BLOQUEAR_POST', 'publicacion', '{"post_id":7,"anterior_estado":"PUBLICADO"}', '::1', '2026-04-19 18:03:06.376934');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (65, 6, 'BLOQUEAR_POST', 'publicacion', '{"post_id":6,"anterior_estado":"PUBLICADO"}', '::1', '2026-04-19 18:03:06.981428');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (66, 6, 'BLOQUEAR_POST', 'publicacion', '{"post_id":5,"anterior_estado":"PUBLICADO"}', '::1', '2026-04-19 18:03:07.64135');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (67, 6, 'BLOQUEAR_POST', 'publicacion', '{"post_id":4,"anterior_estado":"PUBLICADO"}', '::1', '2026-04-19 18:03:09.207392');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (68, 6, 'BLOQUEAR_POST', 'publicacion', '{"post_id":3,"anterior_estado":"PUBLICADO"}', '::1', '2026-04-19 18:03:09.94655');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (69, 6, 'BLOQUEAR_POST', 'publicacion', '{"post_id":2,"anterior_estado":"PUBLICADO"}', '::1', '2026-04-19 18:03:10.772502');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (70, 6, 'BLOQUEAR_POST', 'publicacion', '{"post_id":1,"anterior_estado":"PUBLICADO"}', '::1', '2026-04-19 18:03:11.281092');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (71, 6, 'APROBAR_POST', 'publicacion', '{"post_id":11,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-19 18:03:24.560934');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (72, 6, 'APROBAR_POST', 'publicacion', '{"post_id":7,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-19 18:03:29.776384');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (73, 6, 'APROBAR_POST', 'publicacion', '{"post_id":6,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-19 18:03:32.747941');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (74, 6, 'APROBAR_POST', 'publicacion', '{"post_id":5,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-19 18:03:33.636513');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (75, 6, 'APROBAR_POST', 'publicacion', '{"post_id":4,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-19 18:03:34.65404');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (76, 6, 'APROBAR_POST', 'publicacion', '{"post_id":3,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-19 18:03:37.881801');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (77, 6, 'APROBAR_POST', 'publicacion', '{"post_id":9,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-19 18:03:41.286654');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (78, 6, 'APROBAR_POST', 'publicacion', '{"post_id":2,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-19 18:03:44.003228');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (79, 6, 'APROBAR_POST', 'publicacion', '{"post_id":1,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-19 18:03:45.933415');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (80, 6, 'POST_AUTO_BLOQUEADO', 'publicacion', '{"post_id":12,"motivo":"Filtro automático"}', '::1', '2026-04-19 20:40:27.550162');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (81, 6, 'VOTO', 'votos', '{"post_id":4,"tipo":1}', '::1', '2026-04-19 20:41:58.453214');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (82, 6, 'VOTO', 'votos', '{"post_id":1,"tipo":0}', '::1', '2026-04-19 20:42:07.440175');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (83, 6, 'COMENTARIO_CREADO', 'comentarios', '{"post_id":1}', '::1', '2026-04-19 20:42:27.564364');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (84, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-19 20:43:17.22829');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (85, 4, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-19 20:47:37.040687');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (86, 4, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-19 20:48:02.343207');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (87, 4, 'VOTO', 'votos', '{"post_id":11,"tipo":1}', '::1', '2026-04-19 20:48:19.949677');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (88, 4, 'VOTO', 'votos', '{"post_id":4,"tipo":1}', '::1', '2026-04-19 20:48:26.548698');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (89, 5, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-19 20:49:31.995617');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (90, 5, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-19 21:28:39.423333');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (91, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-19 21:29:33.100991');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (92, 6, 'POST_ELIMINADO', 'publicacion', '{"post_id":12}', '::1', '2026-04-19 21:56:09.823379');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (93, 5, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-19 21:59:45.090211');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (94, 5, 'POST_ELIMINADO', 'publicacion', '{"post_id":10}', '::1', '2026-04-19 21:59:56.229013');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (95, 5, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-19 22:16:53.648865');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (96, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-19 22:22:11.38602');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (97, 6, 'ACTUALIZAR_PALABRAS_PROHIBIDAS', 'configuracion', '{"accion":"actualización de filtro","cantidad":5}', '::1', '2026-04-19 22:42:39.157098');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (98, 6, 'BLOQUEAR_POST', 'publicacion', '{"post_id":11,"anterior_estado":"PUBLICADO"}', '::1', '2026-04-19 22:56:59.647332');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (99, 6, 'RECHAZAR_POST', 'publicacion', '{"post_id":11,"nuevo_estado":"BLOQUEADO"}', '::1', '2026-04-19 22:57:06.68309');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (100, 6, 'APROBAR_POST', 'publicacion', '{"post_id":11,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-19 22:57:09.879937');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (101, 6, 'BLOQUEAR_POST', 'publicacion', '{"post_id":3,"anterior_estado":"PUBLICADO"}', '::1', '2026-04-19 22:57:18.176907');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (102, 6, 'APROBAR_POST', 'publicacion', '{"post_id":3,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-19 22:57:31.386118');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (103, 6, 'DESACTIVAR_USUARIO', 'usuarios', '{"target_id":2,"username":"juan_el_pro"}', '::1', '2026-04-19 23:05:44.386324');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (104, 6, 'DESACTIVAR_USUARIO', 'usuarios', '{"target_id":2,"username":"juan_el_pro"}', '::1', '2026-04-19 23:05:49.144135');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (105, 6, 'DESACTIVAR_USUARIO', 'usuarios', '{"target_id":2,"username":"juan_el_pro"}', '::1', '2026-04-19 23:05:54.418276');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (106, 6, 'APROBAR_POST', 'publicacion', '{"post_id":8,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-19 23:06:09.331533');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (107, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-19 23:06:33.14556');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (108, 5, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-20 08:28:45.156038');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (109, 5, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-20 08:29:26.007983');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (110, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-20 08:29:30.167183');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (111, 6, 'POST_AUTO_BLOQUEADO', 'publicacion', '{"post_id":13,"motivo":"Filtro automático"}', '::1', '2026-04-20 08:30:22.578078');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (112, 6, 'POST_CREADO', 'publicacion', '{"post_id":14,"motivo":"Normal"}', '::1', '2026-04-20 08:31:01.386904');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (113, 6, 'APROBAR_POST', 'publicacion', '{"post_id":14,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-20 08:31:19.26551');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (114, 6, 'ACTUALIZAR_PALABRAS_PROHIBIDAS', 'configuracion', '{"accion":"actualización de filtro","cantidad":5}', '::1', '2026-04-20 08:33:56.461486');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (115, 6, 'ACTUALIZAR_PALABRAS_PROHIBIDAS', 'configuracion', '{"accion":"actualización de filtro","cantidad":6}', '::1', '2026-04-20 08:34:22.538413');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (116, 6, 'POST_ELIMINADO', 'publicacion', '{"post_id":13}', '::1', '2026-04-20 08:35:51.749245');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (117, 6, 'DESACTIVAR_USUARIO', 'usuarios', '{"target_id":6,"username":"ADMINISTRADOR"}', '::1', '2026-04-20 08:36:16.164341');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (118, 6, 'DESACTIVAR_USUARIO', 'usuarios', '{"target_id":6,"username":"ADMINISTRADOR"}', '::1', '2026-04-20 08:36:18.298805');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (119, 6, 'DESACTIVAR_USUARIO', 'usuarios', '{"target_id":6,"username":"ADMINISTRADOR"}', '::1', '2026-04-20 08:36:19.316174');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (120, 6, 'DESACTIVAR_USUARIO', 'usuarios', '{"target_id":6,"username":"ADMINISTRADOR"}', '::1', '2026-04-20 08:36:24.009011');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (121, 5, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-20 08:47:11.964823');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (122, 5, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-20 08:53:42.46043');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (123, 5, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-20 09:07:50.691173');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (124, 5, 'POST_AUTO_BLOQUEADO', 'publicacion', '{"post_id":15,"motivo":"Filtro automático"}', '::1', '2026-04-20 09:09:26.70017');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (125, 5, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-20 09:10:44.92693');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (126, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-20 09:18:23.729549');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (127, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-20 09:21:49.89147');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (128, 5, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-20 09:24:13.789613');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (129, 5, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-20 09:31:05.787135');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (130, 4, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-20 09:33:17.419906');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (131, 4, 'VOTO', 'votos', '{"post_id":5,"tipo":1}', '::1', '2026-04-20 09:33:39.650671');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (132, 4, 'COMENTARIO_CREADO', 'comentarios', '{"post_id":4}', '::1', '2026-04-20 09:34:07.487527');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (133, 4, 'POST_CREADO', 'publicacion', '{"post_id":16,"motivo":"Normal"}', '::1', '2026-04-20 09:39:50.457773');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (134, 4, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-20 09:39:56.917046');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (135, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-20 09:40:05.238844');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (136, 6, 'APROBAR_POST', 'publicacion', '{"post_id":16,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-20 09:40:16.407231');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (137, 6, 'VOTO', 'votos', '{"post_id":16,"tipo":1}', '::1', '2026-04-20 09:40:40.746679');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (138, 6, 'COMENTARIO_CREADO', 'comentarios', '{"post_id":16}', '::1', '2026-04-20 09:41:00.043227');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (139, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-20 09:41:12.381982');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (140, 4, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-20 09:41:21.674561');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (141, 4, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-20 09:44:36.792195');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (26, NULL, 'LOGIN_FALLIDO', 'usuarios', NULL, '::1', '2026-04-19 08:30:45.451211');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (27, NULL, 'LOGIN_FALLIDO', 'usuarios', NULL, '::1', '2026-04-19 08:31:16.210147');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (28, NULL, 'LOGIN_FALLIDO', 'usuarios', NULL, '::1', '2026-04-19 08:31:30.519886');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (5, NULL, 'LOGIN_FALLIDO', 'usuarios', NULL, '::1', '2026-04-18 23:31:47.488399');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (29, NULL, 'LOGIN_FALLIDO', 'usuarios', NULL, '::1', '2026-04-19 08:32:04.396648');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (142, 5, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-20 15:35:53.481985');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (143, 5, 'COMENTARIO_ELIMINADO', 'comentarios', '{"comment_id":2,"post_id":3}', '::1', '2026-04-20 15:55:03.021975');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (144, 5, 'COMENTARIO_CREADO', 'comentarios', '{"post_id":4}', '::1', '2026-04-20 15:55:35.846157');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (145, 5, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-20 16:26:14.89683');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (146, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-20 16:26:26.308109');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (147, 6, 'DESACTIVAR_USUARIO', 'usuarios', '{"target_id":4,"username":"martrin"}', '::1', '2026-04-20 16:27:08.2549');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (148, 6, 'DESACTIVAR_USUARIO', 'usuarios', '{"target_id":4,"username":"martrin"}', '::1', '2026-04-20 16:27:25.812739');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (149, 6, 'DESACTIVAR_USUARIO', 'usuarios', '{"target_id":4,"username":"martrin"}', '::1', '2026-04-20 16:27:27.568184');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (150, 6, 'DESACTIVAR_USUARIO', 'usuarios', '{"target_id":4,"username":"martrin"}', '::1', '2026-04-20 16:32:00.461419');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (151, 6, 'DESACTIVAR_USUARIO', 'usuarios', '{"target_id":4,"username":"martrin"}', '::1', '2026-04-20 16:32:04.572717');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (152, 6, 'ACTIVAR_USUARIO', 'usuarios', '{"target_id":6,"username":"ADMINISTRADOR"}', '::1', '2026-04-20 16:49:38.659011');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (153, 6, 'ACTIVAR_USUARIO', 'usuarios', '{"target_id":4,"username":"martrin"}', '::1', '2026-04-20 16:49:44.456327');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (154, 6, 'ACTIVAR_USUARIO', 'usuarios', '{"target_id":4,"username":"martrin"}', '::1', '2026-04-20 16:49:47.197581');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (155, 6, 'ACTIVAR_USUARIO', 'usuarios', '{"target_id":4,"username":"martrin"}', '::1', '2026-04-20 16:49:48.59205');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (156, 6, 'ACTIVAR_USUARIO', 'usuarios', '{"target_id":4,"username":"martrin"}', '::1', '2026-04-20 16:49:49.645126');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (157, 6, 'ACTIVAR_USUARIO', 'usuarios', '{"target_id":4,"username":"martrin"}', '::1', '2026-04-20 16:55:40.585668');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (158, 6, 'DESACTIVAR_USUARIO', 'usuarios', '{"target_id":4,"username":"martrin"}', '::1', '2026-04-20 17:06:42.898404');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (159, 6, 'ACTIVAR_USUARIO', 'usuarios', '{"target_id":4,"username":"martrin"}', '::1', '2026-04-20 17:06:44.287001');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (160, 6, 'DESACTIVAR_USUARIO', 'usuarios', '{"target_id":4,"username":"martrin"}', '::1', '2026-04-20 17:15:47.364127');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (161, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-20 17:15:58.240077');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (162, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-20 18:01:38.572701');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (163, 6, 'ACTIVAR_USUARIO', 'usuarios', '{"target_id":4,"username":"martrin"}', '::1', '2026-04-20 18:02:20.091936');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (164, 6, 'DESACTIVAR_USUARIO', 'usuarios', '{"target_id":5,"username":"Sebastian"}', '::1', '2026-04-20 18:02:28.085326');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (165, 6, 'COMENTARIO_CREADO', 'comentarios', '{"post_id":11}', '::1', '2026-04-20 18:03:02.472742');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (166, 6, 'COMENTARIO_ELIMINADO', 'comentarios', '{"comment_id":7,"post_id":11}', '::1', '2026-04-20 18:03:08.022092');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (167, 6, 'COMENTARIO_CREADO', 'comentarios', '{"post_id":11}', '::1', '2026-04-20 18:03:16.430675');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (168, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-20 18:04:23.544213');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (169, 4, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-20 18:04:29.569449');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (170, 4, 'COMENTARIO_ELIMINADO', 'comentarios', '{"comment_id":4,"post_id":4}', '::1', '2026-04-20 18:05:55.504032');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (171, 4, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-20 18:06:00.245501');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (172, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-20 18:06:05.901934');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (173, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-20 23:41:38.905039');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (174, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-20 23:50:31.561901');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (175, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-20 23:50:40.218802');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (176, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-21 00:04:28.047907');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (177, 7, 'REGISTRO', 'usuarios', '{"correo":"amelia@gmail.com"}', '::1', '2026-04-21 00:05:46.783092');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (178, 7, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-21 00:06:02.088327');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (179, 7, 'VOTO', 'votos', '{"post_id":4,"tipo":1}', '::1', '2026-04-21 00:06:06.61227');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (180, 7, 'VOTO', 'votos', '{"post_id":16,"tipo":1}', '::1', '2026-04-21 00:06:17.450328');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (181, 7, 'VOTO', 'votos', '{"post_id":14,"tipo":1}', '::1', '2026-04-21 00:25:57.235247');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (182, 7, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-21 00:27:25.654147');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (183, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-21 00:27:51.965298');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (184, 6, 'VOTO', 'votos', '{"post_id":3,"tipo":1}', '::1', '2026-04-21 00:29:02.723862');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (185, 6, 'APROBAR_POST', 'publicacion', '{"post_id":15,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-21 00:29:52.121413');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (186, 6, 'BLOQUEAR_POST', 'publicacion', '{"post_id":15,"anterior_estado":"PUBLICADO"}', '::1', '2026-04-21 00:30:20.857103');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (187, 6, 'ACTIVAR_USUARIO', 'usuarios', '{"target_id":5,"username":"Sebastian"}', '::1', '2026-04-21 00:30:30.500961');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (188, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-21 00:31:24.454509');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (218, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-21 08:24:06.883061');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (219, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-21 08:29:39.551984');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (220, 5, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-21 08:31:39.358789');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (221, 5, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-21 08:31:47.642474');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (222, 5, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-21 09:01:15.167012');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (223, 5, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-21 09:46:33.413707');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (224, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-21 09:46:51.425764');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (225, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-21 09:46:56.480505');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (226, 4, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-21 09:48:05.915981');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (227, 4, 'VOTO', 'votos', '{"post_id":1,"tipo":0}', '::1', '2026-04-21 09:56:37.603694');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (228, 4, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-21 11:22:37.127227');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (229, 7, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-21 11:22:50.934339');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (230, 7, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-21 11:23:06.312576');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (231, 7, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-21 11:40:14.633139');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (232, 7, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-21 11:41:16.984379');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (233, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-21 11:44:13.518977');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (234, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-21 11:44:52.614202');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (235, 4, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-21 16:49:59.263104');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (236, 4, 'POST_CREADO', 'publicacion', '{"post_id":17,"motivo":"Normal"}', '::1', '2026-04-21 16:52:02.570553');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (237, 4, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-21 16:52:57.699092');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (238, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-21 16:53:10.450485');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (239, 6, 'DESACTIVAR_USUARIO', 'usuarios', '{"target_id":5,"username":"Sebastian"}', '::1', '2026-04-21 16:54:31.905106');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (240, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-21 17:11:37.484134');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (241, 7, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-21 17:16:32.838392');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (242, 7, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-21 17:17:05.483647');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (243, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-21 21:35:08.976562');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (244, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-21 21:35:45.583345');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (245, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-21 21:36:23.90015');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (246, 4, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-21 21:38:20.524025');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (247, 4, 'POST_CREADO', 'publicacion', '{"post_id":18,"motivo":"Normal"}', '::1', '2026-04-21 21:39:13.987589');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (248, 4, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-21 21:39:59.869662');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (249, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-21 21:40:03.015388');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (250, 6, 'APROBAR_POST', 'publicacion', '{"post_id":18,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-21 21:40:10.776392');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (251, 6, 'APROBAR_POST', 'publicacion', '{"post_id":17,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-21 21:40:12.0306');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (252, 6, 'ACTIVAR_USUARIO', 'usuarios', '{"target_id":5,"username":"Sebastian"}', '::1', '2026-04-21 21:40:22.775411');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (253, 6, 'POST_ELIMINADO', 'publicacion', '{"post_id":14}', '::1', '2026-04-21 21:40:59.597678');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (254, 6, 'POST_CREADO', 'publicacion', '{"post_id":19,"motivo":"Normal"}', '::1', '2026-04-21 23:11:47.945842');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (255, 6, 'APROBAR_POST', 'publicacion', '{"post_id":19,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-21 23:11:54.87165');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (256, 6, 'VOTO', 'votos', '{"post_id":17,"tipo":1}', '::1', '2026-04-21 23:12:21.355586');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (257, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-21 23:12:24.137156');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (258, 8, 'REGISTRO', 'usuarios', '{"correo":"catu@gmail.com"}', '::1', '2026-04-21 23:14:52.447019');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (259, 8, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-21 23:15:01.420076');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (260, 8, 'VOTO', 'votos', '{"post_id":17,"tipo":1}', '::1', '2026-04-21 23:15:16.129271');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (261, 8, 'COMENTARIO_CREADO', 'comentarios', '{"post_id":17}', '::1', '2026-04-21 23:16:27.310843');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (262, 8, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-21 23:16:44.408311');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (263, 5, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-21 23:16:48.600828');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (264, 5, 'VOTO', 'votos', '{"post_id":17,"tipo":1}', '::1', '2026-04-21 23:16:56.689185');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (265, 5, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-21 23:16:59.395629');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (266, 4, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-21 23:17:05.669776');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (267, 4, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-21 23:17:15.060877');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (268, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-21 23:17:34.44725');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (269, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-21 23:17:44.229973');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (270, 7, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-21 23:22:29.837618');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (271, 7, 'VOTO', 'votos', '{"post_id":17,"tipo":1}', '::1', '2026-04-21 23:22:32.911251');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (272, 8, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-21 23:24:28.850054');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (273, 8, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-21 23:25:33.911639');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (274, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-21 23:25:44.499654');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (275, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-21 23:27:08.906555');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (276, 8, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-21 23:27:19.954366');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (277, 8, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-21 23:27:35.078627');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (278, 7, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-22 00:14:41.94665');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (279, 7, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-22 10:14:15.025622');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (280, 5, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-22 10:14:26.413164');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (281, 5, 'COMENTARIO_CREADO', 'comentarios', '{"post_id":17}', '::1', '2026-04-22 10:14:42.634391');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (282, 5, 'VOTO', 'votos', '{"post_id":17,"tipo":0}', '::1', '2026-04-22 10:18:03.26671');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (283, 5, 'VOTO', 'votos', '{"post_id":17,"tipo":1}', '::1', '2026-04-22 10:18:04.072035');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (284, 5, 'VOTO', 'votos', '{"post_id":17,"tipo":0}', '::1', '2026-04-22 10:18:05.5752');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (285, 5, 'VOTO', 'votos', '{"post_id":17,"tipo":1}', '::1', '2026-04-22 10:18:06.175037');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (286, 5, 'VOTO', 'votos', '{"post_id":17,"tipo":0}', '::1', '2026-04-22 10:18:07.33514');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (287, 5, 'VOTO', 'votos', '{"post_id":17,"tipo":1}', '::1', '2026-04-22 10:18:10.219861');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (288, 5, 'COMENTARIO_ELIMINADO', 'comentarios', '{"comment_id":10,"post_id":17}', '::1', '2026-04-22 10:18:15.80448');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (289, 5, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-22 10:18:20.736862');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (290, 5, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-22 10:43:50.764456');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (291, 5, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-22 11:00:28.242056');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (292, 5, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-22 11:00:35.159402');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (293, 5, 'POST_CREADO', 'publicacion', '{"post_id":20,"motivo":"Normal"}', '::1', '2026-04-22 11:01:02.283215');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (294, 5, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-22 11:01:57.619554');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (295, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-22 11:02:05.069659');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (296, 6, 'APROBAR_POST', 'publicacion', '{"post_id":20,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-22 11:02:08.766644');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (297, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-22 11:21:50.754892');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (298, 7, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-22 11:21:59.50482');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (299, 7, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-22 11:22:04.873677');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (300, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-22 11:22:25.01129');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (301, 6, 'COMENTARIO_CREADO', 'comentarios', '{"post_id":20}', '::1', '2026-04-22 11:23:08.354641');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (302, 6, 'VOTO', 'votos', '{"post_id":20,"tipo":1}', '::1', '2026-04-22 11:23:12.091743');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (303, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-22 11:23:24.494859');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (304, 5, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-22 11:23:37.354334');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (305, 5, 'POST_ELIMINADO', 'publicacion', '{"post_id":8}', '::1', '2026-04-22 11:27:53.40394');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (306, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-22 12:20:07.53952');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (307, 6, 'POST_CREADO', 'publicacion', '{"post_id":21,"motivo":"Normal"}', '::1', '2026-04-22 12:36:56.3683');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (308, 6, 'APROBAR_POST', 'publicacion', '{"post_id":21,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-22 12:37:02.973585');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (309, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-22 12:37:18.537547');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (310, 5, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-22 12:37:31.408387');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (311, 5, 'VOTO', 'votos', '{"post_id":21,"tipo":1}', '::1', '2026-04-22 12:37:38.274016');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (312, 5, 'COMENTARIO_CREADO', 'comentarios', '{"post_id":21}', '::1', '2026-04-22 12:37:52.398219');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (313, 5, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-22 12:41:45.685028');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (314, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-22 12:41:54.726846');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (315, 4, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-22 18:49:21.479296');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (316, 4, 'VOTO', 'votos', '{"post_id":21,"tipo":0}', '::1', '2026-04-22 19:14:05.860482');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (317, 4, 'COMENTARIO_CREADO', 'comentarios', '{"post_id":21}', '::1', '2026-04-22 19:14:36.192798');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (318, 4, 'VOTO', 'votos', '{"post_id":7,"tipo":0}', '::1', '2026-04-22 19:14:52.617581');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (319, 4, 'COMENTARIO_CREADO', 'comentarios', '{"post_id":18}', '::1', '2026-04-22 19:16:02.437972');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (320, 4, 'POST_CREADO', 'publicacion', '{"post_id":22,"motivo":"Normal"}', '::1', '2026-04-22 19:19:57.895417');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (321, 4, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-22 19:20:02.488894');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (322, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-22 19:20:10.032907');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (323, 6, 'APROBAR_POST', 'publicacion', '{"post_id":22,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-22 19:20:12.694455');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (324, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-22 19:21:09.869679');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (325, 7, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-22 19:21:16.572189');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (326, 7, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-22 19:31:10.92317');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (327, 8, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-22 19:32:45.317972');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (328, 8, 'POST_CREADO', 'publicacion', '{"post_id":23,"motivo":"Normal"}', '::1', '2026-04-22 20:05:04.957982');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (329, 8, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-22 20:05:08.728831');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (330, 5, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-22 20:05:16.662933');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (331, 5, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-22 20:06:31.274034');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (332, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-22 20:06:40.842383');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (333, 6, 'APROBAR_POST', 'publicacion', '{"post_id":23,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-22 20:06:43.625258');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (334, 6, 'VOTO', 'votos', '{"post_id":23,"tipo":1}', '::1', '2026-04-22 20:06:53.519442');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (335, 6, 'COMENTARIO_CREADO', 'comentarios', '{"post_id":23}', '::1', '2026-04-22 20:07:41.953494');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (336, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-22 20:07:48.891222');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (337, 4, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-22 20:07:55.594111');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (338, 4, 'VOTO', 'votos', '{"post_id":23,"tipo":1}', '::1', '2026-04-22 20:08:31.824831');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (339, 4, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-22 20:08:53.453529');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (340, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-22 20:08:57.931764');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (341, 6, 'BLOQUEAR_POST', 'publicacion', '{"post_id":9,"anterior_estado":"PUBLICADO"}', '::1', '2026-04-22 20:09:49.568966');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (342, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-23 08:26:42.142559');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (343, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-23 23:34:49.982474');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (344, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-24 00:16:52.649106');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (345, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-24 00:17:23.630945');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (346, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-24 00:19:18.82659');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (347, 8, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-24 00:21:07.497141');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (348, 8, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-24 00:43:19.84902');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (349, 7, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-24 01:13:12.540866');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (350, 7, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-24 01:13:17.300422');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (351, 8, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-24 01:17:42.914152');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (352, 8, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-24 01:17:47.119885');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (353, 7, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-24 01:17:53.633266');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (354, 7, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-24 01:17:59.889145');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (355, 8, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-24 01:18:11.866046');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (356, 8, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-24 01:19:55.917366');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (357, 9, 'REGISTRO', 'usuarios', '{"correo":"otzoyesau@gmail.com"}', '::1', '2026-04-24 01:24:36.578779');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (358, 9, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-24 01:25:14.339109');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (359, 9, 'POST_CREADO', 'publicacion', '{"post_id":24,"motivo":"Normal"}', '::1', '2026-04-24 01:28:14.236766');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (360, 9, 'POST_AUTO_BLOQUEADO', 'publicacion', '{"post_id":25,"motivo":"Filtro automático"}', '::1', '2026-04-24 01:29:36.118015');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (361, 9, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-24 01:30:57.551359');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (362, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-24 01:31:37.874665');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (363, 6, 'APROBAR_POST', 'publicacion', '{"post_id":24,"nuevo_estado":"PUBLICADO"}', '::1', '2026-04-24 01:33:24.117007');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (364, 6, 'VOTO', 'votos', '{"post_id":24,"tipo":1}', '::1', '2026-04-24 01:34:11.521698');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (365, 6, 'COMENTARIO_CREADO', 'comentarios', '{"post_id":24}', '::1', '2026-04-24 01:36:41.631587');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (366, 6, 'DESACTIVAR_USUARIO', 'usuarios', '{"target_id":5,"username":"Sebastian"}', '::1', '2026-04-24 01:43:44.910632');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (367, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-24 01:43:55.491628');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (368, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-24 01:45:58.857707');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (369, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-24 02:08:31.471445');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (370, 4, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-24 02:17:44.922685');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (371, 4, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-24 02:18:25.383469');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (372, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-24 09:20:01.485106');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (373, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-24 17:08:17.713781');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (374, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-24 17:08:19.708371');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (375, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-24 17:08:23.824361');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (376, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-24 17:08:46.0697');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (377, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-24 17:14:08.523918');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (378, 6, 'LOGIN_EXITOSO', 'usuarios', NULL, '::1', '2026-04-24 17:18:44.649868');
INSERT INTO public.auditoria (id, usuario_id, accion, tabla_afectada, detalles, direccion_ip, fecha_creacion) VALUES (379, 6, 'LOGOUT', 'usuarios', NULL, '::1', '2026-04-24 17:19:36.271225');


--
-- TOC entry 5095 (class 0 OID 41052)
-- Dependencies: 229
-- Data for Name: comentarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.comentarios (id, publicacion_id, usuario_id, contenido, fecha_creacion) VALUES (1, 1, 5, 'Genial!!!', '2026-04-19 01:08:19.009561');
INSERT INTO public.comentarios (id, publicacion_id, usuario_id, contenido, fecha_creacion) VALUES (3, 1, 6, 'La red.', '2026-04-19 20:42:27.559098');
INSERT INTO public.comentarios (id, publicacion_id, usuario_id, contenido, fecha_creacion) VALUES (5, 16, 6, 'Woow.', '2026-04-20 09:41:00.040798');
INSERT INTO public.comentarios (id, publicacion_id, usuario_id, contenido, fecha_creacion) VALUES (6, 4, 5, 'free fire yeah!', '2026-04-20 15:55:35.836758');
INSERT INTO public.comentarios (id, publicacion_id, usuario_id, contenido, fecha_creacion) VALUES (8, 11, 6, 'hola', '2026-04-20 18:03:16.427885');
INSERT INTO public.comentarios (id, publicacion_id, usuario_id, contenido, fecha_creacion) VALUES (9, 17, 8, 'El lado oscuro de la Fuerza es un camino hacia muchas habilidades que algunos consideran antinaturales', '2026-04-21 23:16:27.305438');
INSERT INTO public.comentarios (id, publicacion_id, usuario_id, contenido, fecha_creacion) VALUES (12, 21, 5, 'hola', '2026-04-22 12:37:52.391996');
INSERT INTO public.comentarios (id, publicacion_id, usuario_id, contenido, fecha_creacion) VALUES (13, 21, 4, 'Y del porque la mascara? jajaja', '2026-04-22 19:14:36.182137');
INSERT INTO public.comentarios (id, publicacion_id, usuario_id, contenido, fecha_creacion) VALUES (14, 18, 4, 'la belleza de las estrellas no tiene comparación.', '2026-04-22 19:16:02.430343');
INSERT INTO public.comentarios (id, publicacion_id, usuario_id, contenido, fecha_creacion) VALUES (15, 23, 6, '👌👌👌👌', '2026-04-22 20:07:41.94637');
INSERT INTO public.comentarios (id, publicacion_id, usuario_id, contenido, fecha_creacion) VALUES (16, 24, 6, 'Es un dato interesante!!!', '2026-04-24 01:36:41.621176');


--
-- TOC entry 5098 (class 0 OID 57347)
-- Dependencies: 232
-- Data for Name: configuracion; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.configuracion (clave, detalles) VALUES ('forbidden_words', '{"banned": ["spam", "odio", "fake", "estafa", "nsfw", "maldad"]}');


--
-- TOC entry 5090 (class 0 OID 41000)
-- Dependencies: 224
-- Data for Name: hashtags; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.hashtags (id, nombre) VALUES (1, '#ares');
INSERT INTO public.hashtags (id, nombre) VALUES (2, '#tron3');
INSERT INTO public.hashtags (id, nombre) VALUES (3, '#clone');
INSERT INTO public.hashtags (id, nombre) VALUES (4, '#spider');
INSERT INTO public.hashtags (id, nombre) VALUES (5, '#interstellar');
INSERT INTO public.hashtags (id, nombre) VALUES (6, '#gargantúa');
INSERT INTO public.hashtags (id, nombre) VALUES (7, '#space');
INSERT INTO public.hashtags (id, nombre) VALUES (8, '#marvel');
INSERT INTO public.hashtags (id, nombre) VALUES (9, '#promocion');
INSERT INTO public.hashtags (id, nombre) VALUES (10, '#dinero');
INSERT INTO public.hashtags (id, nombre) VALUES (11, '#empire');
INSERT INTO public.hashtags (id, nombre) VALUES (12, '#star');
INSERT INTO public.hashtags (id, nombre) VALUES (14, '#starwars');
INSERT INTO public.hashtags (id, nombre) VALUES (15, '#estrella');
INSERT INTO public.hashtags (id, nombre) VALUES (16, '#noche');
INSERT INTO public.hashtags (id, nombre) VALUES (17, '#halo');
INSERT INTO public.hashtags (id, nombre) VALUES (18, '#campaingevolved');
INSERT INTO public.hashtags (id, nombre) VALUES (21, '#naturaleza');
INSERT INTO public.hashtags (id, nombre) VALUES (22, '#tranquiladad');
INSERT INTO public.hashtags (id, nombre) VALUES (23, '#paz');
INSERT INTO public.hashtags (id, nombre) VALUES (24, '#montañas');
INSERT INTO public.hashtags (id, nombre) VALUES (27, '#vader');
INSERT INTO public.hashtags (id, nombre) VALUES (29, '#estafa');


--
-- TOC entry 5088 (class 0 OID 40983)
-- Dependencies: 222
-- Data for Name: publicacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.publicacion (id, usuario_id, imagen_url, descripcion, estado, fecha_creacion, likes_count, dislikes_count) VALUES (5, 5, '/uploads/1776608579814-481331252.jpg', 'Gargantúa es el agujero negro supermasivo ficticio en Interstellar', 'PUBLICADO', '2026-04-19 08:22:59.890887', 1, 0);
INSERT INTO public.publicacion (id, usuario_id, imagen_url, descripcion, estado, fecha_creacion, likes_count, dislikes_count) VALUES (23, 8, '/uploads/1776909904876-821612377.jpg', 'Gargantúa es el agujero negro supermasivo central en la película Interstellar (2014).', 'PUBLICADO', '2026-04-22 20:05:04.957982', 2, 0);
INSERT INTO public.publicacion (id, usuario_id, imagen_url, descripcion, estado, fecha_creacion, likes_count, dislikes_count) VALUES (9, 5, '/uploads/1776641374550-445802842.jpg', 'Disfrutando de la vista, no es fake.', 'BLOQUEADO', '2026-04-19 17:29:34.629808', 0, 0);
INSERT INTO public.publicacion (id, usuario_id, imagen_url, descripcion, estado, fecha_creacion, likes_count, dislikes_count) VALUES (4, 5, '/uploads/1776584325536-31157734.jpg', 'SI ALGO HE APRENDIDO DE LOS VIDEOJUEGOS, ES QUE SI ENCUENTRAS OBSTÁCULOS EN EL CAMINO, ES PORQUE VAS EN LA DIRECCIÓN CORRECTA...', 'PUBLICADO', '2026-04-19 01:38:45.605848', 3, 0);
INSERT INTO public.publicacion (id, usuario_id, imagen_url, descripcion, estado, fecha_creacion, likes_count, dislikes_count) VALUES (16, 4, '/uploads/1776699590356-324374479.jpg', 'Long live the empire', 'PUBLICADO', '2026-04-20 09:39:50.457773', 2, 0);
INSERT INTO public.publicacion (id, usuario_id, imagen_url, descripcion, estado, fecha_creacion, likes_count, dislikes_count) VALUES (3, 5, '/uploads/1776584065473-987300694.jpg', 'tu amigo y vecino spiderman.', 'PUBLICADO', '2026-04-19 01:34:25.657732', 1, 0);
INSERT INTO public.publicacion (id, usuario_id, imagen_url, descripcion, estado, fecha_creacion, likes_count, dislikes_count) VALUES (25, 9, '/uploads/1777015776039-591593272.jpg', 'estafa', 'BLOQUEADO', '2026-04-24 01:29:36.118015', 0, 0);
INSERT INTO public.publicacion (id, usuario_id, imagen_url, descripcion, estado, fecha_creacion, likes_count, dislikes_count) VALUES (15, 5, '/uploads/1776697766606-472394439.jpg', 'estafa', 'BLOQUEADO', '2026-04-20 09:09:26.70017', 0, 0);
INSERT INTO public.publicacion (id, usuario_id, imagen_url, descripcion, estado, fecha_creacion, likes_count, dislikes_count) VALUES (1, 5, '/uploads/1776579245508-257287019.webp', 'Tron Ares', 'PUBLICADO', '2026-04-19 00:14:05.604406', 0, 2);
INSERT INTO public.publicacion (id, usuario_id, imagen_url, descripcion, estado, fecha_creacion, likes_count, dislikes_count) VALUES (18, 4, '/uploads/1776829153890-208187657.jpg', 'las estrellas', 'PUBLICADO', '2026-04-21 21:39:13.987589', 0, 0);
INSERT INTO public.publicacion (id, usuario_id, imagen_url, descripcion, estado, fecha_creacion, likes_count, dislikes_count) VALUES (19, 6, '/uploads/1776834707936-789258969.jpg', 'Halo es una franquicia multimedia de ciencia ficción creada y desarrollada por Bungie Studios hasta Halo: Reach.', 'PUBLICADO', '2026-04-21 23:11:47.945842', 0, 0);
INSERT INTO public.publicacion (id, usuario_id, imagen_url, descripcion, estado, fecha_creacion, likes_count, dislikes_count) VALUES (24, 9, '/uploads/1777015694123-877887496.gif', 'Anakin Skywalker, más tarde Darth Vader, es el personaje central de la famosa saga de Star Wars del director George Lucas. ', 'PUBLICADO', '2026-04-24 01:28:14.236766', 1, 0);
INSERT INTO public.publicacion (id, usuario_id, imagen_url, descripcion, estado, fecha_creacion, likes_count, dislikes_count) VALUES (6, 6, '/uploads/1776636871585-80850990.jpg', 'Doctor Doom', 'PUBLICADO', '2026-04-19 16:14:31.652711', 0, 0);
INSERT INTO public.publicacion (id, usuario_id, imagen_url, descripcion, estado, fecha_creacion, likes_count, dislikes_count) VALUES (2, 5, '/uploads/1776582883485-970966564.jpg', 'Viejos recuerdos de una vieja serie.', 'PUBLICADO', '2026-04-19 01:14:43.561412', 0, 0);
INSERT INTO public.publicacion (id, usuario_id, imagen_url, descripcion, estado, fecha_creacion, likes_count, dislikes_count) VALUES (11, 5, '/uploads/1776642671941-228225265.jpg', 'Gana seguidores rápidos con esta nueva app, 100% real, cero estafa.', 'PUBLICADO', '2026-04-19 17:51:12.022177', 1, 0);
INSERT INTO public.publicacion (id, usuario_id, imagen_url, descripcion, estado, fecha_creacion, likes_count, dislikes_count) VALUES (17, 4, '/uploads/1776811922479-313497012.jpg', 'The dark side', 'PUBLICADO', '2026-04-21 16:52:02.570553', 4, 0);
INSERT INTO public.publicacion (id, usuario_id, imagen_url, descripcion, estado, fecha_creacion, likes_count, dislikes_count) VALUES (21, 6, '/uploads/1776883016345-901326808.gif', 'prueba1', 'PUBLICADO', '2026-04-22 12:36:56.3683', 1, 1);
INSERT INTO public.publicacion (id, usuario_id, imagen_url, descripcion, estado, fecha_creacion, likes_count, dislikes_count) VALUES (7, 6, '/uploads/1776638218022-396399450.jpg', 'Doomsday', 'PUBLICADO', '2026-04-19 16:36:58.095869', 0, 1);
INSERT INTO public.publicacion (id, usuario_id, imagen_url, descripcion, estado, fecha_creacion, likes_count, dislikes_count) VALUES (22, 4, '/uploads/1776907197696-515420845.gif', 'La belleza de la naturaleza!!!!', 'PUBLICADO', '2026-04-22 19:19:57.895417', 0, 0);


--
-- TOC entry 5091 (class 0 OID 41010)
-- Dependencies: 225
-- Data for Name: publicacion_hashtags; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (1, 1);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (1, 2);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (2, 3);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (3, 4);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (5, 5);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (5, 6);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (5, 7);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (6, 8);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (11, 9);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (11, 10);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (16, 11);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (16, 12);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (17, 11);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (17, 14);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (18, 15);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (18, 16);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (19, 17);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (19, 18);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (21, 14);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (22, 21);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (22, 22);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (22, 23);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (22, 24);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (23, 5);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (23, 7);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (24, 27);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (24, 14);
INSERT INTO public.publicacion_hashtags (publicacion_id, hashtag_id) VALUES (25, 29);


--
-- TOC entry 5086 (class 0 OID 40965)
-- Dependencies: 220
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.usuarios (id, nombre_usuario, correo, password_hash, rol, fecha_creacion, activo) VALUES (6, 'ADMINISTRADOR', 'admin@gmail.com', '$2b$12$fs9SN4SeQSKyfCkR5Wl.iesvqNlUVPrSLc/e4wWBX9qhZwdwnRbiG', 'ADMIN', '2026-04-19 08:39:54.612319', true);
INSERT INTO public.usuarios (id, nombre_usuario, correo, password_hash, rol, fecha_creacion, activo) VALUES (4, 'martrin', 'martin@gmail.com', '$2b$12$4ocWzMZZzd5X8BGd1QNlXO/OZXPxPisUpL3GDITsRjsl389ZvX0GS', 'USER', '2026-04-18 12:10:14.701083', true);
INSERT INTO public.usuarios (id, nombre_usuario, correo, password_hash, rol, fecha_creacion, activo) VALUES (7, 'Amelia', 'amelia@gmail.com', '$2b$12$sxmJMMpe4Qid0YJ4Vw47I.XR5CIq932b8veQB347LOs24fLYo5/h6', 'USER', '2026-04-21 00:05:46.759499', true);
INSERT INTO public.usuarios (id, nombre_usuario, correo, password_hash, rol, fecha_creacion, activo) VALUES (8, 'Douglas Esaú Catú Otzoy', 'catu@gmail.com', '$2b$12$o1epAenpBX.mHViZrq0NbOD3Nbrs3SFmAsn1IuZtkFjtyc5U5JQdC', 'USER', '2026-04-21 23:14:52.436402', true);
INSERT INTO public.usuarios (id, nombre_usuario, correo, password_hash, rol, fecha_creacion, activo) VALUES (9, 'Esaú Catú', 'otzoyesau@gmail.com', '$2b$12$hN8L2JXtE9sV5dfSnkSV6uvk8yMB0wzBNcFmVe9UudTu1cfWPkb2G', 'USER', '2026-04-24 01:24:36.567202', true);
INSERT INTO public.usuarios (id, nombre_usuario, correo, password_hash, rol, fecha_creacion, activo) VALUES (5, 'Sebastian', 'sebas@gmail.com', '$2b$12$gEt6PGMr/c6Jvh0MKbbjWuwFX/AtCOuyPH5p/IK9DyYCWUkrYlm1G', 'USER', '2026-04-18 23:35:03.413039', false);


--
-- TOC entry 5093 (class 0 OID 41028)
-- Dependencies: 227
-- Data for Name: votos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.votos (id, publicacion_id, usuario_id, tipo_voto, fecha_creacion) VALUES (2, 4, 6, 1, '2026-04-19 20:41:58.453214');
INSERT INTO public.votos (id, publicacion_id, usuario_id, tipo_voto, fecha_creacion) VALUES (1, 1, 6, 0, '2026-04-19 08:40:49.028077');
INSERT INTO public.votos (id, publicacion_id, usuario_id, tipo_voto, fecha_creacion) VALUES (3, 11, 4, 1, '2026-04-19 20:48:19.949677');
INSERT INTO public.votos (id, publicacion_id, usuario_id, tipo_voto, fecha_creacion) VALUES (4, 4, 4, 1, '2026-04-19 20:48:26.548698');
INSERT INTO public.votos (id, publicacion_id, usuario_id, tipo_voto, fecha_creacion) VALUES (5, 5, 4, 1, '2026-04-20 09:33:39.650671');
INSERT INTO public.votos (id, publicacion_id, usuario_id, tipo_voto, fecha_creacion) VALUES (6, 16, 6, 1, '2026-04-20 09:40:40.746679');
INSERT INTO public.votos (id, publicacion_id, usuario_id, tipo_voto, fecha_creacion) VALUES (7, 4, 7, 1, '2026-04-21 00:06:06.61227');
INSERT INTO public.votos (id, publicacion_id, usuario_id, tipo_voto, fecha_creacion) VALUES (8, 16, 7, 1, '2026-04-21 00:06:17.450328');
INSERT INTO public.votos (id, publicacion_id, usuario_id, tipo_voto, fecha_creacion) VALUES (10, 3, 6, 1, '2026-04-21 00:29:02.723862');
INSERT INTO public.votos (id, publicacion_id, usuario_id, tipo_voto, fecha_creacion) VALUES (11, 1, 4, 0, '2026-04-21 09:56:37.603694');
INSERT INTO public.votos (id, publicacion_id, usuario_id, tipo_voto, fecha_creacion) VALUES (12, 17, 6, 1, '2026-04-21 23:12:21.355586');
INSERT INTO public.votos (id, publicacion_id, usuario_id, tipo_voto, fecha_creacion) VALUES (13, 17, 8, 1, '2026-04-21 23:15:16.129271');
INSERT INTO public.votos (id, publicacion_id, usuario_id, tipo_voto, fecha_creacion) VALUES (15, 17, 7, 1, '2026-04-21 23:22:32.911251');
INSERT INTO public.votos (id, publicacion_id, usuario_id, tipo_voto, fecha_creacion) VALUES (14, 17, 5, 1, '2026-04-21 23:16:56.689185');
INSERT INTO public.votos (id, publicacion_id, usuario_id, tipo_voto, fecha_creacion) VALUES (17, 21, 5, 1, '2026-04-22 12:37:38.274016');
INSERT INTO public.votos (id, publicacion_id, usuario_id, tipo_voto, fecha_creacion) VALUES (18, 21, 4, 0, '2026-04-22 19:14:05.860482');
INSERT INTO public.votos (id, publicacion_id, usuario_id, tipo_voto, fecha_creacion) VALUES (19, 7, 4, 0, '2026-04-22 19:14:52.617581');
INSERT INTO public.votos (id, publicacion_id, usuario_id, tipo_voto, fecha_creacion) VALUES (20, 23, 6, 1, '2026-04-22 20:06:53.519442');
INSERT INTO public.votos (id, publicacion_id, usuario_id, tipo_voto, fecha_creacion) VALUES (21, 23, 4, 1, '2026-04-22 20:08:31.824831');
INSERT INTO public.votos (id, publicacion_id, usuario_id, tipo_voto, fecha_creacion) VALUES (22, 24, 6, 1, '2026-04-24 01:34:11.521698');


--
-- TOC entry 5125 (class 0 OID 0)
-- Dependencies: 230
-- Name: auditoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auditoria_id_seq', 379, true);


--
-- TOC entry 5126 (class 0 OID 0)
-- Dependencies: 228
-- Name: comentarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comentarios_id_seq', 16, true);


--
-- TOC entry 5127 (class 0 OID 0)
-- Dependencies: 223
-- Name: hashtags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hashtags_id_seq', 29, true);


--
-- TOC entry 5128 (class 0 OID 0)
-- Dependencies: 221
-- Name: publicacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.publicacion_id_seq', 25, true);


--
-- TOC entry 5129 (class 0 OID 0)
-- Dependencies: 219
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 9, true);


--
-- TOC entry 5130 (class 0 OID 0)
-- Dependencies: 226
-- Name: votos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.votos_id_seq', 22, true);


--
-- TOC entry 4927 (class 2606 OID 41086)
-- Name: auditoria auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_pkey PRIMARY KEY (id);


--
-- TOC entry 4925 (class 2606 OID 41064)
-- Name: comentarios comentarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentarios
    ADD CONSTRAINT comentarios_pkey PRIMARY KEY (id);


--
-- TOC entry 4929 (class 2606 OID 57355)
-- Name: configuracion configuracion_clave_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion
    ADD CONSTRAINT configuracion_clave_key UNIQUE (clave);


--
-- TOC entry 4915 (class 2606 OID 41009)
-- Name: hashtags hashtags_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hashtags
    ADD CONSTRAINT hashtags_nombre_key UNIQUE (nombre);


--
-- TOC entry 4917 (class 2606 OID 41007)
-- Name: hashtags hashtags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hashtags
    ADD CONSTRAINT hashtags_pkey PRIMARY KEY (id);


--
-- TOC entry 4919 (class 2606 OID 41016)
-- Name: publicacion_hashtags publicacion_hashtags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publicacion_hashtags
    ADD CONSTRAINT publicacion_hashtags_pkey PRIMARY KEY (publicacion_id, hashtag_id);


--
-- TOC entry 4913 (class 2606 OID 40993)
-- Name: publicacion publicacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publicacion
    ADD CONSTRAINT publicacion_pkey PRIMARY KEY (id);


--
-- TOC entry 4921 (class 2606 OID 41040)
-- Name: votos unico_voto_por_usuario; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votos
    ADD CONSTRAINT unico_voto_por_usuario UNIQUE (usuario_id, publicacion_id);


--
-- TOC entry 4907 (class 2606 OID 40981)
-- Name: usuarios usuarios_correo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);


--
-- TOC entry 4909 (class 2606 OID 40979)
-- Name: usuarios usuarios_nombre_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_nombre_usuario_key UNIQUE (nombre_usuario);


--
-- TOC entry 4911 (class 2606 OID 40977)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 4923 (class 2606 OID 41038)
-- Name: votos votos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votos
    ADD CONSTRAINT votos_pkey PRIMARY KEY (id);


--
-- TOC entry 4937 (class 2606 OID 41087)
-- Name: auditoria auditoria_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- TOC entry 4935 (class 2606 OID 41065)
-- Name: comentarios comentarios_publicacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentarios
    ADD CONSTRAINT comentarios_publicacion_id_fkey FOREIGN KEY (publicacion_id) REFERENCES public.publicacion(id) ON DELETE RESTRICT;


--
-- TOC entry 4936 (class 2606 OID 41070)
-- Name: comentarios comentarios_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentarios
    ADD CONSTRAINT comentarios_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE RESTRICT;


--
-- TOC entry 4930 (class 2606 OID 40994)
-- Name: publicacion fk_post_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publicacion
    ADD CONSTRAINT fk_post_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE RESTRICT;


--
-- TOC entry 4931 (class 2606 OID 41022)
-- Name: publicacion_hashtags publicacion_hashtags_hashtag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publicacion_hashtags
    ADD CONSTRAINT publicacion_hashtags_hashtag_id_fkey FOREIGN KEY (hashtag_id) REFERENCES public.hashtags(id) ON DELETE CASCADE;


--
-- TOC entry 4932 (class 2606 OID 41017)
-- Name: publicacion_hashtags publicacion_hashtags_publicacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publicacion_hashtags
    ADD CONSTRAINT publicacion_hashtags_publicacion_id_fkey FOREIGN KEY (publicacion_id) REFERENCES public.publicacion(id) ON DELETE CASCADE;


--
-- TOC entry 4933 (class 2606 OID 41041)
-- Name: votos votos_publicacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votos
    ADD CONSTRAINT votos_publicacion_id_fkey FOREIGN KEY (publicacion_id) REFERENCES public.publicacion(id) ON DELETE CASCADE;


--
-- TOC entry 4934 (class 2606 OID 41046)
-- Name: votos votos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votos
    ADD CONSTRAINT votos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 5104 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO dba_role;
GRANT USAGE ON SCHEMA public TO app_role;
GRANT USAGE ON SCHEMA public TO admin_read_role;


--
-- TOC entry 5105 (class 0 OID 0)
-- Dependencies: 231
-- Name: TABLE auditoria; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.auditoria TO dba_role;
GRANT INSERT ON TABLE public.auditoria TO app_role;
GRANT SELECT ON TABLE public.auditoria TO admin_read_role;


--
-- TOC entry 5107 (class 0 OID 0)
-- Dependencies: 230
-- Name: SEQUENCE auditoria_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.auditoria_id_seq TO dba_role;
GRANT SELECT,USAGE ON SEQUENCE public.auditoria_id_seq TO app_role;


--
-- TOC entry 5108 (class 0 OID 0)
-- Dependencies: 229
-- Name: TABLE comentarios; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.comentarios TO dba_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.comentarios TO app_role;


--
-- TOC entry 5110 (class 0 OID 0)
-- Dependencies: 228
-- Name: SEQUENCE comentarios_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.comentarios_id_seq TO dba_role;
GRANT SELECT,USAGE ON SEQUENCE public.comentarios_id_seq TO app_role;


--
-- TOC entry 5111 (class 0 OID 0)
-- Dependencies: 232
-- Name: TABLE configuracion; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.configuracion TO dba_role;


--
-- TOC entry 5112 (class 0 OID 0)
-- Dependencies: 224
-- Name: TABLE hashtags; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.hashtags TO dba_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.hashtags TO app_role;


--
-- TOC entry 5114 (class 0 OID 0)
-- Dependencies: 223
-- Name: SEQUENCE hashtags_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.hashtags_id_seq TO dba_role;
GRANT SELECT,USAGE ON SEQUENCE public.hashtags_id_seq TO app_role;


--
-- TOC entry 5115 (class 0 OID 0)
-- Dependencies: 222
-- Name: TABLE publicacion; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.publicacion TO dba_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.publicacion TO app_role;


--
-- TOC entry 5116 (class 0 OID 0)
-- Dependencies: 225
-- Name: TABLE publicacion_hashtags; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.publicacion_hashtags TO dba_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.publicacion_hashtags TO app_role;


--
-- TOC entry 5118 (class 0 OID 0)
-- Dependencies: 221
-- Name: SEQUENCE publicacion_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.publicacion_id_seq TO dba_role;
GRANT SELECT,USAGE ON SEQUENCE public.publicacion_id_seq TO app_role;


--
-- TOC entry 5119 (class 0 OID 0)
-- Dependencies: 220
-- Name: TABLE usuarios; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.usuarios TO dba_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.usuarios TO app_role;
GRANT SELECT ON TABLE public.usuarios TO admin_read_role;


--
-- TOC entry 5121 (class 0 OID 0)
-- Dependencies: 219
-- Name: SEQUENCE usuarios_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.usuarios_id_seq TO dba_role;
GRANT SELECT,USAGE ON SEQUENCE public.usuarios_id_seq TO app_role;


--
-- TOC entry 5122 (class 0 OID 0)
-- Dependencies: 227
-- Name: TABLE votos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.votos TO dba_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.votos TO app_role;


--
-- TOC entry 5124 (class 0 OID 0)
-- Dependencies: 226
-- Name: SEQUENCE votos_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.votos_id_seq TO dba_role;
GRANT SELECT,USAGE ON SEQUENCE public.votos_id_seq TO app_role;


-- Completed on 2026-04-25 11:38:32

--
-- PostgreSQL database dump complete
--



