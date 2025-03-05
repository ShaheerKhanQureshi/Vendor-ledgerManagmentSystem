import pool from "../config/database.js"
import bcrypt from "bcrypt"

export const registerUser = async (req, res) => {
  const { email, password } = req.body
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const [result] = await pool.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashedPassword])
    res.status(201).json({ message: "User created successfully", userId: result.insertId })
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error: error.message })
  }
}

export const loginUser = async (req, res) => {
  const { email, password } = req.body
  try {
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email])
    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" })
    }
    const user = users[0]
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" })
    }
    res.status(200).json({ message: "Login successful", userId: user.id })
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message })
  }
}

export const updateUser = async (req, res) => {
  const { id } = req.params
  const { email, password } = req.body
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    await pool.query("UPDATE users SET email = ?, password = ? WHERE id = ?", [email, hashedPassword, id])
    res.status(200).json({ message: "User updated successfully" })
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error: error.message })
  }
}

export const deleteUser = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query("DELETE FROM users WHERE id = ?", [id])
    res.status(200).json({ message: "User deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message })
  }
}

export const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query("SELECT * FROM users")
    res.status(200).json({ users })
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message })
  }
}