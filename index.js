
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
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);


// create a collection
const groupDB = client.db('groupDB').collection('groups');


app.get('/groups', async(req, res) => {
    const result = await groupDB.find().toArray();
    res.send(result)
})

app.get('/groups/:id', async(req, res) => {
    const id = req.params.id;
    const query = {_id : new ObjectId(id)};
    const result = await groupDB.findOne(query);
    res.send(result)
})

// my group api
app.get('/myGroups', async(req, res) => {
  const email = req.query.email ;
  const query = {userEmail : email}
  const result = await groupDB.find(query).toArray()
  res.send(result)
})

app.post('/groups', async (req, res) => {
    const groups  = req.body;
    console.log(groups);
    const result = groupDB.insertOne(groups);
    res.send(result);
})

app.delete('/groups/:id', async(req, res) => {
  const id = req.params.id;
  const query = {_id : new ObjectId(id)} ;
  const result = await groupDB.deleteOne(query)
  res.send(result)
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
})