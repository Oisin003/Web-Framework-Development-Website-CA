import mysql from 'mysql2/promise';

// Database connection settings 
const DB_HOST = process.env.DB_HOST || 'localhost'; // Default to localhost
const DB_PORT = Number(process.env.DB_PORT) || 3306; // Default MySQL port
const DB_USER = process.env.DB_USER || 'root'; // Default to the root user
const DB_PASSWORD = process.env.DB_PASSWORD || ''; // Default to no password
const DB_NAME = process.env.DB_NAME || 'gaanfl2026'; // Default database name

// Shared MySQL connection pool for all requests.
const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// Some API resources map to a different table name in MySQL.
const RESOURCE_TABLE_MAP = {
  results: 'fixtures'
};

// Fetch all rows for one resource 
export async function fetchResourceRows(resourceName) {
  // Convert to lowercase so matching is case-insensitive.
  const baseName = resourceName.toLowerCase();

  // Special handling for "scoringstats" which is not a direct table but is pulled from the fixtures data.
  if (baseName === 'scoringstats') {
    const [fixtureRows] = await pool.query('SELECT * FROM `fixtures`');
    const rows = buildScoringStatsRows(fixtureRows);
    return { tableName: 'fixtures (aggregated)', rows };
  }

  // Special handling for "scoringstatsii" based on fixture totals by division and round.
  if (baseName === 'scoringstatsii') {
    const [fixtureRows] = await pool.query('SELECT * FROM `fixtures`');
    const rows = buildScoringStatsIIRows(fixtureRows);
    return { tableName: 'fixtures (aggregated)', rows };
  }

  // Use a single mapped table name for the resource.
  const tableName = RESOURCE_TABLE_MAP[baseName] || baseName;

  try {
    const [rows] = await pool.query(`SELECT * FROM \`${tableName}\``);
    return { tableName, rows };
  } catch (error) {
    if (error.code !== 'ER_NO_SUCH_TABLE') {
      throw error;
    }
  }

  // Throw an error when the table is not found.
  const err = new Error(`No table found for ${resourceName}`);
  err.statusCode = 404;
  throw err;
}

// Expose DB target details for startup logging.
export function getDatabaseTarget() {
  return {
    host: DB_HOST,
    port: DB_PORT,
    name: DB_NAME
  };
}

// Check if a user exists with the given email and password.
export async function validateUserCredentials(email, password) {
  const cleanEmail = typeof email === 'string' ? email.trim() : '';
  const cleanPassword = typeof password === 'string' ? password : '';

  if (!cleanEmail || !cleanPassword) {
    const err = new Error('Email and password are required');
    err.statusCode = 400;
    throw err;
  }

  const [rows] = await pool.query(
    'SELECT id, email FROM `users` WHERE `email` = ? AND `password` = ? LIMIT 1',
    [cleanEmail, cleanPassword]
  );

  if (!rows.length) {
    return null;
  }

  return rows[0];
}

// Save vote totals to teams.powerrank for all teams in one transaction.
export async function saveTeamVoteRanks(voteRanks) {
  if (!voteRanks || typeof voteRanks !== 'object' || Array.isArray(voteRanks)) {
    const err = new Error('voteRanks must be an object with team names as keys');
    err.statusCode = 400;
    throw err;
  }

  // Convert all vote values to safe whole numbers.
  const normalizedRanks = {};
  let totalVotes = 0;

  for (const [teamName, value] of Object.entries(voteRanks)) {
    const parsed = Number(value);
    let rank = 0;

    if (Number.isFinite(parsed) && parsed >= 0) {
      rank = Math.floor(parsed);
    }

    normalizedRanks[teamName] = rank;
    totalVotes += rank;
  }

  const teamsToUpdate = Object.entries(normalizedRanks);

  // Clear old ranks in the teams table.
  await pool.query('UPDATE `teams` SET `powerrank` = 0');

  // Save each team's new rank.
  for (const [teamName, rank] of teamsToUpdate) {
    await pool.query('UPDATE `teams` SET `powerrank` = ? WHERE `name` = ?', [rank, teamName]);
  }

  return {
    updatedTeams: teamsToUpdate.length,
    totalVotes
  };
}

