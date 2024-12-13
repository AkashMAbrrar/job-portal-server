const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());

// root api
app.get("/", async (req, res) => {
  res.send("working hard and get a job");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.c4n3e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    // ---------* create collection*-------------
    //1: jobs related api's (crud start from here)=> collection -1
    const jobsCollection = client.db("JobPortal").collection("jobs");
    // collections of job applicants
    const JobApplicantsCollection = client
      .db("JobPortal")
      .collection("job_applications");

    // 2: get api for get all the data from database
    app.get("/jobs", async (req, res) => {
      const cursor = jobsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // get job data by an id
    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    // job applications api's  (data sending form client)
    // get all data, get one data, some data [0,1,many]
    app.get("/job-application", async (req, res) => {
      const email = req.query.email;
      const query = { applicant_email: email };
      const result = await JobApplicantsCollection.find(query).toArray();
      res.send(result);
    });
    app.post("/job-applications", async (req, res) => {
      const application = req.body;
      const result = await JobApplicantsCollection.insertOne(application);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// server test
app.listen(port, () => {
  console.log(`Server (job) is running on port${port}`);
});
