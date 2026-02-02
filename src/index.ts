import { Hono } from "hono";
import { cors } from "hono/cors";
import db from "./db";

const app = new Hono();

const defaultStats = JSON.stringify({
    completedHabits: 0,
    totalHabits: 0,
    journalHistoryLength: 0,
    khatamProgress: 0,
    khatamLevel: 0,
    todayPages: 0,
    todayVerses: 0,
    lastUpdated: null,
    dailyHabits: [],
    todayJournal: {
        mood: "",
        goal: "",
        gratitude: "",
    },
    moodDistribution: {
        happy: 0,
        grateful: 0,
        calm: 0,
        sad: 0,
        stressed: 0,
    },
    weeklyCompletions: {},
});

app.use("/*", cors());

// Root route
app.get("/", (c) => {
    return c.json({
        message: "User API is running",
        endpoints: {
            list_users: "/users",
            get_user: "/users/:id",
            create_user: "/users (POST)",
            update_user: "/users/:id (PUT)",
            delete_user: "/users/:id (DELETE)",
            prayer_times: "/prayer-times",
            quran: "/quran"
        }
    });
});

// Prayer Times Proxy (Lumajang)
app.get("/prayer-times", async (c) => {
    try {
        // Lumajang ID: 38db3aed920cf82ab059bfccbd02be6a
        const response = await fetch(`https://api.myquran.com/v3/sholat/jadwal/38db3aed920cf82ab059bfccbd02be6a/today?tz=Asia/Jakarta`);
        const data = await response.json();
        return c.json(data);
    } catch (error) {
        return c.json({ status: false, message: "Failed to fetch prayer times" }, 500);
    }
});

// Quran Proxy
app.get("/quran", async (c) => {
    try {
        const response = await fetch(`https://api.myquran.com/v3/quran`);
        const data = await response.json();
        return c.json(data);
    } catch (error) {
        return c.json({ status: false, message: "Failed to fetch Quran data" }, 500);
    }
});

app.get("/quran/:number", async (c) => {
    const number = c.req.param('number');
    try {
        const response = await fetch(`https://api.myquran.com/v3/quran/${number}`);
        const data = await response.json();
        return c.json(data);
    } catch (error) {
        return c.json({ status: false, message: "Failed to fetch Surah detail" }, 500);
    }
});

// List users
app.get("/users", (c) => {
    const users = db.query("SELECT * FROM users").all();
    return c.json({ data: users });
});

// Get user by ID
app.get("/users/:id", (c) => {
    const id = c.req.param("id");
    const user = db.query("SELECT * FROM users WHERE id = ?").get(id);
    if (!user) {
        return c.json({ message: "User not found" }, 404);
    }
    return c.json({ data: user });
});

// Create user
app.post("/users", async (c) => {
    try {
        const { nama, jenis_kelamin, username, password, stats } = await c.req.json();
        const statsValue = typeof stats === "string" && stats.length ? stats : defaultStats;
        if (!nama || !jenis_kelamin || !username || !password) {
            return c.json({ message: "Nama, jenis_kelamin, username, and password are required" }, 400);
        }
        const result = db.query("INSERT INTO users (nama, jenis_kelamin, username, password, stats) VALUES (?, ?, ?, ?, ?) RETURNING id").get(nama, jenis_kelamin, username, password, statsValue) as { id: number };
        return c.json({ message: "User created", data: { id: result.id, nama, jenis_kelamin, username } }, 201);
    } catch (error: any) {
        if (error.message && error.message.includes("UNIQUE constraint failed")) {
            return c.json({ message: "Username already exists" }, 400);
        }
        return c.json({ message: "Invalid request payload or database error" }, 400);
    }
});

// Login
app.post("/login", async (c) => {
    try {
        const { username, password } = await c.req.json();
        const user = db.query("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);
        if (!user) {
            return c.json({ message: "Invalid username or password" }, 401);
        }
        return c.json({ message: "Login successful", data: user });
    } catch (error) {
        return c.json({ message: "Invalid request payload" }, 400);
    }
});

// Update user
app.put("/users/:id", async (c) => {
    const id = c.req.param("id");
    try {
        const { nama, jenis_kelamin, stats } = await c.req.json();
        const user = db.query("SELECT * FROM users WHERE id = ?").get(id);
        if (!user) {
            return c.json({ message: "User not found" }, 404);
        }

        db.query("UPDATE users SET nama = ?, jenis_kelamin = ?, stats = ? WHERE id = ?").run(
            nama || (user as any).nama,
            jenis_kelamin || (user as any).jenis_kelamin,
            stats !== undefined ? stats : (user as any).stats,
            id
        );

        return c.json({ message: "User updated" });
    } catch (error) {
        return c.json({ message: "Invalid request payload" }, 400);
    }
});

// Delete user
app.delete("/users/:id", (c) => {
    const id = c.req.param("id");
    const user = db.query("SELECT * FROM users WHERE id = ?").get(id);
    if (!user) {
        return c.json({ message: "User not found" }, 404);
    }

    db.query("DELETE FROM users WHERE id = ?").run(id);
    return c.json({ message: "User deleted" });
});

export default {
    port: 3000,
    fetch: app.fetch,
};
