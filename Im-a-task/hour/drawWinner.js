import { MongoClient } from 'mongodb';

async function runScript() {
  const uri = 'mongodb+srv://koii:KoiiToTheMoon@im-a-task.b2xhqzs.mongodb.net/?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const database = client.db('games');
  const config = database.collection('config');
  
  const timeDoc = await config.findOne({ _id: "time" });
  const time = timeDoc.value;

  const hourlyCheck = database.collection('hourly');
  const winnersDB = client.db("winners");
  const winner = winnersDB.collection('winner');

  setInterval(async () => {
    const entries = await hourlyCheck.find({}).toArray();
    let totalTickets = 0;
    entries.forEach(entry => {
      totalTickets += entry.tickets;
    });

    const luckyNumber = Math.floor(Math.random() * totalTickets) + 1;
    let cumulativeTickets = 0;
    let winnerAddress = '';

    for (const entry of entries) {
      cumulativeTickets += entry.tickets;
      if (cumulativeTickets >= luckyNumber) {
        winnerAddress = entry._id;
        break;
      }
    }

    await winner.insertOne({ address: winnerAddress });
    console.log('Lucky draw winner:', winnerAddress);
  }, time);
}

runScript().catch(console.error);
