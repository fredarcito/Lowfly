-- Which saved trip an AI call made the itinerary for (the trip's id, unique within its account), so the admin
-- can show what each itinerary cost. Calls from before this column have none.
alter table public.itinerary_usage add column trip_id text;

create index itinerary_usage_trip on public.itinerary_usage (user_id, trip_id);
