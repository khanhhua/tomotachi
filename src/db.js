/* eslint */

import debug from 'debug';
import mongoose, { Schema } from 'mongoose';

const dbg = debug('web-api:db');
const { DATABASE_URL } = process.env;

const schemaOptions = {
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
};
const UserSchema = new Schema(
  {
    email: String,
    username: String,
    channels: [String],
  }, schemaOptions);
UserSchema.virtual('id').get(function () {
  return this._id.toHexString(); // eslint-disable-line
});

const ChannelSchema = new Schema(
  {
    ownerId: Schema.Types.ObjectId,
    name: String,
    chatters: [Schema.Types.ObjectId],
    activeChunk: Schema.Types.ObjectId, // Pointer to the ChannelChunkSchema chunk
    createdAt: Date,
    lastMsgAt: Date,
  }, schemaOptions);
ChannelSchema.virtual('id').get(function () {
  return this._id.toHexString(); // eslint-disable-line
});

const ChannelChunkSchema = new Schema({
  channelId: Schema.Types.ObjectId,
  lastMsgAt: Date,
  messages: [
    {
      id: String,
      sender: Schema.Types.ObjectId,
      body: String,
      createdAt: Date,
    }],
});

export const User = mongoose.model('User', UserSchema);
export const Channel = mongoose.model('Channel', ChannelSchema);
export const ChannelChunk = mongoose.model('ChannelChunk', ChannelChunkSchema);

export async function initDb() {
  dbg(`Initializing database for the given URL ${DATABASE_URL}...`);
  const options = {
    useNewUrlParser: true,
    autoIndex: false, // Don't build indexes
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4, // Use IPv4, skip trying IPv6
  };
  await mongoose.connect(DATABASE_URL, options);

  dbg('Executing query scripts...');
  // try {
  //   await Channel.create({ name: 'general' });
  //   await Channel.create({ name: 'chatbot' });
  // } catch (e) {
  //   console.log(e.stackTrace);
  // }

  dbg('Done');
}

export function objectId() {
  return mongoose.Types.ObjectId();
}
