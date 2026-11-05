-- Añade una persona FALSA para probar que los pedidos se guardan.
-- Para una base de datos que ya tiene las tablas creadas. Ejecutar una vez en Supabase → SQL Editor.

alter table public.employees add column if not exists is_test boolean not null default false;

-- El límite de 26 personas no cuenta a las de prueba
create or replace function public.limit_employees() returns trigger language plpgsql as $$
begin
  if not new.is_test and (select count(*) from public.employees where not is_test) >= 26 then
    raise exception 'La web está limitada a 26 personas';
  end if;
  return new;
end $$;

insert into public.employees (full_name, first_name, code, is_test, notes)
values ('Persona Fake (prueba)', 'Fake', 'FAKE-01', true, 'Persona de prueba: se borra antes de repartir los sobres')
on conflict (code) do nothing;

-- Cuando termines las pruebas, para borrarla (y su pedido):
--   delete from public.employees where is_test;
