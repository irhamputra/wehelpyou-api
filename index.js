const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const faker = require("faker/locale/de");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json");
const db = low(adapter);
const app = express();

const database = require("./db.json");

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send(
    "<h1 style='font-family: Avenir, sans-serif'>Welcome to WeHelpYou API</h1>"
  );
});

app.get("/users", (req, res) => {
  if ("users" in database) {
    return res.status(200).json(database.users.flat(Infinity));
  }

  db.defaults({ users: [] }).write();

  const generator = (schema, min = 1, max) => {
    max = max || min;
    return Array.from({ length: faker.random.number({ min, max }) }).map(() =>
      Object.keys(schema).reduce((entity, key) => {
        entity[key] = faker.fake(schema[key]);
        return entity;
      }, {})
    );
  };

  const clientsSchema = {
    id: "{{random.uuid}}",
    name: "{{name.firstName}} {{name.lastName}}",
    address: "{{address.cityPrefix}} {{address.citySuffix}}",
    state: "{{address.state}}",
    phone: "{{phone.phoneNumber}}",
    imageUrl: "{{image.people}}",
    email: "{{internet.email}}",
  };

  const data = generator(clientsSchema, 40, 40).flat(Infinity);

  db.get("users").push(data).write();

  return res.status(200).json(data);
});

app.post("/register", (req, res) => {
  try {
    const newUser = req.body;

    const data = [newUser, ...database];

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({
      err: e.message,
    });
  }
});

app.listen(8080, () => console.log("Running"));
