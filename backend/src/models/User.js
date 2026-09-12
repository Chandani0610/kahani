const db = require("../config/db");
const { promisify } = require("util");
const bcrypt = require("bcryptjs");

const query = promisify(db.query).bind(db);

class UserModel {
  // ==========================================
  // Create User
  // ==========================================
  static async create(userData) {
    const {
      name,
      email,
      password,
      phone,
      role = "user",
      status = "active",
    } = userData;

    const sql = `
      INSERT INTO users
      (name, email, password, phone, role, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      name,
      email,
      password,
      phone,
      role,
      status,
    ]);

    return result.insertId;
  }

  // ==========================================
  // Find User by Email
  // ==========================================
  static async findByEmail(email) {
    const sql = "SELECT * FROM users WHERE email = ?";
    const rows = await query(sql, [email]);
    return rows[0];
  }

  // ==========================================
  // Find User by ID
  // Includes password for password updates
  // ==========================================
  static async findById(id) {
    const sql = `
      SELECT
        id,
        name,
        email,
        password,
        phone,
        profile_image,
        role,
        status,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
    `;

    const rows = await query(sql, [id]);
    return rows[0];
  }

  // ==========================================
  // Find Users by Role
  // ==========================================
  static async findByRole(role) {
    const sql = `
      SELECT
        id,
        name,
        email,
        phone,
        profile_image,
        role,
        status,
        created_at,
        updated_at
      FROM users
      WHERE role = ?
    `;

    return await query(sql, [role]);
  }

  // ==========================================
  // Get All Users
  // ==========================================
  static async findAll() {
    const sql = `
      SELECT
        id,
        name,
        email,
        phone,
        profile_image,
        role,
        status,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC
    `;

    return await query(sql);
  }

  // ==========================================
  // Update User
  // ==========================================
  static async update(id, userData) {
    const { name, email, phone, role, status, profile_image } = userData;

    let sql = `
      UPDATE users
      SET
        name=?,
        email=?,
        phone=?,
        role=?,
        status=?
    `;
    const params = [name, email, phone, role, status];

    if (profile_image !== undefined) {
      sql += `, profile_image=?`;
      params.push(profile_image);
    }

    sql += ` WHERE id=?`;
    params.push(id);

    const result = await query(sql, params);
    return result.affectedRows > 0;
  }

  // ==========================================
  // Update Password
  // ==========================================
  static async updatePassword(id, hashedPassword) {
    const sql = `
      UPDATE users
      SET password=?
      WHERE id=?
    `;

    const result = await query(sql, [hashedPassword, id]);

    return result.affectedRows > 0;
  }

  // ==========================================
  // Delete User
  // ==========================================
  static async delete(id) {
    const sql = "DELETE FROM users WHERE id=?";

    const result = await query(sql, [id]);

    return result.affectedRows > 0;
  }

  // ==========================================
  // Dashboard Stats
  // ==========================================
  static async getStats() {
    const sql = `
      SELECT
        COUNT(*) AS totalUsers,
        SUM(CASE WHEN role='admin' THEN 1 ELSE 0 END) AS admins,
        SUM(CASE WHEN role='user' THEN 1 ELSE 0 END) AS users,
        SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS activeUsers,
        SUM(CASE WHEN status='inactive' THEN 1 ELSE 0 END) AS inactiveUsers
      FROM users
    `;

    const rows = await query(sql);

    return rows[0];
  }

  // ==========================================
  // Create Default Admin
  // ==========================================
  static async initializeAdmin() {
    const adminEmail = "admin@kahaniland.com";
    const adminPassword = "Admin@123";

    const existing = await this.findByEmail(adminEmail);

    if (!existing) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await this.create({
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        phone: "8888888888",
        role: "admin",
        status: "active",
      });

      console.log("====================================");
      console.log("✅ Default Admin Created");
      console.log("Email    :", adminEmail);
      console.log("Password :", adminPassword);
      console.log("====================================");
    }
  }
}

module.exports = UserModel;