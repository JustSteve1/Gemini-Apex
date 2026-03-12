// lib/drivers.ts
// Driver-to-team mapping and team colours
// These are the ONLY colours used in the widget system
// Everything else is black, white, or grey

export interface DriverInfo {
  number: string;
  code: string;
  name: string;
  team: string;
  teamColour: string;
}

export const TEAM_COLOURS: Record<string, string> = {
  "Ferrari": "#E80020",
  "Red Bull Racing": "#3671C6",
  "McLaren": "#FF8000",
  "Mercedes": "#27F4D2",
  "Aston Martin": "#229971",
  "Alpine": "#FF87BC",
  "Williams": "#64C4FF",
  "RB": "#6692FF",
  "Kick Sauber": "#52E252",
  "Haas": "#B6BABD",
};

// 2026 grid — update as needed
export const DRIVERS: Record<string, DriverInfo> = {
  "1":  { number: "1",  code: "VER", name: "Max Verstappen",    team: "Red Bull Racing", teamColour: TEAM_COLOURS["Red Bull Racing"] },
  "44": { number: "44", code: "HAM", name: "Lewis Hamilton",    team: "Ferrari",         teamColour: TEAM_COLOURS["Ferrari"] },
  "16": { number: "16", code: "LEC", name: "Charles Leclerc",   team: "Ferrari",         teamColour: TEAM_COLOURS["Ferrari"] },
  "4":  { number: "4",  code: "NOR", name: "Lando Norris",      team: "McLaren",         teamColour: TEAM_COLOURS["McLaren"] },
  "81": { number: "81", code: "PIA", name: "Oscar Piastri",     team: "McLaren",         teamColour: TEAM_COLOURS["McLaren"] },
  "63": { number: "63", code: "RUS", name: "George Russell",    team: "Mercedes",        teamColour: TEAM_COLOURS["Mercedes"] },
  "12": { number: "12", code: "ANT", name: "Andrea Kimi Antonelli", team: "Mercedes",    teamColour: TEAM_COLOURS["Mercedes"] },
  "14": { number: "14", code: "ALO", name: "Fernando Alonso",   team: "Aston Martin",    teamColour: TEAM_COLOURS["Aston Martin"] },
  "18": { number: "18", code: "STR", name: "Lance Stroll",      team: "Aston Martin",    teamColour: TEAM_COLOURS["Aston Martin"] },
  "10": { number: "10", code: "GAS", name: "Pierre Gasly",      team: "Alpine",          teamColour: TEAM_COLOURS["Alpine"] },
  "7":  { number: "7",  code: "DOO", name: "Jack Doohan",       team: "Alpine",          teamColour: TEAM_COLOURS["Alpine"] },
  "23": { number: "23", code: "ALB", name: "Alexander Albon",   team: "Williams",        teamColour: TEAM_COLOURS["Williams"] },
  "55": { number: "55", code: "SAI", name: "Carlos Sainz",      team: "Williams",        teamColour: TEAM_COLOURS["Williams"] },
  "22": { number: "22", code: "TSU", name: "Yuki Tsunoda",      team: "RB",              teamColour: TEAM_COLOURS["RB"] },
  "30": { number: "30", code: "LAW", name: "Liam Lawson",       team: "Red Bull Racing", teamColour: TEAM_COLOURS["Red Bull Racing"] },
  "27": { number: "27", code: "HUL", name: "Nico Hulkenberg",   team: "Kick Sauber",     teamColour: TEAM_COLOURS["Kick Sauber"] },
  "5":  { number: "5",  code: "BOR", name: "Gabriel Bortoleto", team: "Kick Sauber",     teamColour: TEAM_COLOURS["Kick Sauber"] },
  "87": { number: "87", code: "BEA", name: "Oliver Bearman",    team: "Haas",            teamColour: TEAM_COLOURS["Haas"] },
  "31": { number: "31", code: "OCO", name: "Esteban Ocon",      team: "Haas",            teamColour: TEAM_COLOURS["Haas"] },
};

export function getDriver(numberOrCode: string): DriverInfo | undefined {
  // Try by number first
  if (DRIVERS[numberOrCode]) return DRIVERS[numberOrCode];
  // Then by code
  return Object.values(DRIVERS).find(
    (d) => d.code.toUpperCase() === numberOrCode.toUpperCase()
  );
}

export function getTeamColour(driverNumber: string): string {
  return DRIVERS[driverNumber]?.teamColour || "#888888";
}