// Update one fixture/result row using score strings in the format goals-twoPts-onePts.
export async function updateResultScore(resultId, homeScore, awayScore) {
  const id = Number(resultId);

  if (!Number.isInteger(id) || id <= 0) {
    // Validate that the id is a positive integer.
    const err = new Error('Result id must be a positive integer');
    err.statusCode = 400;
    throw err;
  }

  const parsedHome = parseScoreString(homeScore, 'homeScore');
  const parsedAway = parseScoreString(awayScore, 'awayScore');

  const [result] = await pool.query(
    `UPDATE \`fixtures\`
     SET
       \`hteamscore\` = ?,
       \`ateamscore\` = ?,
       \`hgls\` = ?,
       \`h2pts\` = ?,
       \`h1pts\` = ?,
       \`hteamtotal\` = ?,
       \`agls\` = ?,
       \`a2pts\` = ?,
       \`a1pts\` = ?,
       \`ateamtotal\` = ?
     WHERE \`id\` = ?`,
    [
      parsedHome.normalized,
      parsedAway.normalized,
      parsedHome.goals,
      parsedHome.twoPts,
      parsedHome.onePts,
      parsedHome.total,
      parsedAway.goals,
      parsedAway.twoPts,
      parsedAway.onePts,
      parsedAway.total,
      id
    ]
  );

  if (!result.affectedRows) {
    const err = new Error(`No result found for id ${id}`);
    err.statusCode = 404;
    throw err;
  }

  return {
    id,
    hteamscore: parsedHome.normalized,
    ateamscore: parsedAway.normalized,
    hteamtotal: parsedHome.total,
    ateamtotal: parsedAway.total
  };
}

// Parse and normalize score input like "2-1-16".
function parseScoreString(score, fieldName) {
  if (typeof score !== 'string') {
    const err = new Error(`${fieldName} must be a string in format goals-twoPts-onePts`);
    err.statusCode = 400;
    throw err;
  }

  const trimmed = score.trim();
  const parts = trimmed.split('-');

  if (parts.length !== 3) {
    const err = new Error(`${fieldName} must use format goals-twoPts-onePts, e.g. 2-1-16`);
    err.statusCode = 400;
    throw err;
  }

  const goals = Number(parts[0]);
  const twoPts = Number(parts[1]);
  const onePts = Number(parts[2]);

  if (!Number.isInteger(goals) || !Number.isInteger(twoPts) || !Number.isInteger(onePts)
    || goals < 0 || twoPts < 0 || onePts < 0) {
    const err = new Error(`${fieldName} must use only whole numbers, e.g. 2-1-16`);
    err.statusCode = 400;
    throw err;
  }

  const total = goals * 3 + twoPts * 2 + onePts;

  return {
    goals,
    twoPts,
    onePts,
    total,
    normalized: `${goals}-${twoPts}-${onePts}`
  };
}

// Builds the scoring stats rows by aggregating data from all fixtures, calculating averages per match for each team, and sorting by total points then team name.
function buildScoringStatsRows(fixtures) {
  // Add each fixture result to a running totals map.
  const teamStatsMap = new Map();

  for (const fixture of fixtures) {
    // Add home team stats.
    addTeamStats(teamStatsMap, fixture.division, fixture.hteam, fixture.hteamtotal, fixture.hgls, fixture.h2pts, fixture.h1pts);

    // Add away team stats.
    addTeamStats(teamStatsMap, fixture.division, fixture.ateam, fixture.ateamtotal, fixture.agls, fixture.a2pts, fixture.a1pts);
  }

  // Convert totals map into output rows.
  const rows = [];

  for (const entry of teamStatsMap.values()) {
    rows.push({
      division: entry.division,
      team: entry.team,
      matches: entry.matches,
      total: roundOneDecimal(entry.totalSum / entry.matches),
      goals: roundOneDecimal(entry.goalsSum / entry.matches),
      twoPts: roundOneDecimal(entry.twoPtsSum / entry.matches),
      onePts: roundOneDecimal(entry.onePtsSum / entry.matches)
    });
  }

  // Sort by total (high to low), then by team name.
  rows.sort((a, b) => {
    if (b.total !== a.total) {
      return b.total - a.total;
    }

    return a.team.localeCompare(b.team);
  });

  return rows;
}

