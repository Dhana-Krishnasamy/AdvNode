const mongoose = require("mongoose");
const redis = require("redis");
const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl);
const util = require("util");

client.get = util.promisify(client.get);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function() {
  const key = toKey(this.getQuery(), this.mongooseCollection.name);
  const cacheValue = await client.get(key);
  if (cacheValue) {
    const doc = JSON.parse(cacheValue);
    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc);
  } else console.log("cache miss");
  const queryResult = await exec.apply(this, arguments);
  client.set(key, JSON.stringify(queryResult));
  return queryResult;
};

const toKey = (query, collectionName) => {
  return JSON.stringify(
    Object.assign({}, query, {
      collection: collectionName
    })
  );
};
