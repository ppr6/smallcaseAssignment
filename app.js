//#region Required External Modules
const express = require("express");
const bodyParser = require("body-parser");
const dbConn = require('./dataAccess/dbConnector');
//#endregion

//#region API Route Mappping
var tradeRoutes = require('./api-routes/tradeRoutes');
var portfolioRoutes = require('./api-routes/portfolioRoutes');
//#endregion

//#region App Variables
const app = express();
const port = process.env.PORT || 8000;
//#endregion

//#region App Configuration
//#endregion

//#region Using BodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//#endregion

//#region Route Definitions
app.use('/trades', tradeRoutes);
app.use('/portfolio', portfolioRoutes);
//#endregion

//#region server health
app.get('/', (req, res) => {
  res.send(`Server is up and running at port ${port}`)
})
//#endregion

//#region Server Activation
app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});
//#endregion



