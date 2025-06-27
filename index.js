
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = 4000;
const { ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.sys040z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
  } finally {
  }
}
run().catch(console.dir);

// create a collection
const groupDB = client.db('groupDB').collection('groups');
const userDB = client.db('groupDB').collection('users');



// ✅ /groups API route
app.get('/groups', async (req, res) => {
  const { search = "", category = "", sort = "" } = req.query;

  let query = {};

  // 🔍 Title Search
  if (search) {
    query.groupName = { $regex: search, $options: "i" };
  }

  if (category) {
    query.category = { $regex: category, $options: "i" };
  }

  let cursor = groupDB.find(query);

  // ⬆️⬇️ Sorting
  if (sort === "asc") {
    cursor = cursor.sort({ name: 1 });
  } else if (sort === "desc") {
    cursor = cursor.sort({ name: -1 });
  } else if (sort === "startDate") {
    cursor = cursor.sort({ startDate: -1 });
  } else if (sort === "memberCount") {
    cursor = cursor.sort({ memberCount: -1 });
  }

  const result = await cursor.toArray();
  res.send(result);
});

// my group api
app.get('/myGroups', async(req, res) => {
  const email = req.query.email ;
  const query = {userEmail : email}
  const result = await groupDB.find(query).toArray()
  res.send(result)
})                          

app.post('/groups', async (req, res) => {
    const groups  = req.body;
    const result = groupDB.insertOne(groups);
    res.send(result);
})

// update 
app.get('/updateGroup/:id', async(req, res) => {
  const id = req.params.id ;
  const query = {_id: new ObjectId(id)};
  const result = await groupDB.findOne(query);
    res.send(result)
})

app.put('/updateGroup/:id', async(req, res) => {
  const id = req.params.id ;
  const body = req.body
  const query = {_id : new ObjectId(id)};
  const options = { upsert: true };
  const updateDoc = {
    $set:  body,
  };
  const result = await groupDB.updateOne(query, updateDoc, options);
  res.send(result)
})


// deleted
app.get('/groups/:id', async(req, res) => {
  const id = req.params.id;
  const query = {_id : new ObjectId(id)};
  const result = await groupDB.findOne(query);
  res.send(result)
})


app.delete('/groups/:id', async(req, res) => {
  const id = req.params.id;
  const query = {_id : new ObjectId(id)} ;
  const result = await groupDB.deleteOne(query)
  res.send(result)

})

app.post('/users', async (req, res) => {
  try {
    const result = await userDB.insertOne(req.body);
    res.status(201).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Failed to create user', error });
  }
});


// সব ইউজার দেখানোর জন্য GET /users
app.get('/users', async (req, res) => {
  try {
    const users = await userDB.find({}).toArray();  // সব ইউজার নিয়ে আসবে
    res.send(users);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Failed to fetch users', error });
  }
});


app.listen(port, () => {

})