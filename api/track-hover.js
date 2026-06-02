
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let client;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!client) {
      client = new MongoClient(uri);
      await client.connect();
    }

    const db = client.db("user_tracking");
    const collection = db.collection("user_events");

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "Unknown";

    const record = {
      timestamp: new Date(),
      ip,
      userAgent: req.headers["user-agent"],
      productId: req.body.productId,
      productName: req.body.productName,
      pageUrl: req.body.pageUrl
    };

    await collection.insertOne(record);

    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
