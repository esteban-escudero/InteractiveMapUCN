--
-- PostgreSQL database dump
--

\restrict 3ITgZvps5bp4HrNfyRw4KuxSwcYyI4SJ3qg3sMdsKbgHvfc5yES3sdTWIlzUmVj

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

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

--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: delete_expired_tokens(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_expired_tokens() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  DELETE FROM refresh_tokens WHERE expires_at < NOW();
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: administrador; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.administrador (
    id_admin integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    nombre character varying(100) NOT NULL,
    activo boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: administrador_id_admin_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.administrador_id_admin_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: administrador_id_admin_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.administrador_id_admin_seq OWNED BY public.administrador.id_admin;


--
-- Name: edificio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.edificio (
    id_edificio integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    ubicacion public.geometry(Point,4326),
    tipo character varying(50) DEFAULT 'Oficina Profesor'::character varying NOT NULL,
    estado character varying(20) DEFAULT 'activo'::character varying NOT NULL,
    planos jsonb DEFAULT '[]'::jsonb,
    CONSTRAINT chk_estado_edificio CHECK (((estado)::text = ANY ((ARRAY['activo'::character varying, 'mantenimiento'::character varying, 'cerrado'::character varying, 'construccion'::character varying])::text[]))),
    CONSTRAINT chk_tipo_edificio CHECK (((tipo)::text = ANY ((ARRAY['Baño'::character varying, 'Sala de Clase'::character varying, 'Laboratorio'::character varying, 'Oficina Administracion'::character varying, 'Casino'::character varying, 'Cafeteria'::character varying, 'Biblioteca'::character varying, 'Sala de Estudio'::character varying, 'Gimnasio'::character varying, 'Estacionamiento'::character varying, 'Oficina Profesor'::character varying, 'Centro de Salud'::character varying, 'Académico'::character varying, 'Administrativo'::character varying, 'Investigación'::character varying, 'Servicios'::character varying, 'Deportivo'::character varying, 'Cultural'::character varying, 'Residencial'::character varying, 'Taller'::character varying, 'Auditorio'::character varying, 'Sala de Conferencias'::character varying])::text[])))
);


--
-- Name: edificio_id_edificio_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.edificio_id_edificio_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: edificio_id_edificio_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.edificio_id_edificio_seq OWNED BY public.edificio.id_edificio;


--
-- Name: plano; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plano (
    id_plano integer NOT NULL,
    id_edificio integer NOT NULL,
    piso integer NOT NULL,
    imagen_plano character varying(255) NOT NULL,
    formato_imagen character varying(10),
    "tamaño_bytes" integer,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: plano_id_plano_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.plano_id_plano_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: plano_id_plano_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.plano_id_plano_seq OWNED BY public.plano.id_plano;


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id integer NOT NULL,
    id_admin integer NOT NULL,
    token character varying(500) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    ip_address character varying(45),
    user_agent text
);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- Name: ruta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ruta (
    id_ruta integer NOT NULL,
    nombre_ruta character varying(100) NOT NULL,
    tipo_ruta character varying(20),
    distancia_metros integer,
    tiempo_estimado_minutos integer,
    activa boolean DEFAULT true,
    geometria_ruta public.geometry(Geometry,4326),
    CONSTRAINT ruta_tipo_ruta_check CHECK (((tipo_ruta)::text = ANY (ARRAY['peatonal'::text, 'accesible'::text, 'emergencia'::text, 'rapida'::text, 'vehicular'::text])))
);


--
-- Name: ruta_id_ruta_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ruta_id_ruta_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ruta_id_ruta_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ruta_id_ruta_seq OWNED BY public.ruta.id_ruta;


--
-- Name: sala; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sala (
    id_sala integer NOT NULL,
    id_edificio integer NOT NULL,
    nombre_sala character varying(100) NOT NULL,
    piso integer NOT NULL,
    tipo_sala character varying(50),
    accesible_silla_ruedas boolean DEFAULT false,
    ubicacion public.geometry(Point,4326)
);


--
-- Name: sala_id_sala_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sala_id_sala_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sala_id_sala_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sala_id_sala_seq OWNED BY public.sala.id_sala;


--
-- Name: administrador id_admin; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.administrador ALTER COLUMN id_admin SET DEFAULT nextval('public.administrador_id_admin_seq'::regclass);


--
-- Name: edificio id_edificio; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edificio ALTER COLUMN id_edificio SET DEFAULT nextval('public.edificio_id_edificio_seq'::regclass);


--
-- Name: plano id_plano; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plano ALTER COLUMN id_plano SET DEFAULT nextval('public.plano_id_plano_seq'::regclass);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- Name: ruta id_ruta; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ruta ALTER COLUMN id_ruta SET DEFAULT nextval('public.ruta_id_ruta_seq'::regclass);


--
-- Name: sala id_sala; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sala ALTER COLUMN id_sala SET DEFAULT nextval('public.sala_id_sala_seq'::regclass);


--
-- Name: administrador administrador_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.administrador
    ADD CONSTRAINT administrador_email_key UNIQUE (email);


--
-- Name: administrador administrador_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.administrador
    ADD CONSTRAINT administrador_pkey PRIMARY KEY (id_admin);


--
-- Name: edificio edificio_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edificio
    ADD CONSTRAINT edificio_pkey PRIMARY KEY (id_edificio);


--
-- Name: plano plano_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plano
    ADD CONSTRAINT plano_pkey PRIMARY KEY (id_plano);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key UNIQUE (token);


--
-- Name: ruta ruta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ruta
    ADD CONSTRAINT ruta_pkey PRIMARY KEY (id_ruta);


--
-- Name: sala sala_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sala
    ADD CONSTRAINT sala_pkey PRIMARY KEY (id_sala);


--
-- Name: idx_edificio_ubicacion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_edificio_ubicacion ON public.edificio USING gist (ubicacion);


--
-- Name: idx_plano_edificio_piso; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_plano_edificio_piso ON public.plano USING btree (id_edificio, piso);


--
-- Name: idx_refresh_tokens_admin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refresh_tokens_admin ON public.refresh_tokens USING btree (id_admin);


--
-- Name: idx_refresh_tokens_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refresh_tokens_expires ON public.refresh_tokens USING btree (expires_at);


--
-- Name: idx_refresh_tokens_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refresh_tokens_token ON public.refresh_tokens USING btree (token);


--
-- Name: idx_ruta_activa; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ruta_activa ON public.ruta USING btree (activa);


--
-- Name: idx_ruta_geometria; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ruta_geometria ON public.ruta USING gist (geometria_ruta);


--
-- Name: idx_sala_edificio; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sala_edificio ON public.sala USING btree (id_edificio);


--
-- Name: idx_sala_piso; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sala_piso ON public.sala USING btree (piso);


--
-- Name: idx_sala_ubicacion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sala_ubicacion ON public.sala USING gist (ubicacion);


--
-- Name: refresh_tokens fk_admin; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT fk_admin FOREIGN KEY (id_admin) REFERENCES public.administrador(id_admin) ON DELETE CASCADE;


--
-- Name: plano plano_id_edificio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plano
    ADD CONSTRAINT plano_id_edificio_fkey FOREIGN KEY (id_edificio) REFERENCES public.edificio(id_edificio) ON DELETE CASCADE;


--
-- Name: sala sala_id_edificio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sala
    ADD CONSTRAINT sala_id_edificio_fkey FOREIGN KEY (id_edificio) REFERENCES public.edificio(id_edificio) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 3ITgZvps5bp4HrNfyRw4KuxSwcYyI4SJ3qg3sMdsKbgHvfc5yES3sdTWIlzUmVj

