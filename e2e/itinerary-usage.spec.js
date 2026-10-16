import { expect, test } from "./helpers/test.js";
import { deleteItineraryUsage, itineraryUsageSince, skipWithoutSupabase } from "./helpers/accounts.js";
import { dayFromNow } from "./helpers/trips.js";

// What every AI itinerary costs is kept (itinerary_usage), also for visitors without an account.
// A real itinerary from the AI: slow and paid, so @live.
test.describe("itinerary usage @live", () => {
  skipWithoutSupabase();
  let since;
  // The rows of this test do not stay among the real ones
  test.afterEach(async () => {
    if (since) await deleteItineraryUsage((await itineraryUsageSince(since)).filter((row) => row.airport === "OPO"));
  });

  test("an itinerary keeps which model made it and the tokens it took", async ({ request }) => {
    test.setTimeout(300_000);
    since = new Date();
    const response = await request.post("/api/itinerary", {
      data: {
        trip: { code: "OPO", city: "Oporto", country: "Portugal", out: { day: dayFromNow(40), time: "09:00", arrive: "10:30" } },
        lang: "es",
      },
      timeout: 280_000,
    });
    expect(response.ok()).toBe(true);

    await expect
      .poll(async () => (await itineraryUsageSince(since)).filter((row) => row.airport === "OPO"), { timeout: 15_000 })
      .toEqual([
        expect.objectContaining({
          user_id: null,
          kind: "flight",
          lang: "es",
          city: "Oporto",
          days: 1,
          provider: expect.stringMatching(/^(gemini|claude)$/),
          model: expect.any(String),
          input_tokens: expect.any(Number),
          output_tokens: expect.any(Number),
        }),
      ]);
  });
});
