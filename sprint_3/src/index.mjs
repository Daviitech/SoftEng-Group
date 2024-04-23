/* Import dependencies */
import express from "express";
import session from "express-session";
import DatabaseService from "./services/database.service.mjs";
//const { passwordMatch } = require('./passwordUtils');


/* Create express instance */
const app = express();
const port = 3000; 

/* Add form data middleware */
app.use(express.urlencoded({ extended: true }));

//Set up session middleware
app.use(session({
  secret: 'wait4andseegroup8',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

//use the pug template engine
app.set("view engine", "pug");
app.set("views","./views");

//add a static files loction
app.use(express.static("static"));

//console.log(process.env.MODE_ENV);

/* Setup database connection */
// const db = mysql.createConnection({
//   host: process.env.DATABASE_HOST || "localhost",
//   user: "user",
//   password: "password",
//   database: "world",
// });

const db = await DatabaseService.connect();
const { conn } = db;

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

app.get("/ulogin",(req, res) =>{
  res.render("ulogin",
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

// app.get("/search", (req, res) => {
//   const cityName = req.query.cityName; // Fetch the city name from the query parameters

//   // Query the database to search for cities matching the city name
//   db.execute("SELECT * FROM `city` WHERE Name LIKE ?", [`%${cityName}%`], (err, rows, fields) => {
//     if (err) {
//       return res.status(500).send("Error searching for cities in the database");
//     }

//     console.log(`/search: Found ${rows.length} cities matching "${cityName}"`);
//     res.render("search_results", { title: 'Search Results', cityName, cities: rows });
//   });
// });

app.get("/userM",(req, res) =>{
  if (req.session.admin) {
    return res.redirect("/admin_dashboard");
  }
  res.render("userM",
  { 'title': 'User Management Page'});
  // res.sendFile(path.join(__dirname, 'index.pug'));
});

app.get("/cities_a", async (req, res) => {
  if (!req.session.admin) {
    return res.redirect("/userM");
  }
  const [rows, fields] = await db.getCities();
  /* Render cities.pug with data passed as plain object */
  return res.render("cities_a", { rows, fields });
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

// app.get("/cities", (req, res) => {
//   db.execute("SELECT ID, Name, CountryCode, District, FORMAT(Population, 0) AS Population FROM `city`", (err, rows, fields) => {
//     if (err) {
//       return res.status(500).send("Error retrieving cities from database");
//     }
//     console.log(`/cities: ${rows.length} rows`);
//     // rows.sort((a, b) => {
//     //   return a.Name.localeCompare(b.Name);
//     // });
//     res.render("cities", { title: 'Cities', cities: rows });
//   });
// });

// app.get("/cities", async (req, res) => {
//     const cities = await db.getAllCities();
//     /* Render cities.pug with data passed as plain object */
//     return res.render('cities', { title: 'Cities', cities });
// });

app.get("/cities", async (req, res) => {
  const [rows, fields] = await db.getCities();
  /* Render cities.pug with data passed as plain object */
  return res.render("cities", { rows, fields });
});

app.get("/cities/:id", async (req, res) => {
  const cityId = req.params.id;
  const city = await db.getCity(cityId);
  return res.render("city_details", { city });
});

app.get("/update/:id", async (req, res) => {
  const cityId = req.params.id;
  const city = await db.getCity(cityId);
  return res.render("update", { city });
});

app.post("/update/:id/updatePopulation", async (req, res) => {
  const cityId = req.params.id;
  const newPopulation = req.body.newPopulation;

  try {
    // Update population in the database
    await db.updatePopulation(cityId, newPopulation);

    // Redirect back to city details page
    res.redirect(`/cities/${cityId}`);
  } catch (error) {
    // Handle error
    console.error("Error updating population:", error);
    res.status(500).send("Error updating population");
  }
});

app.get("/delete/:id", async (req, res) => {
  const cityId = req.params.id;
  const city = await db.getCity(cityId);
  return res.render("delete", { city });
});

// Delete city route
app.post("/delete/:id/delete", async (req, res) => {
  const cityId = req.params.id;

  try {
    // Delete city from the database
    const success = await db.deleteCity(cityId);

    // Redirect back to the cities page
    res.redirect(`/cities`);
    
  } catch (error) {
    // Handle error
    console.error("Error deleting city:", error);
    req.flash("error", "Error deleting city");
    res.redirect(`/cities/${cityId}`);
  }
});

//search cities
app.get("/search_q", async (req, res) => {
  const cityName = req.query.cityName;
  try {
    const cities = await db.searchCities(cityName);
    res.render("search_results", { title: "Search Results", cityName, cities });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error searching for cities");
  }
});


// Route handler to display city details
// app.get("/cities/:id", (req, res) => {
//   const cityId = req.params.id; // Fetch city ID from the URL parameters

//   // Query the database to fetch details of the specific city using cityId
//   db.execute("SELECT * FROM `city` WHERE ID = ?", [cityId], (err, rows, fields) => {
//     if (err) {
//       return res.status(500).send("Error retrieving city details from database");
//     }

//     if (rows.length === 0) {
//       // City with the specified ID not found
//       return res.status(404).send("City not found");
//     }

//     const city = rows[0];
//     city.Population = formatPopulation(city.Population);

//     // Render the city details template with the fetched city details
//     res.render("city_details", { title: 'City Details By ID', city: rows[0] });
//   });
// });

function formatPopulation(population) {
  return population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


//Dynamic route example
app.get("/city:id", function(req, res){
  // req.params contains any
  console.log(req.params);
  res.send("Id is " + RegExp.params.id);
});

app.post("/alogin", async (req, res) => {
  const { username, password } = req.body;
  console.log(username,password);
  try {
    const admin = await db.authenticateadmin(username, password);
    if (admin === null) {
      return res.render("userM", { title: 'Admin Login Page', error: 'User not found!!' });
    }else if (admin === false) {
      return res.render("userM", { title: 'Admin Login Page', error: 'Invalid password!!' });
    }else if (admin === true){
      // Set admin session data upon successful authentication
      req.session.admin = { admin_user: admin.username };
      res.redirect("/admin_dashboard");
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).render("userM", { title: 'Login Page', error: 'Internal Server Error. Please try again later.' });
  }
});

app.get("/admin_dashboard", (req, res) => {
  if (!req.session.admin) {
    return res.redirect("/userM");
  }
  const admin = req.session.admin.admin_user;
  res.render("admin_dashboard", { title: 'Admin Dashboard', admin });
});

app.get("/alogout", (req, res) => {
  // Destroy the session data (logout)
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Internal Server Error");
    }
    // Redirect to the login page after logout
    res.redirect("/userM");
  });
});

app.get("/reg_user",(req, res) =>{
  if (!req.session.admin) {
    return res.redirect("/admin_dashboard");
  }
  res.render("reg_user",
  { 'title': 'Register User'});
});

app.get("/v_user", async (req, res) =>{
  if (!req.session.admin) {
    return res.redirect("/admin_dashboard");
  }
  const [rows] = await db.getUsers();
  res.render("v_user", { title: 'View User(s)', rows });
});

app.post("/register_user", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user already exists
    const userExists = await db.verify_email(email);

    if (userExists) {
      return res.render('reg_user', { error: 'Email address is already registered. Please use a different email.' });
    }

    // Register the user if the email is not already registered
    const userRegistered = await db.registerUser(email, password);

    if (userRegistered) {
      return res.render('reg_user', { message: 'User registered successfully!!!' });
    } else {
      return res.render('reg_user', { error: 'User registration failed. Please try again.' });
    }

  } catch (error) {
    console.error('Error registering user:', error);
    return res.render('reg_user', { error: 'Registration failed. Please try again.' });
  }
});


app.get("/v_user/:ID/:status", async (req, res) => {
  const user_id = req.params.ID;
  const user_status = req.params.status;

  if(user_status == 'active'){
    const update_inactive = await db.update_user_inactive(user_id);
    res.redirect("/v_user");
  }else if(user_status == 'inactive'){
    const update_active = await db.update_user_active(user_id);
    res.redirect("/v_user");
  }
  
});

app.get("/v_user/:ID", async (req, res) => {
  const user_id = req.params.ID;
  const delete_user = await db.delete_user_u(user_id);
  res.redirect("/v_user");
  
});

app.post("/ulogin", async (req, res) => {
  const { email, password } = req.body;
  console.log(email,password);
  try {
    const user = await db.getUserByEmail(email);

    if (!user) {
      return res.render("index", { title: "Login", error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.render("index", { title: "Login", error: "Invalid credentials" });
    }

    req.session.user = { user_user: user.email };
    res.redirect("/user_dashboard");
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/user_dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/ulogin");
  }
  const user = req.session.user.user_user;
  res.render("user_dashboard", { title: 'User Dashboard', user });
});

app.get("/ulogout", (req, res) => {
  // Destroy the session data (logout)
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Internal Server Error");
    }
    // Redirect to the login page after logout
    res.redirect("/ulogin");
  });
});


// Run server!
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
