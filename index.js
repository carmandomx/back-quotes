import express from "express";
import Mongod from "mongodb";
import { fileURLToPath } from "url";
import { dirname } from "path";

const dbclient = Mongod.MongoClient;
const uri =
  "mongodb+srv://prof-quotes:1234@cluster0.7metr.mongodb.net/test?retryWrites=true&w=majority";
const connection = new dbclient(uri, { useUnifiedTopology: true });
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

app.listen(process.env.PORT || 3000, () => {
  console.log();
});

app.use(express.json());

connection.connect().then((client) => {
  const db = client.db("test");
  const quotesCollection = db.collection("quotes");
  app.post("/quotes", (req, res) => {
    let payload;
    const body = req.body;
    console.log(body);
    if (body.quote && body.class) {
      quotesCollection.insertOne(req.body).then((result) => {
        payload = result;
        res.json(payload.ops[0]);
      });
      return;
    }
    res.status(400).send({
      error: "Please put quote and class",
    });
  });

  app.get("/quotes", (req, res) => {
    let payload;

    quotesCollection
      .find()
      .toArray()
      .then((results) => {
        res.status(200).json({
          count: results.length,
          quotes: results,
        });
      });
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});
