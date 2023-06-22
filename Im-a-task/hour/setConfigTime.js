import { MongoClient } from "mongodb";

async function setConfigTime() {
  const uri =
    "mongodb+srv://koii:KoiiToTheMoon@im-a-task.b2xhqzs.mongodb.net/?retryWrites=true&w=majority";
  const client = new MongoClient(uri);
  await client.connect();
  const database = client.db("games");
  const config = database.collection("config");

  setInterval(async () => {
    const currentTime = Math.floor(Date.now() / 1000); // Unix epoch time in seconds
    await config.updateOne({ _id: "time" }, { $set: { value: currentTime } });
    console.log("Time updated:", currentTime);
  }, 1000); // Update every second
}

setConfigTime().catch(console.error);