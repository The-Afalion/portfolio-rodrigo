-- Shared trigger to provision every user-facing profile we need.
create or replace function public.handle_new_platform_user()
returns trigger as $$
begin
  if to_regclass('public."Profile"') is not null then
    insert into public."Profile" (id)
    values (new.id)
    on conflict (id) do nothing;
  end if;

  if to_regclass('public.chess_profiles') is not null then
    insert into public.chess_profiles (id, username, elo, bots_defeated)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'username', 'Jugador_' || substring(new.id::text from 1 for 6)),
      400,
      '{}'
    )
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function when a new user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_platform_user();
