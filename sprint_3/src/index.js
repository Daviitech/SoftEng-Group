/* Import dependencies */
const express = require("express");
const mysql = require("mysql2");
const path = require("path");

/* Create express instance */
const app = express();
const port = 3000;

//use teh pug template engine
app.set("view engine", "pug");
app.set("views","./views");

//add a static files loction
app.use(express.static("static"));

console.log(process.env.MODE_ENV);

/* Setup database connection */
const db = mysql.createConnection({
  host: process.env.DATABASE_HOST || "localhost",
  user: "user",
  password: "password",
  database: "world",
});

/* Landing route */
// app.get("/", (req, res) => {
//   res.send("Hello everyone");
// });

app.get("/",(req, res) =>{
  res.render("index",
  { 'title': 'my index page'});
  // res.sendFile(path.join(__dirname, 'index.pug'));
});

app.get("index",(req, res) =>{
  res.render("index",
  { 'title': 'my index page'});
  // res.sendFile(path.join(__dirname, 'index.pug'));
});

app.get("/dataE",(req, res) =>{
  res.render("dataE",
  { 'title': 'Data Entry Page'});
  // res.sendFile(path.join(__dirname, 'index.pug'));
});

app.get("/login",(req, res) =>{
  res.render("login",
  { 'title': 'Login Page'});
  // res.sendFile(path.join(__dirname, 'index.pug'));
});

app.get("/search",(req, res) =>{
  res.render("search",
  { 'title': 'Search Page'});
  // res.sendFile(path.join(__dirname, 'index.pug'));
});

// app.get("/search_results",(req, res) =>{
//   res.render("search_results",
//   { 'title': 'Search Results'});
//   // res.sendFile(path.join(__dirname, 'index.pug'));
// });

app.get("/search", (req, res) => {
  const cityName = req.query.cityName; // Fetch the city name from the query parameters

  // Query the database to search for cities matching the city name
  db.execute("SELECT * FROM `city` WHERE Name LIKE ?", [`%${cityName}%`], (err, rows, fields) => {
    if (err) {
      return res.status(500).send("Error searching for cities in the database");
    }

    console.log(`/search: Found ${rows.length} cities matching "${cityName}"`);
    res.render("search_results", { title: 'Search Results', cityName, cities: rows });
  });
});

app.get("/userM",(req, res) =>{
  res.render("userM",
  { 'title': 'User Management Page'});
  // res.sendFile(path.join(__dirname, 'index.pug'));
});


// Sample API route
app.get("/ping", (req, res) => {
  res.send("pong");
});

// Returns an array of cities from the database
// app.get("/cities", (req, res) => {
//   db.execute("SELECT * FROM `city`", (err, rows, fields) => {
//     console.log(`/cities: ${rows.length} rows`);
//     return res.send(rows);
//   });
// });

app.get("/cities", (req, res) => {
  db.execute("SELECT ID, Name, CountryCode, District, FORMAT(Population, 0) AS Population FROM `city`", (err, rows, fields) => {
    if (err) {
      return res.status(500).send("Error retrieving cities from database");
    }
    console.log(`/cities: ${rows.length} rows`);
    // rows.sort((a, b) => {
    //   return a.Name.localeCompare(b.Name);
    // });
    res.render("cities", { title: 'Cities', cities: rows });
  });
});

// Route handler to display city details
app.get("/cities/:id", (req, res) => {
  const cityId = req.params.id; // Fetch city ID from the URL parameters

  // Query the database to fetch details of the specific city using cityId
  db.execute("SELECT * FROM `city` WHERE ID = ?", [cityId], (err, rows, fields) => {
    if (err) {
      return res.status(500).send("Error retrieving city details from database");
    }

    if (rows.length === 0) {
      // City with the specified ID not found
      return res.status(404).send("City not found");
    }

    const city = rows[0];
    city.Population = formatPopulation(city.Population);

    // Render the city details template with the fetched city details
    res.render("city_details", { title: 'City Details By ID', city: rows[0] });
  });
});

function formatPopulation(population) {
  return population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


//Dynamic route example
app.get("/city:id", function(req, res){
  // req.params contains any
  console.log(req.params);
  res.send("Id is " + RegExp.params.id);
});

// Run server!
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
