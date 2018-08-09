import debug from 'debug';

import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

const client = new Client({ connectionString: process.env.DATABASE_URL });

const dbg = debug('tomotachi:db');

export async function initDb() {
  dbg(`Inialializing database for the given URL ${process.env.DATABASE_URL}...`);
  await client.connect();

  dbg('Executing query scripts...');
  const query = fs.readFileSync(path.resolve(path.join(__dirname, 'dbscripts', 'init.sql')), 'utf-8');
  await client.query(query);
  dbg('Done');
}

export async function connectFriends(friends) {
  const selectQuery = 'SELECT email, friends FROM friends WHERE email = $1 LIMIT 1';
  const queryInsert = 'INSERT INTO friends(email, friends) VALUES ($1, $2) RETURNING *;';
  const queryUpdate = 'UPDATE friends SET friends=$2 WHERE email=$1 RETURNING *;';

  try {
    for (let i=0, len=friends.length; i<len; i++) {
      const email = friends[i];
      dbg('Checking from email exists...')
      const row = await client.query(selectQuery, [email]).then(res => res.rows[0]);

      if (row) {
        const connectedFriends = [].concat(row.friends, friends.filter((_item, index) => index !== i).map(item => item)); // clone

        dbg('Updating email with friend list');
        await client.query(queryUpdate, [email, connectedFriends]);
      } else {
        const connectedFriends = friends.filter((_item, index) => index !== i).map(item => item); // clone

        dbg('Inserting email with friend list', [email, connectedFriends]);
        await client.query(queryInsert, [email, connectedFriends]);
      }
    }
  } catch (e) {
    dbg(e.message);

    e.status = e.status || 500;
    throw e;
  }
}

export async function findFriendsByEmail(email) {
  const selectQuery = 'SELECT email, friends FROM friends WHERE email = $1 LIMIT 1';

  try {
    const row = await client.query(selectQuery, [email]).then(res => res.rows[0]);
    if (!row) {
      const e = new Error('Not found');
      e.status = 404;

      throw e;
    }

    return row.friends;
  } catch (e) {
    dbg(e.message);

    e.status = e.status || 500;
    throw e;
  }
}

export async function userExistsByEmail(email) {
  dbg(`Checking if ${email} exists...`);

  const selectQuery = 'SELECT EXISTS (SELECT email FROM friends WHERE email = $1) as result';
  try {
    const row = await client.query(selectQuery, [email]).then(res => res.rows[0]);
    dbg(`${email} exists = ${row.result}`);

    return row.result;
  } catch (e) {
    dbg(e.message);

    e.status = e.status || 500;
    throw e;
  }
}

export async function findCommonFriends(friends) {
  if (friends.length !== 2) {
    throw new Error('Invalid argument. Only 2 friends for this demo');
  }

  const selectQuery =
    `SELECT (
      (SELECT unnest(friends) FROM friends WHERE email=$1)
      INTERSECT
      (SELECT unnest(friends) FROM friends WHERE email=$2)
    ) as email`;

  try {
    const rows = await client.query(selectQuery, friends).then(res => res.rows);

    return rows.map(({ email }) => email);
  } catch (e) {
    dbg(e.message);

    e.status = e.status || 500;
    throw e;
  }
}

export async function makeSubscription(requestor, target) {
  // $1: requestor - add this to list of subscribers
  // $2: target - add the requestor to this subscribers list
  const selectQuery = 'SELECT EXISTS (SELECT subscribers FROM friends WHERE email = $2 AND $1 = ANY(subscribers)) as result';
  const updateQuery = 'UPDATE friends SET subscribers = array_append(subscribers, $1) WHERE email=$2';

  try {
    dbg(`Checking if ${requestor} exists...`);
    const row = await client.query(selectQuery, [requestor,target]).then(res => res.rows[0]);
    dbg(`${requestor} exists = ${row.result}`);
    if (row.result) {
      dbg('Requestor is already in the target list of subscriber. Ignored.');
      return true;
    }

    dbg('Adding requestor email into the list of target` subscribers');
    const result = await client.query(updateQuery, [requestor, target]);

    return result.rowCount === 1;
  } catch (e) {
    dbg(e.message);

    e.status = e.status || 500;
    throw e;
  }
}

export async function makeBlock(requestor, target) {
  // $1: requestor - add this to list of subscribers
  // $2: target - add the requestor to this subscribers list
  const selectQuery = 'SELECT EXISTS (SELECT blockers FROM friends WHERE email = $2 AND $1 = ANY(blockers)) as result';
  const updateQuery = 'UPDATE friends SET blockers = array_append(blockers, $1) WHERE email=$2';

  try {
    dbg(`Checking if ${requestor} exists...`);
    const row = await client.query(selectQuery, [requestor,target]).then(res => res.rows[0]);
    dbg(`${requestor} exists = ${row.result}`);
    if (row.result) {
      dbg('Requestor is already in the target list of blockers. Ignored.');
      return true;
    }

    dbg('Adding requestor email into the list of target` subscribers');
    const result = await client.query(updateQuery, [requestor, target]);

    return result.rowCount === 1;
  } catch (e) {
    dbg(e.message);

    e.status = e.status || 500;
    throw e;
  }
}
