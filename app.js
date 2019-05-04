const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const graphQlSchema = require("./geaphql/schema/index");
const graphQlResolvers = require("./geaphql/resolvers/index");

const app = express();
app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true
  })
);

mongoose
  .connect(
    `mongodb://admin:A9PupM8w4ST1Qcrv@SG-mymongo-20699.servers.mongodirector.com:27017/admin`
  )
  .then(() => {
    app.listen(3000);
    // console.log("App Connected");
  })
  .catch(e => {
    console.log(e);
    // console.log("We have error");
    throw e;
  });
