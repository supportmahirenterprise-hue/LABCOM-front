import { MongoClient } from "mongodb";

const WORKING_URI =
  "mongodb://vishalnexios_db_user:DQKapdyKSM2vHAMI@ac-jndnfjh-shard-00-00.ofvtno6.mongodb.net:27017,ac-jndnfjh-shard-00-01.ofvtno6.mongodb.net:27017,ac-jndnfjh-shard-00-02.ofvtno6.mongodb.net:27017/labelpro?ssl=true&replicaSet=atlas-2mez1a-shard-0&authSource=admin&retryWrites=true&w=majority";

function getCleanUri() {
  let uri = process.env.MONGODB_URI || "";
  if (!uri || uri.startsWith("mongodb+srv://") || uri.includes("cluster0.ofvtno6")) {
    return WORKING_URI;
  }
  return uri;
}

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(getCleanUri(), {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(getCleanUri(), {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });
  clientPromise = client.connect();
}

export async function getDb() {
  const c = await clientPromise;
  return c.db("labelpro");
}

export default clientPromise;
