-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('superadmin','administrador','asesor');
CREATE TYPE public.operation_type AS ENUM ('venta','arriendo');
CREATE TYPE public.property_status AS ENUM ('borrador','publicada','vendida','arrendada','archivada');
CREATE TYPE public.credit_type AS ENUM ('hipotecario','leasing');
CREATE TYPE public.lead_status AS ENUM ('nuevo','contactado','en_seguimiento','cita','negociacion','cerrado');
CREATE TYPE public.appointment_status AS ENUM ('pendiente','confirmada','cancelada','realizada');
CREATE TYPE public.acquisition_status AS ENUM ('nueva','en_revision','aceptada','rechazada','publicada');
CREATE TYPE public.credit_status AS ENUM ('nueva','contactado','en_estudio','aprobada','rechazada','cerrada');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ ROLES ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('superadmin','administrador'));
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "roles read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ SITE SETTINGS (editable content) ============
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "settings admin write" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Structural keys only, no invented commercial data
INSERT INTO public.site_settings (key, value) VALUES
 ('empresa', '{"razon_social":"","nombre_comercial":"eXIn Grupo","nit":"","logo_path":"","direccion":"","ciudad":"","horarios":""}'),
 ('contacto', '{"telefono":"","whatsapp":"","correo":"","direccion":""}'),
 ('redes', '{"facebook":"","instagram":"","youtube":"","linkedin":"","tiktok":""}'),
 ('seo', '{"titulo":"eXIn Grupo","descripcion":"Plataforma inmobiliaria de eXIn Grupo.","imagen":""}'),
 ('home', '{"hero_titulo":"Encuentra el inmueble perfecto para ti","hero_subtitulo":"","hero_descripcion":"","hero_imagen":"","hero_boton_texto":"Ver propiedades","hero_boton_url":"/propiedades","servicios":[],"cta_titulo":"","cta_texto":""}'),
 ('creditos', '{"hero_titulo":"Créditos y leasing","hero_descripcion":"","hipotecario_titulo":"Crédito hipotecario","hipotecario_texto":"","leasing_titulo":"Leasing habitacional","leasing_texto":"","whatsapp_mensaje":"Hola, estoy interesado en recibir asesoría para un crédito."}'),
 ('captacion', '{"hero_titulo":"Vende tu propiedad","hero_descripcion":"","texto_legal":""}'),
 ('propiedades', '{"arriendo_activo":false,"whatsapp_mensaje":"Hola, estoy interesado en la propiedad"}'),
 ('legal', '{"politica_privacidad":"","tratamiento_datos":""}')
ON CONFLICT (key) DO NOTHING;

-- ============ PROPERTY TYPES (editable catalog) ============
CREATE TABLE public.property_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.property_types TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.property_types TO authenticated;
GRANT ALL ON public.property_types TO service_role;
ALTER TABLE public.property_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "types public read" ON public.property_types FOR SELECT TO anon, authenticated USING (is_active OR public.is_staff(auth.uid()));
CREATE POLICY "types admin write" ON public.property_types FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
INSERT INTO public.property_types (name, slug, sort_order) VALUES
 ('Apartamento','apartamento',1),('Apartaestudio','apartaestudio',2),('Casa','casa',3),
 ('Oficina','oficina',4),('Local comercial','local-comercial',5),('Bodega','bodega',6),('Lote','lote',7);

-- ============ PROPERTIES ============
CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_code text NOT NULL UNIQUE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  operation public.operation_type NOT NULL DEFAULT 'venta',
  property_type_id uuid REFERENCES public.property_types(id),
  price numeric(14,2),
  admin_fee numeric(14,2),
  currency text NOT NULL DEFAULT 'COP',
  city text,
  zone text,
  address text,
  stratum integer,
  area_m2 numeric(10,2),
  bedrooms integer,
  bathrooms integer,
  parking integer,
  amenities text[] NOT NULL DEFAULT '{}',
  description text,
  status public.property_status NOT NULL DEFAULT 'borrador',
  is_featured boolean NOT NULL DEFAULT false,
  featured_at timestamptz,
  cover_image_path text,
  seo_title text,
  seo_description text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_featured ON public.properties(is_featured) WHERE is_featured;
CREATE INDEX idx_properties_city ON public.properties(city);
GRANT SELECT ON public.properties TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "properties public read" ON public.properties FOR SELECT TO anon USING (status = 'publicada');
CREATE POLICY "properties staff read" ON public.properties FOR SELECT TO authenticated USING (status = 'publicada' OR public.is_staff(auth.uid()));
CREATE POLICY "properties staff write" ON public.properties FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER properties_touch BEFORE UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- max 5 featured
CREATE OR REPLACE FUNCTION public.enforce_featured_limit()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE cnt integer;
BEGIN
  IF NEW.is_featured AND (TG_OP = 'INSERT' OR COALESCE(OLD.is_featured,false) = false) THEN
    SELECT count(*) INTO cnt FROM public.properties WHERE is_featured AND id <> NEW.id;
    IF cnt >= 5 THEN
      RAISE EXCEPTION 'No es posible agregar otra propiedad destacada. Ya existen 5; debe retirar una de las actuales.';
    END IF;
    NEW.featured_at = now();
  END IF;
  IF NEW.is_featured = false THEN NEW.featured_at = NULL; END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER properties_featured_limit BEFORE INSERT OR UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.enforce_featured_limit();

-- ============ PROPERTY IMAGES ============
CREATE TABLE public.property_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  name text,
  alt_text text,
  sort_order integer NOT NULL DEFAULT 0,
  is_cover boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_property_images_property ON public.property_images(property_id);
