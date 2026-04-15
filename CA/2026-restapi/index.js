import express from 'express';
import cors from 'cors';
import {
    fetchResourceRows,
    getDatabaseTarget,
    saveTeamVoteRanks,
    updateResultScore,
    validateUserCredentials
} from './db.js';

const app = express();

const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

// Used to fetch rows from the database for a given resource, with error handling and flexible table name resolution.
async function resourceHandler(req, res, resourceName) {
    try {// Attempt to fetch rows for the requested resource - This may involve trying multiple table name variations.
        const { tableName, rows } = await fetchResourceRows(resourceName);
        // Return the data along with the table name
        return res.json({ resource: resourceName, table: tableName, count: rows.length, data: rows });
    } catch (error) {// Error message if something breaks :)
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: error.message,
            resource: resourceName
        });
    }
}
// Routes to each of the main resources
app.get('/', (req, res) => {
    res.json({
        message: '2026 REST API is running',
        endpoints: [
            '/api/teams',
            '/api/players',
            '/api/managers',
            '/api/fixtures',
            '/api/results',
            '/api/teamrankings',
            '/api/scoringstats',
            '/api/scoringstatsII',
            '/api/scoringcharts'
        ]
    });
});

// Get the teams page
app.get('/api/teams', (req, res) => resourceHandler(req, res, 'teams'));

// Login endpoint: checks users table for matching email and password.
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};
        const user = await validateUserCredentials(email, password);

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        return res.json({
            message: 'Login successful',
            user
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: error.message || 'Login failed'
        });
    }
});
// Get the players page
app.get('/api/players', (req, res) => resourceHandler(req, res, 'players'));
// Get the managers page
app.get('/api/managers', (req, res) => resourceHandler(req, res, 'managers'));
// Get the fixtures page
app.get('/api/fixtures', (req, res) => resourceHandler(req, res, 'fixtures'));
// Get the results page
app.get('/api/results', (req, res) => resourceHandler(req, res, 'results'));

// Update one result score row.
app.put('/api/results/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { hteam, hteamscore, ateam, ateamscore } = req.body || {};
        const updated = await updateResultScore(id, hteamscore, ateamscore, hteam, ateam);

        return res.json({
            message: 'Result updated',
            data: updated
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: error.message || 'Failed to update result'
        });
    }
});
// Get the team rankings page
app.get('/api/teamrankings', (req, res) => resourceHandler(req, res, 'teamrankings'));
// Get the scoring stats page
app.get('/api/scoringstats', (req, res) => resourceHandler(req, res, 'scoringstats'));
// Get the scoring stats II page
app.get('/api/scoringstatsII', (req, res) => resourceHandler(req, res, 'scoringstatsII'));
// Get the scoring charts page
app.get('/api/scoringcharts', (req, res) => resourceHandler(req, res, 'scoringcharts'));

// Save vote totals as team power rankings.
app.post('/api/teamrankings/votes', async (req, res) => {
    try {
        const { voteRanks } = req.body || {};
        const result = await saveTeamVoteRanks(voteRanks);
        return res.json({
            message: 'Team rankings saved',
            ...result
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: error.message || 'Failed to save team rankings'
        });
    }
});

// Start the server and log the DB target details for verification.
app.listen(PORT, () => {
    const dbTarget = getDatabaseTarget();
    console.log(` The server running on http://localhost:${PORT}`);
    console.log(`MySQL target: ${dbTarget.host}:${dbTarget.port}/${dbTarget.name}`);
});