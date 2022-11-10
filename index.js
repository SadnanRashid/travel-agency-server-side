const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
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
const accessToken =
  "af8f6856df062a6a9764bfa35d9246f3ac9a874a805e99b5ada3ffd7aa0f303d";
// JWT:
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader;
  console.log(token);

  jwt.verify(token, accessToken, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "access denied" });
    }
    req.decoded = decoded;
    next();
  });
}

// jwt api
app.get("/jsonWT/:user", (req, res) => {
  const user = req.params.user;
  console.log(user);
  const token = jwt.sign({ email: user }, accessToken, { expiresIn: "1d" });
  res.send({ token });
});

// end of jwt

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
app.post("/review", verifyJWT, async (req, res) => {
  const { email, photo, name, rating, review, serviceID, serviceName } =
    req.body;
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
app.delete("/delete-reviews/:id", verifyJWT, async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const query = { _id: ObjectId(id) };
  const result = await reviewCol.deleteOne(query);
  res.send(result);
});
// load reviews for services page
app.get("/get-reviews/:id", async (req, res) => {
  const id = req.params.id;
  //find and send data
  let query = { serviceID: id };
  const cursor = reviewCol.find(query);
  const reviews = await cursor.toArray();
  res.send(reviews);
});
// Load reviews based on user email
app.get("/get-user-reviews/:email", verifyJWT, async (req, res) => {
  const decoded = req.decoded;
  const email = req.params.email;
  console.log(email);
  //check validity
  if (decoded.email !== email) {
    console.log("send error");
    res.status(403).send({ message: "unauthorized access" });
  }
  // console.log(email);
  //find and send data
  let query = { email: email };
  const cursor = reviewCol.find(query);
  const reviews = await cursor.toArray();
  res.send(reviews);
  console.log(reviews);
});
// edit reviews:
app.patch("/reviews/:id", verifyJWT, async (req, res) => {
  const id = req.params.id;
  const { review, rating } = req.body;
  console.log(review, rating, id);
  const query = { _id: ObjectId(id) };
  const updatedDoc = {
    $set: {
      review: review,
      rating: rating,
    },
  };
  const result = await reviewCol.updateOne(query, updatedDoc);
  res.send(result);
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
