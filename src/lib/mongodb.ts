import dns from "dns";
import mongoose from "mongoose";

// Fix querySrv ECONNREFUSED on local networks/Windows where default DNS refuses SRV queries
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (err) {
  // Ignore in environments where setServers is restricted
}

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://saidineshgoexperts_db_user:OInrgEWHipIlJhuy@goexperts.ihc4tu2.mongodb.net/resort_booking?retryWrites=true&w=majority&appName=Goexperts";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
