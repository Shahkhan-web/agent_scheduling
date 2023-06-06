const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");

const bodyParser = require("body-parser");
const corsOptions = require("./config/corsOptions");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const credentials = require("./middleware/credentials");
 
const PORT = process.env.PORT || 8000;

// create application/json parser
var jsonParser = bodyParser.json({ limit: "50mb" });

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({
  limit: "5mb",
  parameterLimit: 100000,
  extended: false,
});

// dot env files
dotenv.config();

app.set("trust proxy", 1);
// custom middleware logger
app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

app.use(jsonParser);
app.use(urlencodedParser);

//middleware for cookies
app.use(cookieParser());

//serve static files
app.use("/", express.static(path.join(__dirname, "/public")));

app.use("/upload/masterlist", require("./routes/upload")); 

app.use("/list/", require("./routes/list")); 

// routes
app.use("/", require("./routes/root"));

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));