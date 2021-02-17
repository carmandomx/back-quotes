import express from "express";
import db from "mongoose";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import { dirname } from "path";

const { Schema } = db;
const uri =
  "mongodb+srv://prof-quotes:1234@cluster0.7metr.mongodb.net/test?retryWrites=true&w=majority";
const connection = db.connect(uri, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
app.use(cors());
app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api/", limiter);
const quoteSchema = new Schema({
  quote: String,
  class: String,
});
app.listen(process.env.PORT || 5000, () => {
  console.log("Mi server funciona");
});

app.use(express.json());

app.use(express.static(`${__dirname}public`));
const Quote = db.model("quote", quoteSchema, "quotes");
// const db = client.db("test");
// const quotesCollection = db.collection("quotes");
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.delete("/api/quotes/:id", (req, res) => {
  const id = req.params.id;
  Quote.findByIdAndDelete(id).then((result) => {
    console.log(result);
    res.status(204).send();
  });
});

app.get("/api/quotes", (req, res) => {
  Quote.find((err, docs) => {
    res.status(200).json({
      count: docs.length,
      quotes: docs,
    });
  });
});

app.post("/api/quotes", (req, res) => {
  console.log(req.body);
  const newQuote = new Quote(req.body);

  newQuote.save().then((doc) => {
    res.status(201).json(doc);
  });
});

app.put("/api/quotes/:id", (req, res) => {
  const id = req.params.id;
  Quote.findByIdAndUpdate(id, req.body, { new: true }).then((result) => {
    res.status(200).json(result);
  });
});

app.get("/api/quotes/options", (req, res) => {
  res.status(200).json({
    classOptions: new Array(18)
      .fill(null)
      .map((_, index) => `class ${index + 1}`),
  });
});
