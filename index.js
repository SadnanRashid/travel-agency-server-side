const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
app.use(cors());
const port = process.env.PORT || 4000;
app.use(express.json());
//

app.listen(port, () => {
  console.log(`Server Works !!! At port ${port}`);
});

// mongoDB:
const uri =
  "mongodb+srv://admin:12345sad@cluster0.tvyjzb3.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const servicesCol = client.db("services").collection("services");
const reviewCol = client.db("services").collection("reviews");
//

app.get("/", async (req, res) => {
  res.send("Programming-Hero Assignment11 Server Side");
});

// get all services
app.get("/services", async (req, res) => {
  const query = {};
  const cursor = servicesCol.find(query);
  const services = await cursor.toArray();
  res.send(services);
});
// get specific services
app.get("/services/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const specificService = await servicesCol.findOne(query);
  res.send(specificService);
});
// add review to database
app.post("/review", async (req, res) => {
  const { email, photo, name, rating, review, serviceID, serviceName } =
    req.body;
  console.log(serviceID);
  const result = await reviewCol.insertOne({
    email: email,
    photo: photo,
    serviceID: serviceID,
    name: name,
    rating: rating,
    review: review,
    serviceName: serviceName,
  });
  res.send(result);
});
// delete review from database
app.delete("/delete-reviews/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const query = { _id: ObjectId(id) };
  const result = await reviewCol.deleteOne(query);
  res.send(result);
});
// load reviews
app.get("/get-reviews/:id", async (req, res) => {
  const id = req.params.id;
  //find and send data
  let query = { serviceID: id };
  const cursor = reviewCol.find(query);
  const reviews = await cursor.toArray();
  res.send(reviews);
});
// Load reviews based on user email
app.get("/get-user-reviews/:email", async (req, res) => {
  const email = req.params.email;
  console.log(email);
  //find and send data
  let query = { email: email };
  const cursor = reviewCol.find(query);
  const reviews = await cursor.toArray();
  res.send(reviews);
});

// Add services:
app.post("/add-service", async (req, res) => {
  const data = req.body;
  let result = undefined;
  console.log(data);
  try {
    const database = client.db("services");
    const haiku = database.collection("services");
    result = await haiku.insertOne(data);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } catch (e) {
    result = e;
  } finally {
    res.send(result);
  }
});
