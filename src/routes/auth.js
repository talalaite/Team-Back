const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const { mysqlConfig, jwtSecret } = require("../config");

router.post("/register", async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send({ err: "Insufficient data provided" });
  }

  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);

    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(
      `INSERT INTO users (email, password) VALUES (${mysql.escape(
        req.body.email
      )}, '${hashedPassword}')`
    );
    con.end();

    if (data.affectedRows !== 1) {
      return res.status(500).send({ err: "Error in DB" });
    }

    return res.send({ msg: "Successfully registered an account" });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "This email already exist" });
  }
});

router.post("/login", async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send({ error: "Insufficient data provided" });
  }

  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(
      `SELECT id, email, password FROM users WHERE email = ${mysql.escape(
        req.body.email
      )}`
    );
    con.end();

    if (data.length !== 1) {
      return res.status(400).send({ error: "Email or password is incorrect" });
    }

    const passwordValidity = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );

    if (!passwordValidity) {
      return res.status(400).send({ error: "Email or password is incorrect" });
    }

    const token = jwt.sign(
      {
        id: data[0].id,
        email: data[0].email,
      },
      jwtSecret,
      { expiresIn: 60 * 60 }
    );

    return res.send({ msg: "Successfully logged in", token });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "DB error" });
  }
});

module.exports = router;
