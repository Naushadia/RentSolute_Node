const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bodyParser = require("body-parser");

const db = require("./models");
const authRouter = require("./routers/authRouter");
const amenityRouter = require("./routers/amenity");
const propertyRouter = require("./routers/property");
const questionRouter = require("./routers/question");
const cors = require("cors");
dotenv.config("./.env");

const app = express();
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("common"));

app.use(express.static(path.join(__dirname, "uploads")));
app.use(authRouter);
app.use(amenityRouter);
app.use(propertyRouter);
app.use(questionRouter);

app.get("/", (req, res) => {
  res.status(200).send("OK from Server");
});

const PORT = process.env.PORT;

app.listen(PORT);
