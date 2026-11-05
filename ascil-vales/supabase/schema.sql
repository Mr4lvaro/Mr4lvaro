-- Vale de Navidad ASCIL · esquema de la base de datos (Supabase / Postgres)
-- Ejecutar una sola vez en Supabase → SQL Editor. No contiene datos personales.

create table if not exists public.employees (
  id         serial primary key,
  full_name  text not null,
  first_name text not null,               -- nombre con el que se saluda en el mensaje final
  code       text not null unique,        -- código del sobre, p. ej. RAT-13
  code_norm  text generated always as (upper(regexp_replace(code, '[^A-Za-z0-9]', '', 'g'))) stored unique,
  notes      text,                        -- alergias / observaciones (solo las ve el administrador)
  is_test    boolean not null default false,  -- persona de prueba: no cuenta entre las 26
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id           serial primary key,
  employee_id  int not null unique references public.employees(id) on delete cascade,  -- un pedido por persona
  items        jsonb not null,            -- [{id, name, qty, points}]
  total_points int not null,
  created_at   timestamptz not null default now()
);

-- Máximo 26 personas (las de prueba no cuentan)
create or replace function public.limit_employees() returns trigger language plpgsql as $$
begin
  if not new.is_test and (select count(*) from public.employees where not is_test) >= 26 then
    raise exception 'La web está limitada a 26 personas';
  end if;
  return new;
end $$;

drop trigger if exists employees_limit on public.employees;
create trigger employees_limit before insert on public.employees
  for each row execute function public.limit_employees();

-- Seguridad: nadie puede leer ni escribir con la clave pública (anon).
-- Solo el servidor (api/) accede con la clave de servicio, que se salta estas reglas.
alter table public.employees enable row level security;
alter table public.orders    enable row level security;
