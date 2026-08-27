import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";

function resolveMongoUri() {
  let uri = process.env.MONGODB_URI || "";

  // If running in dev and process.env is stale or contains mongodb+srv, try reading .env.local dynamically
  if ((!uri || uri.startsWith("mongodb+srv://")) && typeof window === "undefined") {
    try {
      const envPath = path.resolve(process.cwd(), ".env.local");
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        const match = content.match(/MONGODB_URI=(.*)/);
        if (match && match[1]) {
          uri = match[1].trim();
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // Auto-rewrite cluster0.ofvtno6 srv URI if present to prevent Windows/Node22 TLS alert 80
  if (uri && uri.includes("cluster0.ofvtno6.mongodb.net")) {
    uri =
      "mongodb://vishalnexios_db_user:DQKapdyKSM2vHAMI@ac-jndnfjh-shard-00-00.ofvtno6.mongodb.net:27017,ac-jndnfjh-shard-00-01.ofvtno6.mongodb.net:27017,ac-jndnfjh-shard-00-02.ofvtno6.mongodb.net:27017/labelpro?ssl=true&replicaSet=atlas-2mez1a-shard-0&authSource=admin&retryWrites=true&w=majority";
  }

  return uri;
}

const options = {};

let client;
let clientPromise;

function getClientPromise() {
  const uri = resolveMongoUri();
  if (!uri) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client
        .connect()
        .catch((err) => {
          global._mongoClientPromise = null;
          throw err;
        });
    }
    return global._mongoClientPromise;
  } else {
    if (!clientPromise) {
      client = new MongoClient(uri, options);
      clientPromise = client
        .connect()
        .catch((err) => {
          clientPromise = null;
          throw err;
        });
    }
    return clientPromise;
  }
}

// Proxy object so `await clientPromise` works seamlessly
const clientPromiseProxy = {
  then(onFulfilled, onRejected) {
    return getClientPromise().then(onFulfilled, onRejected);
  },
  catch(onRejected) {
    return getClientPromise().catch(onRejected);
  },
};

export default clientPromiseProxy;
