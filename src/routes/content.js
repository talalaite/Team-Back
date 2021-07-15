const express = require("express");
const router = express.Router();
const middleware = require("../middleware");
const mysql = require("mysql2/promise");
const { mysqlConfig } = require("../config");

router.post("/teams/add/:id", middleware.loggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(
      `
      UPDATE teams 
      SET score = score +1
      WHERE id = ${req.params.id}
      `
    );

    con.end();

    return res.send({ msg: "Successfully voted" });
  } catch (e) {
    return res.status(500).send({ error: "Database error." });
  }
});

router.post("/teams/remove/:id", middleware.loggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(
      `
      UPDATE teams 
      SET score = score -1
      WHERE id = ${req.params.id}
      `
    );

    con.end();

    return res.send({ msg: "Successfully voted" });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ error: "Database error." });
  }
});

router.get("/teams", middleware.loggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(
      `
      SELECT * FROM teams;
      `
    );

    con.end();

    res.send(data);
  } catch (e) {
    console.log(e);
    return res.status(500).send({ error: "Database error." });
  }
});

module.exports = router;
