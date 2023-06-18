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

  console.log("Started")
  const uri = 'mongodb+srv://saim:Stephcurry7$@submissions.twztlmx.mongodb.net/?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const database = client.db('submissions');
  const currentLeaderboardCollection = database.collection('leaderboard');
  const allTimeLeaderboardCollection = database.collection('allTimeLeaderboard');



  const submissions = await getData();

  // Update current leaderboard
  for (const submission of submissions) {
    const currentLeaderboardEntry = await currentLeaderboardCollection.findOne({ submissionId: submission });
    const allTimeLeaderboardEntry = await allTimeLeaderboardCollection.findOne({ submissionId: submission });

    if (currentLeaderboardEntry) {
      await currentLeaderboardCollection.updateOne(
        { _id: currentLeaderboardEntry._id },
        { $inc: { points: 1 } }
      );
    } else {
      await currentLeaderboardCollection.insertOne({ submissionId: submission, points: 1 });
    }

    if (allTimeLeaderboardEntry) {
      await allTimeLeaderboardCollection.updateOne(
        { _id: allTimeLeaderboardEntry._id },
        { $inc: { points: 1 } }
      );
    } else {
      await allTimeLeaderboardCollection.insertOne({ submissionId: submission, points: 1 });
    }
  }

  // Remove entries from current leaderboard if not in submissions
  const currentLeaderboard = await currentLeaderboardCollection.find().toArray();

  for (const entry of currentLeaderboard) {
    if (!submissions.includes(entry.submissionId)) {
      await currentLeaderboardCollection.deleteOne({ _id: entry._id });
    }
  }

  await client.close();
}

setInterval(runScript, 1 * 60 * 1000);
