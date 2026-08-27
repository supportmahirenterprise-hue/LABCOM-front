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

let activeClient = null;
let activePromise = null;

// Force reset any stale global cache from previously failed runs
if (typeof global !== "undefined") {
  global._mongoClientPromise = null;
}

async function getConnectedClient() {
  const uri = getCleanUri();

  // If already connected, verify and return
  if (activeClient && activePromise) {
    try {
      const client = await activePromise;
      return client;
    } catch (e) {
      activeClient = null;
      activePromise = null;
      if (typeof global !== "undefined") {
        global._mongoClientPromise = null;
      }
    }
  }

  activeClient = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });

  activePromise = activeClient.connect().catch((err) => {
    activeClient = null;
    activePromise = null;
    if (typeof global !== "undefined") {
      global._mongoClientPromise = null;
    }
    throw err;
  });

  if (typeof global !== "undefined") {
    global._mongoClientPromise = activePromise;
  }

  return activePromise;
}

const clientPromise = {
  then(onFulfilled, onRejected) {
    return getConnectedClient().then(onFulfilled, onRejected);
  },
  catch(onRejected) {
    return getConnectedClient().catch(onRejected);
  },
};

export default clientPromise;
