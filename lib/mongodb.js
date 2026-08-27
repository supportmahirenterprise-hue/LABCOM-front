import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

function getClientPromise() {
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

// Proxy object or getter so `await clientPromise` works transparently
const clientPromiseProxy = {
  then(onFulfilled, onRejected) {
    return getClientPromise().then(onFulfilled, onRejected);
  },
  catch(onRejected) {
    return getClientPromise().catch(onRejected);
  },
};

export default clientPromiseProxy;
