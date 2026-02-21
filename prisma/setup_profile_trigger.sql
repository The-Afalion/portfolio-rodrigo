-- Function to create a profile for a new user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public."Profile" (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function when a new user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
