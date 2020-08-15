require('dotenv').config()
const PouchDB = require('pouchdb-node')
const localDB = new PouchDB(process.env.COUCH_DB_LOCAL, {
  skipSetup: true,
  auth: {
    username: process.env.COUCH_USERNAME_LOCAL,
    password: process.env.COUCH_PASSWORD_LOCAL,
  },
})
const remoteDB = new PouchDB(process.env.COUCH_DB_REMOTE, {
  skipSetup: true,
  auth: {
    username: process.env.COUCH_USERNAME_REMOTE,
    password: process.env.COUCH_PASSWORD_REMOTE,
  },
})

const syncData = async () => {
  await localDB.replicate
    .from(remoteDB, {
      live: false,
      retry: true,
    })
    .on('change', (change) => {})
    .on('error', (err) => {
      console.log(err)
    })
}

const sendData = async () => {
  await localDB.replicate
    .to(remoteDB, {
      live: false,
      retry: true,
    })
    .on('change', (change) => {})
    .on('error', (err) => {
      console.log(err)
    })
}

const lineTask = (task, key) => {
  console.log(
    task.isDone === false
      ? `[ ]  | ${key + 1}.  | ${task._id} | ${task.content}`
      : task.isDone === true
      ? `[X]  | ${key + 1}.  | ${task._id} | ${task.content}`
      : ``
  )
  console.log(`-------------------------------------------------------`)
}

const get = async () => {
  console.log(`-------------------------------------------------------`)
  console.log(`Done | No. |     ID      |       Content`)
  console.log(`-------------------------------------------------------`)
  try {
    const tasks = await localDB.allDocs({
      include_docs: true,
    })
    let data = []
    for (const key in tasks) {
      if (tasks.hasOwnProperty(key)) {
        data = tasks.rows
      }
    }
    const filtered = data.filter((val) => val.doc.deletedAt === null)
    filtered.forEach((val, key) => {
      lineTask(val.doc, key)
    })
  } catch (err) {
    console.log(err)
  }
}

const doneTask = async (id) => {
  return localDB.get(id, function (err, doc) {
    if (err) {
      return console.log(err)
    }
    localDB.put(
      {
        ...doc,
        _id: id,
        _rev: doc._rev,
        isDone: true,
      },
      function (err, response) {
        if (err) {
          return console.log(err)
        }
      }
    )
  })
}

const commands = {}

commands.hello = () => {
  console.log('Task Manager CLI')
}

commands.list = () => {
  get()
}

commands.sync = () => {
  syncData()
  console.log('Sync Completed')
}

commands.send = () => {
  sendData()
  console.log('Send to Remote Completed')
}

commands.done = (id) => {
  doneTask(id)
  console.log('Task Completed')
}

const operation = process.argv[2]
const _id = process.argv[3]

// Commands
switch (operation) {
  case 'hello':
    return commands.hello()
  case 'sync':
    return commands.sync()
  case 'list':
    return commands.list()
  case 'send':
    return commands.send()
  case 'done':
    if (_id) {
      return commands.done(_id)
    } else {
      throw Error(`${operation} must be passing parameter _id`)
    }
  default:
    throw Error(`unsupported operation ${operation}`)
}
