// const mysql = require("mysql2");

// /* Setup database connection */
// const db = mysql.createConnection({
//   host: process.env.DATABASE_HOST || "localhost",
//   user: "user",
//   password: "password",
//   database: "world",
// });


// class CityModel {
//   constructor() {}

//   async getAllCities() {
//     try {
//       const [rows, fields] = await db.query("SELECT * FROM cities");
//       return [rows, fields];
//     } catch (error) {
//       throw new Error('Error fetching cities from the database');
//     }
//   }

//   async getCityById(id) {
//     try {
//       const [rows] = await db.execute("SELECT * FROM `city` WHERE id = ?", [id]);
//       return rows.length ? rows[0] : null;
//     } catch (error) {
//       throw new Error('Error fetching city details from the database');
//     }
//   }

//   async addCity(cityData) {
//     // Implement logic to add a new city to the database
//   }

//   async updateCity(id, cityData) {
//     // Implement logic to update city details in the database
//   }

//   async deleteCity(id) {
//     // Implement logic to delete a city from the database
//   }
// }

// module.exports = new CityModel();

export default class City {
  id;
  name;
  countryCode;
  district;
  population;
  country;

  constructor(id, name, countryCode, district, population) {
      this.id = id;
      this.name = name;
      this.countryCode = countryCode;
      this.district = district;
      this.population = population;
  }
}
