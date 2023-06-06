const { Client } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const use_db = async (query) => {
  try {
    const client = new Client({
      user: "scoobydoo",
      database: "schedule_agents",
      password: "user1234",
      port: 5432, 
      host: "localhost",
    }); 

    await client.connect();
    const res = await client.query(query); 
    await client.end(); 
 
    return res;
  } catch (error) {
    return error;
  }
};

module.exports = {use_db};
