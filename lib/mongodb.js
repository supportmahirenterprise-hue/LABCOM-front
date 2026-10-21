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

let cachedClient = null;
let cachedPromise = null;

export async function getClient() {
  if (cachedClient && cachedClient.topology && cachedClient.topology.isConnected()) {
    return cachedClient;
  }

  if (!cachedPromise) {
    const client = new MongoClient(getCleanUri(), {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 20000,
      maxPoolSize: 10,
    });

    cachedPromise = client
      .connect()
      .then((c) => {
        cachedClient = c;
        return c;
      })
      .catch((err) => {
        cachedClient = null;
        cachedPromise = null;
        throw err;
      });
  }

  return cachedPromise;
}

export async function getDb() {
  const c = await getClient();
  return c.db("labelpro");
}

const clientPromise = {
  then(onFulfilled, onRejected) {
    return getClient().then(onFulfilled, onRejected);
  },
  catch(onRejected) {
    return getClient().catch(onRejected);
  },
};

export default clientPromise;
