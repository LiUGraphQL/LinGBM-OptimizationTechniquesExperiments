# GraphQL Benchmarker


# Clone repo

For development:
```
git clone https://github.com/LiUGraphQL/LinGBM-OptimizationTechniquesExperiments.git
cd LinGBM-OptimizationTechniquesExperiments/src/batch-cache

```


# To setup PostgreSql database connection string run following command.

Create __.env__ file in each server folder.
```
touch .env
```

copy the below line as your database connection string
```
PG_CONNECTION_STRING="postgres://USERNAME:PASSWORD@HOSTNAME:PORTNUMBER/DATABASENAME"
```

# To Run Server 

if you running first time first update __package.json__ file.

```
npm update or npm install
```

```
node index.js npm start

```

# Disabling Cache

Default, this approach implements both batch and cache for the GraphQL server. 

In some cases, the cache may not be desirable. Setting cache as 'false' in the config.js file can disable cache.