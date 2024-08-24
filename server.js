const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const dbpath = path.join(__dirname, "task.db");

let db = null;

const SECRET_KEY = '123';

const server = async () => {
    try {
        db = await open({
            filename: dbpath,
            driver: sqlite3.Database,
        });
        app.listen(3002, () => {
            console.log('Server started at 3002');
        });
    } catch (e) {
        console.log(e.message);
        process.exit(1);
    }
}

server();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, [username, hashedPassword, role]);
        res.status(201).send('User registered');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.get(`SELECT * FROM users WHERE username = ?`, [username]);
    if (user == null) return res.status(400).send('Cannot find user');

    if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ username: user.username, role: user.role }, SECRET_KEY);
        res.json({ token });
    } else {
        res.status(403).send('Invalid password');
    }
});

const authorizeRole = (roles) => (req, res, next) => {
    if (roles.includes(req.user.role)) {
        next();
    } else {
        res.status(403).send('Forbidden');
    }
};

app.post('/tasks', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    const { title, description, priority, status, assigned_user } = req.body;
    try {
        await db.run(`INSERT INTO tasks (title, description, priority, status, assigned_user) VALUES (?, ?, ?, ?, ?)`, [title, description, priority, status, assigned_user]);
        res.status(201).send('Task created');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.put('/tasks/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    const { id } = req.params;
    const { title, description, priority, status, assigned_user } = req.body;
    try {
        await db.run(`UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, assigned_user = ? WHERE id = ?`, [title, description, priority, status, assigned_user, id]);
        res.send('Task updated');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.delete('/tasks/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    const { id } = req.params;
    try {
        await db.run(`DELETE FROM tasks WHERE id = ?`, [id]);
        res.send('Task deleted');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/taskDetails', authenticateToken, async (req, res) => {
    const { priority, status, assigned_user } = req.query;
    let username = req.user.username;
    
    let query = `SELECT * FROM tasks WHERE assigned_user = ?`;
    const queryParams = [username];

    if (priority && priority.trim() !== '') {
        query += ` AND priority = ?`;
        queryParams.push(priority);
    }

    if (status && status.trim() !== '') {
        query += ` AND status = ?`;
        queryParams.push(status);
    }

    if (assigned_user && assigned_user.trim() !== '') {
        username = assigned_user;
        queryParams[0] = username;
    }

    try {
        const response = await db.all(query, queryParams);
        res.json(response);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


const usersList = (user) => {
    const { id, username, role } = user;
    return { id, username, role };
}

app.get('/getDetails', authenticateToken, async (req, res) => {
    const username = req.user.username;
    const query = `SELECT * FROM users;`;

    try {
        const response = await db.all(query);
        const userlist = response.map(usersList);
        res.json(userlist);
    } catch (error) {
        res.status(500).send(error.message);
    }
});
