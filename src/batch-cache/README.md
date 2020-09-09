# GraphQL Benchmarker


# Clone repo

For development:
```
git clone git@gitlab.ida.liu.se:rabsh696/graphqlbenchmark.git
cd graphqlbenchmark/batch-cache

```


# To setup PostgreSql database connection string run following command.

Create __.env__ file in each server folder.
```
touch .env
```

copy the below line as your database connection string
```
PG_CONNECTION_STRING="postgres://postgres:postgres@host:postNumber/databaseName"
```

# To Run Server 

if you running first time first update __package.json__ file.

```
npm update or npm install
```

```
node index.js npm start

```