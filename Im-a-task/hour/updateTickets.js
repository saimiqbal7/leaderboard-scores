import { MongoClient } from 'mongodb';
import { Connection, PublicKey } from '@_koi/web3.js';
import axios from 'axios';

const getSubmissions = async () => {
  const connection = new Connection('https://k2-testnet.koii.live');
  const accountInfo = await connection.getAccountInfo(
    new PublicKey('4cj2aLZ7dGrsL4jm7b5bEzEKrYMoJzy8Juc2fWwLZrpW'),
  );
  const bytesView = JSON.parse(accountInfo.data + '');
  return bytesView.submissions;
};

const getData = async () => {
  const submissions = await getSubmissions();
  const topLevelKeys = Object.keys(submissions);
  const lastKey = topLevelKeys[topLevelKeys.length - 1];
  const lastObject = submissions[lastKey];
  const data = Object.keys(lastObject);
  return data;
};

async function runScript() {
  const uri = 'mongodb+srv://koii:KoiiToTheMoon@im-a-task.b2xhqzs.mongodb.net/?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const database = client.db('games');
  const config = database.collection('config');
  
  const timeDoc = await config.findOne({ _id: "time" });
  const time = timeDoc.value;

  const hourlyCheck = database.collection('hourly');
  const allTimeTickets = database.collection('allTime');

  // Reset hourly submissions every hour
  setInterval(async () => {
    await hourlyCheck.deleteMany({});
  }, time);

  // Update ticket counts every 10 minutes
  setInterval(async () => {
    const submissions = await getData();
    const bulkOps = submissions.map((submission) => ({
      updateOne: {
        filter: { _id: submission },
        update: { $inc: { tickets: 1 } },
        upsert: true,
      },
    }));
    await hourlyCheck.bulkWrite(bulkOps);
    await allTimeTickets.bulkWrite(bulkOps);
  }, time / 10);
}

runScript().catch(console.error);
