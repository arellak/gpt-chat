import QuickDB from "quick.db";
import path from "node:path";

const db = new QuickDB.QuickDB({
  filePath: path.resolve("./data/keys.sqlite"),
});

/*
  * This function validates the api key.
  * @param {string} key - The api key to validate.
  * @returns {boolean} - Whether the api key is valid or not.
*/
export async function validateKey(key){
  const keys = await db.get("keys");
  if(keys === undefined){
    return false;
  }
  else{
    return keys.includes(key);
  }
}

export async function add(key){
  db.push("keys", key);
}