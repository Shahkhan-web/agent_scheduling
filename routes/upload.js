const express = require("express");
const multer = require("multer");
const request = require("request");
const { v4: uuidv4 } = require("uuid");

const csv = require("csv-parser");

const { use_db } = require("../config/db_pool");
const fs = require("fs");
const router = express.Router();
const upload = multer({ dest: "tmp/csv/" }); // Destination folder for temporary file storage

router.route("/").post(upload.single("file"), async (req, res) => {
  console.log("uploading...");
  const filePath = req.file?.path;
  if (!filePath || filePath === undefined) {
    res.status(400).json({ error: "file not attached" });
    return;
  }
  const formData = {
    file: fs.createReadStream(filePath), // Assuming you have required 'fs' module
  };

  async function generateNumber() {
    const id = Math.floor(Math.random() * 10000) + 1;
    let id_exists;
    const checkId = await use_db(
      `select array_id from branches where array_id = ${id}`
    );
    checkId.rows[0]?.id ? (id_exists = true) : (id_exists = false);
    if (id_exists) {
      await generateNumber();
    } else {
      return id;
    }
  }
  async function insertDataIntoDB(data) {
    try {
      data = JSON.parse(data);
      const currentTimestamp = new Date().toISOString();

      for (let i = 0; i < data.length; i++) {
        const id = await generateNumber();
        const array = data[i];
        for (const item of array) {
          const {
            branch,
            city,
            duration,
            frequency,
            google_link,
            lat,
            long,
            name,
            project,
          } = item;
          const sqlQuery = `INSERT INTO branches (array_id, branch, city, duration, frequency, google_link, lat, lng, name, project,created_at)
              VALUES ( 
              ${id},'${branch}','${city}',${duration},'${frequency}','${google_link}',${lat},${long},'${name}','${project}','${currentTimestamp}')`;
          await use_db(sqlQuery);
          if (data[i].waypoints) {
            const waypoints = data[i].waypoints;
            use_db(
              `insert into waypoints (waypoints,id) values ('${waypoints}',${id})`
            );
          }
        }
      }
      res
        .status(200)
        .json({ sucess: "Data inserted successfully into the database." });
      return;
    } catch (error) {
      res.status(200).json({
        message: "Error inserting data into the database:",
        error: error,
      });
    }
  }
  let length = 0;
  // Process CSV file
  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", async (data) => {
      length++;
      const sqlQuery = `
      INSERT INTO masterlist_branches (
          project,
          branch,
          city,
          google_link,
          lat,
          long,
          frequency,
          duration
      ) VALUES (
              '${data.project}',
              '${data.branch}',
              '${data.city}',
              '${data.google_link}',
              '${data.lat}',
              ${data.long},
              '${data.frequency}',
              ${data.duration}
      )
    `;
      use_db(sqlQuery)
        .then((data) => {}) // Call your existing use_db function here
        .catch((err) => {
          console.error("Error inserting data:");
        });
    })
    .on("end", async () => {
      // Respond with success message

      const run_algo = new Promise((resolve, reject) => {
        request.post(
          "http://13.127.3.236:9000", // Make sure to include the protocol (e.g., http://) in the URL
          { formData: formData },
          function (error, response, body) {
            if (!error && response.statusCode == 200) {
              resolve(body);
            } else {
              console.error(error);
              reject(new Error("Error occurred while uploading the file."));
            }
          }
        );
      });

      try {
        const result = await run_algo;
        // Process the response as needed
        await insertDataIntoDB(result);
        const sendable = use_db(`select * from branches`);
        res.send(sendable.rows);
      } catch (error) {
        // Handle the error condition
        console.error(error);
        res.status(500).send(error.message);
      }
    });
});
module.exports = router;