GRANT SELECT ON public.property_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.property_images TO authenticated;
GRANT ALL ON public.property_images TO service_role;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "images public read" ON public.property_images FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.status = 'publicada'));
CREATE POLICY "images staff read" ON public.property_images FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.status = 'publicada'));
CREATE POLICY "images admin write" ON public.property_images FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ============ BANKS ============
CREATE TABLE public.banks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_path text,
  website text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.banks TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.banks TO authenticated;
GRANT ALL ON public.banks TO service_role;
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "banks public read" ON public.banks FOR SELECT TO anon USING (is_active);
CREATE POLICY "banks staff read" ON public.banks FOR SELECT TO authenticated USING (is_active OR public.is_staff(auth.uid()));
CREATE POLICY "banks admin write" ON public.banks FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ============ CONTACTS / LEADS ============
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text,
  message text,
  source text NOT NULL DEFAULT 'contacto',
  preferred_contact text,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  property_code text,
  status public.lead_status NOT NULL DEFAULT 'nuevo',
  assigned_to uuid,
  notes text,
  consent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.contacts TO authenticated;
GRANT ALL ON public.contacts TO service_role;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contacts staff read" ON public.contacts FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "contacts staff update" ON public.contacts FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "contacts admin delete" ON public.contacts FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER contacts_touch BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ CREDIT APPLICATIONS ============
CREATE TABLE public.credit_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text NOT NULL,
  city text,
  credit_type public.credit_type NOT NULL DEFAULT 'hipotecario',
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  property_code text,
  approx_amount numeric(14,2),
  notes text,
  status public.credit_status NOT NULL DEFAULT 'nueva',
  assigned_to uuid,
  consent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.credit_applications TO authenticated;
GRANT ALL ON public.credit_applications TO service_role;
ALTER TABLE public.credit_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "credits staff read" ON public.credit_applications FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "credits staff update" ON public.credit_applications FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "credits admin delete" ON public.credit_applications FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER credits_touch BEFORE UPDATE ON public.credit_applications FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ ACQUISITIONS (captaciones) ============
CREATE TABLE public.acquisitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_name text NOT NULL,
  owner_phone text NOT NULL,
  owner_email text,
  preferred_contact text,
  property_type text,
  operation public.operation_type NOT NULL DEFAULT 'venta',
  address text,
  city text,
  zone text,
  expected_price numeric(14,2),
  area_m2 numeric(10,2),
  bedrooms integer,
  bathrooms integer,
  parking integer,
  notes text,
  status public.acquisition_status NOT NULL DEFAULT 'nueva',
  assigned_to uuid,
  consent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.acquisitions TO authenticated;
GRANT ALL ON public.acquisitions TO service_role;
ALTER TABLE public.acquisitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acq staff read" ON public.acquisitions FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "acq staff update" ON public.acquisitions FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "acq admin delete" ON public.acquisitions FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE TRIGGER acq_touch BEFORE UPDATE ON public.acquisitions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.acquisition_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  acquisition_id uuid NOT NULL REFERENCES public.acquisitions(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.acquisition_photos TO authenticated;
GRANT ALL ON public.acquisition_photos TO service_role;
ALTER TABLE public.acquisition_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acq photos staff" ON public.acquisition_photos FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "acq photos admin write" ON public.acquisition_photos FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ============ APPOINTMENTS ============
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  property_code text,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_phone text,
  client_email text,
  scheduled_at timestamptz,
  status public.appointment_status NOT NULL DEFAULT 'pendiente',
  advisor_id uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appt staff read" ON public.appointments FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "appt staff write" ON public.appointments FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER appt_touch BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  body text,
  entity_type text,
  entity_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_unread ON public.notifications(is_read, created_at DESC);
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif staff read" ON public.notifications FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "notif staff update" ON public.notifications FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "notif admin delete" ON public.notifications FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.notify_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_title text; v_type text; v_body text;
BEGIN
  IF TG_TABLE_NAME = 'acquisitions' THEN
    v_type := 'captacion'; v_title := 'Nueva captación'; v_body := NEW.owner_name;
  ELSIF TG_TABLE_NAME = 'credit_applications' THEN
    v_type := 'credito'; v_title := 'Nueva solicitud de crédito'; v_body := NEW.full_name;
  ELSIF TG_TABLE_NAME = 'appointments' THEN
    v_type := 'cita'; v_title := 'Nueva cita'; v_body := NEW.client_name;
  ELSE
    v_type := 'contacto'; v_title := 'Nuevo contacto'; v_body := NEW.full_name;
  END IF;
  INSERT INTO public.notifications (type, title, body, entity_type, entity_id)
  VALUES (v_type, v_title, v_body, TG_TABLE_NAME, NEW.id);
  RETURN NEW;
END; $$;
CREATE TRIGGER notify_contacts AFTER INSERT ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.notify_event();
CREATE TRIGGER notify_credits AFTER INSERT ON public.credit_applications FOR EACH ROW EXECUTE FUNCTION public.notify_event();
CREATE TRIGGER notify_acq AFTER INSERT ON public.acquisitions FOR EACH ROW EXECUTE FUNCTION public.notify_event();
CREATE TRIGGER notify_appt AFTER INSERT ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.notify_event();

-- ============ AUDIT LOG ============
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit admin read" ON public.audit_log FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "audit staff insert" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

-- ============ SUBMISSION RATE LIMIT ============
CREATE TABLE public.submission_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint text NOT NULL,
  kind text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_submission_log_fp ON public.submission_log(fingerprint, created_at DESC);
GRANT ALL ON public.submission_log TO service_role;
ALTER TABLE public.submission_log ENABLE ROW LEVEL SECURITY;