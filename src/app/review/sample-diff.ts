/** An example pull request with two planted bugs, for trying the reviewer out. */
export const SAMPLE_DIFF = `diff --git a/src/routes/users.ts b/src/routes/users.ts
index 4f2a1c9..9b7e3d2 100644
--- a/src/routes/users.ts
+++ b/src/routes/users.ts
@@ -1,18 +1,27 @@
 import { Router } from "express";
 import { db } from "../db";

 const router = Router();
+const PAGE_SIZE = 20;

-router.get("/users", async (_req, res) => {
-  const users = await db.query("SELECT id, name FROM users ORDER BY id");
-  res.json(users.rows);
+router.get("/users", async (req, res) => {
+  const page = Number(req.query.page ?? 1);
+  const offset = page * PAGE_SIZE;
+  const users = await db.query(
+    "SELECT id, name FROM users ORDER BY id LIMIT $1 OFFSET $2",
+    [PAGE_SIZE, offset],
+  );
+  res.json({ page, users: users.rows });
 });

-router.get("/users/:id", async (req, res) => {
-  const user = await db.query("SELECT id, name FROM users WHERE id = $1", [req.params.id]);
+router.get("/users/search", async (req, res) => {
+  const name = String(req.query.name ?? "");
+  const users = await db.query(
+    \`SELECT id, name, email FROM users WHERE name LIKE '%\${name}%'\`,
+  );
+  res.json(users.rows);
+});
+
+router.get("/users/:id", async (req, res) => {
+  const user = await db.query("SELECT id, name FROM users WHERE id = $1", [req.params.id]);
   if (user.rows.length === 0) return res.status(404).json({ error: "Not found" });
   res.json(user.rows[0]);
 });
diff --git a/package-lock.json b/package-lock.json
index 1a2b3c4..5d6e7f8 100644
--- a/package-lock.json
+++ b/package-lock.json
@@ -1,6 +1,6 @@
 {
   "name": "api",
-  "version": "1.3.0",
+  "version": "1.4.0",
   "lockfileVersion": 3,
`;
