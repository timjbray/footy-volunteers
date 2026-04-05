import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

function getAuth() {
  const credentials = JSON.parse(
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "{}"
  );
  return new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });
}

function getSheets() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID!;

export interface Slot {
  round: string;
  date: string;
  location: string;
  game: string;
  time: string;
  role: string;
  volunteer: string;
  rowIndex: number;
}

export interface RoundData {
  round: string;
  date: string;
  location: string;
  games: GameData[];
}

export interface GameData {
  game: string;
  time: string;
  slots: Slot[];
}

/**
 * Get all sheet tab names (each tab = one round)
 */
export async function getSheetTabs(): Promise<string[]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });
  return (
    res.data.sheets
      ?.map((s) => s.properties?.title)
      .filter((t): t is string => !!t) ?? []
  );
}

/**
 * Get the latest round tab name (last tab in the spreadsheet)
 */
export async function getLatestRoundTab(): Promise<string | null> {
  const tabs = await getSheetTabs();
  return tabs.length > 0 ? tabs[tabs.length - 1] : null;
}

/**
 * Read all rows from a specific round tab and return structured data
 */
export async function getRoundData(
  sheetName: string
): Promise<RoundData | null> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${sheetName}'!A:G`,
  });

  const rows = res.data.values;
  if (!rows || rows.length < 2) return null;

  // Row 0 is header: Round, Date, Location, Game, Time, Role, Volunteer
  const slots: Slot[] = rows.slice(1).map((row, i) => ({
    round: row[0] || "",
    date: row[1] || "",
    location: row[2] || "",
    game: row[3] || "",
    time: row[4] || "",
    role: row[5] || "",
    volunteer: row[6] || "",
    rowIndex: i + 2, // 1-indexed, skip header
  }));

  if (slots.length === 0) return null;

  const round = slots[0].round;
  const date = slots[0].date;
  const location = slots[0].location;

  // Group by game
  const gameMap = new Map<string, Slot[]>();
  for (const slot of slots) {
    const key = `${slot.game}|${slot.time}`;
    if (!gameMap.has(key)) gameMap.set(key, []);
    gameMap.get(key)!.push(slot);
  }

  const games: GameData[] = Array.from(gameMap.entries()).map(
    ([key, slots]) => ({
      game: key.split("|")[0],
      time: key.split("|")[1],
      slots,
    })
  );

  return { round, date, location, games };
}

/**
 * Sign up a volunteer for a specific slot
 */
export async function signUp(
  sheetName: string,
  rowIndex: number,
  name: string
): Promise<void> {
  const sheets = getSheets();
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${sheetName}'!G${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[name]],
    },
  });
}

/**
 * Clear a volunteer from a specific slot
 */
export async function clearSlot(
  sheetName: string,
  rowIndex: number
): Promise<void> {
  const sheets = getSheets();
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${sheetName}'!G${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[""]],
    },
  });
}
