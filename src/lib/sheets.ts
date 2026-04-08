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

/** Tab names used for volunteer signup lists (not round data) */
const VOLUNTEER_TABS = new Set(["Match Day Helpers", "Bar Volunteers"]);

export interface Slot {
  game: string;
  time: string;
  role: string;
  volunteer: string;
  rowIndex: number;
}

export interface RoundData {
  name: string;
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
 * Get only the round tabs (exclude volunteer signup tabs)
 */
export async function getRoundTabs(): Promise<string[]> {
  const tabs = await getSheetTabs();
  return tabs.filter((t) => !VOLUNTEER_TABS.has(t));
}

/**
 * Get the latest round tab name (last round tab in the spreadsheet)
 */
export async function getLatestRoundTab(): Promise<string | null> {
  const tabs = await getRoundTabs();
  return tabs.length > 0 ? tabs[tabs.length - 1] : null;
}

/**
 * Read all rows from a specific round tab and return structured data.
 * Row 1: Date (A1) | Location (B1)
 * Row 2: Header — Game | Time | Role | Volunteer
 * Row 3+: Data
 * Tab name is used as the round name.
 */
export async function getRoundData(
  sheetName: string
): Promise<RoundData | null> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${sheetName}'!A:D`,
  });

  const rows = res.data.values;
  if (!rows || rows.length < 4) return null;

  // Row 0 (A1/B1): date and location
  const date = rows[0]?.[0] || "";
  const location = rows[0]?.[1] || "";

  // Row 1 is blank, row 2 is header, row 3+ is data
  const slots: Slot[] = rows.slice(3).map((row, i) => ({
    game: row[0] || "",
    time: row[1] || "",
    role: row[2] || "",
    volunteer: row[3] || "",
    rowIndex: i + 4, // 1-indexed: skip info row, blank row, header
  }));

  if (slots.length === 0) return null;

  // Group by game
  const gameMap = new Map<string, Slot[]>();
  for (const slot of slots) {
    const key = `${slot.game}|${slot.time}`;
    if (!gameMap.has(key)) gameMap.set(key, []);
    gameMap.get(key)!.push(slot);
  }

  const games: GameData[] = Array.from(gameMap.entries()).map(
    ([key, gameSlots]) => ({
      game: key.split("|")[0],
      time: key.split("|")[1],
      slots: gameSlots,
    })
  );

  return { name: sheetName, date, location, games };
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
    range: `'${sheetName}'!D${rowIndex}`,
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
    range: `'${sheetName}'!D${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[""]],
    },
  });
}

/**
 * Append a volunteer to a helper signup sheet tab.
 * Creates the tab with headers if it doesn't exist.
 * Columns: Name | Mobile | Email | Date
 */
export async function appendVolunteer(
  sheetName: string,
  data: { name: string; mobile: string; email: string }
): Promise<void> {
  const sheets = getSheets();

  // Ensure the tab exists, create with headers if not
  const tabs = await getSheetTabs();
  if (!tabs.includes(sheetName)) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: sheetName } } }],
      },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${sheetName}'!A1:D1`,
      valueInputOption: "RAW",
      requestBody: { values: [["Name", "Mobile", "Email", "Date"]] },
    });
  }

  const date = new Date().toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${sheetName}'!A:D`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[data.name, data.mobile, data.email, date]],
    },
  });
}