// Adds one fixture result to a team's running totals.
function addTeamStats(teamStatsMap, division, team, teamTotal, goals, twoPts, onePts) {
  const total = Number(teamTotal) || 0;
  const gls = Number(goals) || 0;
  const twos = Number(twoPts) || 0;
  const ones = Number(onePts) || 0;

  // Ignore unplayed fixtures where all scoring values are zero.
  if (total === 0 && gls === 0 && twos === 0 && ones === 0) {
    return;
  }
  // This key uniquely identifies a team within a division.
  const key = `${division}|${team}`;
  // Get existing totals for this team, or create a new totals object.
  const entry = teamStatsMap.get(key) || {
    division,
    team,
    matches: 0,
    totalSum: 0,
    goalsSum: 0,
    twoPtsSum: 0,
    onePtsSum: 0
  };
  // Update totals with fixture results.
  entry.matches += 1;
  entry.totalSum += total;
  entry.goalsSum += gls;
  entry.twoPtsSum += twos;
  entry.onePtsSum += ones;

  teamStatsMap.set(key, entry);
}
// Helper function to round to one decimal place for the scoring stats averages.
function roundOneDecimal(value) {
  return Math.round(value * 10) / 10;
}

// Builds the scoring stats II rows by averaging team totals per division for rounds 1-5.
function buildScoringStatsIIRows(fixtures) {
  // Define the rounds to report.
  const trackedRounds = [1, 2, 3, 4, 5];

  // Keep running totals for each division+round pair.
  const divisionRoundTotals = new Map();

  // Read each fixture and add totals.
  for (const fixture of fixtures) {
    const division = Number(fixture.division) || 0;
    const round = Number(fixture.round) || 0;

    if (!division || !trackedRounds.includes(round)) {
      continue;
    }

    // Each fixture has a home total and an away total.
    const homeTotal = Number(fixture.hteamtotal) || 0;
    const awayTotal = Number(fixture.ateamtotal) || 0;

    // Skip unplayed fixtures.
    if (homeTotal === 0 && awayTotal === 0) {
      continue;
    }

    const key = `${division}|${round}`;
    const entry = divisionRoundTotals.get(key) || { totalSum: 0, teamCount: 0 };

    if (homeTotal > 0) {
      entry.totalSum += homeTotal;
      entry.teamCount += 1;
    }

    if (awayTotal > 0) {
      entry.totalSum += awayTotal;
      entry.teamCount += 1;
    }

    divisionRoundTotals.set(key, entry);
  }

  // Build a unique, sorted list of divisions.
  const divisionSet = new Set();

  for (const fixture of fixtures) {
    const division = Number(fixture.division) || 0;
    if (division > 0) {
      divisionSet.add(division);
    }
  }

  const divisions = Array.from(divisionSet).sort((a, b) => a - b);

  // Create one output row per division.
  const outputRows = [];

  for (const division of divisions) {
    const row = { division };

    for (const round of trackedRounds) {
      const key = `${division}|${round}`;
      const entry = divisionRoundTotals.get(key);

      let value = 0;
      if (entry && entry.teamCount > 0) {
        value = roundOneDecimal(entry.totalSum / entry.teamCount);
      }

      row[`round${round}`] = value;
    }

    outputRows.push(row);
  }

  return outputRows;
}
