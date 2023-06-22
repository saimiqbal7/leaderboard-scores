import { MongoClient } from 'mongodb';

async function setConfigTime() {
  const uri = 'mongodb+srv://koii:KoiiToTheMoon@im-a-task.b2xhqzs.mongodb.net/?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const database = client.db('games');
  const config = database.collection('config');

  await config.insertOne({ _id: "time", value: 600000 }); // 10 minutes
}

setConfigTime().catch(console.error);
