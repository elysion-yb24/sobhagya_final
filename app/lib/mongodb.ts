import { MongoClient, type Collection } from "mongodb";

export interface HoroscopeDoc {
  _id: unknown;
  date: string;
  period: "today" | "tomorrow" | "weekly" | "monthly" | "yearly";
  sign: string;
  scraped_at: Date;
  text: string;
  url: string;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function clientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set");
  }
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri).connect();
  }
  return global._mongoClientPromise;
}

export async function getHoroscopeCollection(): Promise<Collection<HoroscopeDoc>> {
  const client = await clientPromise();
  return client.db("horoscope").collection<HoroscopeDoc>("horoscopes");
}
