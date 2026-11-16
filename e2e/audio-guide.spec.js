import { PHONE, expect, openWith, test } from "./helpers/test.js";
import { romeTrip } from "./helpers/trips.js";

// Audio guides of historic places (docs/audio-guide.md). The API is answered here: making a real guide costs money
// (the AI and Google's voice) and takes up to a minute.

// Half a second of silence, as a WAV the browser can play
const silence = () => {
  const sampleRate = 8000;
  const samples = sampleRate / 2;
  const wav = Buffer.alloc(44 + samples);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(36 + samples, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(sampleRate, 28);
  wav.writeUInt16LE(1, 32);
  wav.writeUInt16LE(8, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(samples, 40);
  wav.fill(128, 44);
  return `data:audio/wav;base64,${wav.toString("base64")}`;
};

const PANTHEON = "https://es.wikipedia.org/wiki/Pante%C3%B3n_de_Agripa";

const GUIDE = {
  id: "test-pantheon",
  lang: "es",
  title: "Panteón de Agripa",
  source: PANTHEON,
  reviewed: false,
  steps: [
    { title: "El pórtico", where: "Delante de las columnas", action: "Ya estoy dentro", autoNext: false, text: "Mira las columnas del pórtico.", audio: silence(), seconds: 30 },
    { title: "La cúpula", where: "Dentro, en el centro", action: null, autoNext: false, text: "Ahora mira arriba, al óculo.", audio: silence(), seconds: 25 },
  ],
};

// The Pantheon, on the first day of the Rome trip, opened
const openPantheon = async (page) => {
  const trip = romeTrip();
  await openWith(page, `/es/trips?id=${trip.id}`, { trips: [trip] });
  await page.getByRole("button", { name: /Panteón de Agripa/ }).first().click();
};

test.describe("audio guide", () => {
  test("a historic place plays its guide step by step", async ({ page }) => {
    await page.setViewportSize(PHONE);
    const asked = [];
    await page.route("**/api/audio-guide", async (route) => {
      asked.push(route.request().postDataJSON());
      await route.fulfill({ json: GUIDE });
    });
    await openPantheon(page);
    await page.getByRole("button", { name: "Audio guía", exact: true }).click();

    // The guide is asked for by the article its history comes from, in the page's language
    expect(asked[0]).toMatchObject({ source: PANTHEON, lang: "es", place: "Panteón de Agripa" });
    const sheet = page.getByRole("dialog");
    await expect(sheet.getByRole("heading", { name: "El pórtico" })).toBeVisible();
    await expect(sheet.getByText("Parte 1 de 2")).toBeVisible();
    await expect(sheet.getByText("Delante de las columnas")).toBeVisible();

    // The first time, how it works; gone once understood (and remembered)
    await expect(sheet.getByText(/Cada parte termina diciéndote adónde ir/)).toBeVisible();
    await sheet.getByRole("button", { name: "Entendido" }).click();
    await expect(sheet.getByText(/Cada parte termina diciéndote adónde ir/)).toHaveCount(0);

    // Quiet while the step plays, coral once it is over
    const next = sheet.getByRole("button", { name: /Ya estoy dentro/ });
    await expect(next).toHaveAttribute("data-variant", "outline");
    await sheet.getByRole("button", { name: "Reproducir" }).click();
    await expect(next).toHaveAttribute("data-variant", "default", { timeout: 10_000 });

    // The text, to read it
    await sheet.getByRole("button", { name: "Ver el texto" }).click();
    await expect(sheet.getByText("Mira las columnas del pórtico.")).toBeVisible();

    // At the next spot: the last step, which ends the visit
    await next.click();
    await expect(sheet.getByRole("heading", { name: "La cúpula" })).toBeVisible();
    await expect(sheet.getByText("Parte 2 de 2")).toBeVisible();
    await sheet.getByRole("button", { name: /Terminar la visita/ }).click();
    await expect(sheet).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Audio guía escuchada" })).toBeVisible();
  });

  test("folded, it stays as a mini player", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.route("**/api/audio-guide", (route) => route.fulfill({ json: GUIDE }));
    await openPantheon(page);
    await page.getByRole("button", { name: "Audio guía", exact: true }).click();
    const sheet = page.getByRole("dialog");
    await sheet.getByRole("button", { name: "Reproducir" }).click();
    await sheet.getByRole("button", { name: "Minimizar" }).click();

    const mini = page.getByRole("button", { name: "Abrir la audio guía" });
    await expect(mini).toContainText("El pórtico");
    await mini.click();
    await expect(page.getByRole("dialog").getByRole("heading", { name: "El pórtico" })).toBeVisible();
    await page.getByRole("dialog").getByRole("button", { name: "Minimizar" }).click();
    await page.getByRole("button", { name: "Cerrar la audio guía" }).click();
    await expect(mini).toHaveCount(0);
  });

  test.describe("a new guide without an account", () => {
    test.use({ expectedErrors: /status of 401/ });

    test("asks to sign in", async ({ page }) => {
      await page.setViewportSize(PHONE);
      await page.route("**/api/audio-guide", (route) => route.fulfill({ status: 401, json: { error: "audioSignIn", params: {} } }));
      await openPantheon(page);
      await page.getByRole("button", { name: "Audio guía", exact: true }).click();
      const sheet = page.getByRole("dialog");
      await expect(sheet.getByText("Para preparar una audio guía nueva, entra con tu cuenta.")).toBeVisible();
      await expect(sheet.getByRole("link", { name: "Entrar con tu cuenta" })).toHaveAttribute("href", /\/es\/login\?next=/);
    });
  });
});
