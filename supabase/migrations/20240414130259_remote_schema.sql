create table "public"."reminders" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid,
    "description" text,
    "location" text,
    "date" date,
    "img_url" text
);


alter table "public"."reminders" enable row level security;

CREATE UNIQUE INDEX reminders_id_key ON public.reminders USING btree (id);

CREATE UNIQUE INDEX reminders_pkey ON public.reminders USING btree (id);

alter table "public"."reminders" add constraint "reminders_pkey" PRIMARY KEY using index "reminders_pkey";

alter table "public"."reminders" add constraint "public_reminders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."reminders" validate constraint "public_reminders_user_id_fkey";

alter table "public"."reminders" add constraint "reminders_id_key" UNIQUE using index "reminders_id_key";

grant delete on table "public"."reminders" to "anon";

grant insert on table "public"."reminders" to "anon";

grant references on table "public"."reminders" to "anon";

grant select on table "public"."reminders" to "anon";

grant trigger on table "public"."reminders" to "anon";

grant truncate on table "public"."reminders" to "anon";

grant update on table "public"."reminders" to "anon";

grant delete on table "public"."reminders" to "authenticated";

grant insert on table "public"."reminders" to "authenticated";

grant references on table "public"."reminders" to "authenticated";

grant select on table "public"."reminders" to "authenticated";

grant trigger on table "public"."reminders" to "authenticated";

grant truncate on table "public"."reminders" to "authenticated";

grant update on table "public"."reminders" to "authenticated";

grant delete on table "public"."reminders" to "service_role";

grant insert on table "public"."reminders" to "service_role";

grant references on table "public"."reminders" to "service_role";

grant select on table "public"."reminders" to "service_role";

grant trigger on table "public"."reminders" to "service_role";

grant truncate on table "public"."reminders" to "service_role";

grant update on table "public"."reminders" to "service_role";

create policy "Enable delete for users based on user_id"
on "public"."reminders"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable insert for users based on user_id"
on "public"."reminders"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable reads for users based on user_id"
on "public"."reminders"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "new update"
on "public"."reminders"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));



