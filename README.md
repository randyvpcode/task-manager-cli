# task-manager-cli

## How To Install

- clone this repo
- cd task-manager-api
- yarn install or npm install
- create database from local couchDB with name **efishery_task_test**
- create **.env** file with contents like **.env_example**
- set env local & remote couchDB (url with database, username, password)

  example :

  local : http://localhost:5984/efishery_task_test, admin, admin

  remote : http://remote_url:5984/efishery_task_test, admin, admin

## How to run

```
node src/index [options]
```

[options] :

- sync
- list
- send
- done doc_id (ex: 173f443f-e39b-528b-b0cb-f928dbb0617e)
