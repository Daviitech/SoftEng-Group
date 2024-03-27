import mysql from "mysql2/promise";
import City from "../model/cityModel.mjs";
import Country from "../model/country.mjs";

export default class DatabaseService { 
    conn;

    constructor(conn) {
        this.conn = conn;
    }

    /* Establish database connection and return the instance */
    static async connect() {
        const conn = await mysql.createConnection({
            host: process.env.DATABASE_HOST || "localhost",
            user: "user",
            password: "password",
            database: "world",
        });

        console.log('Connection to DB Successful!');

        return new DatabaseService(conn);
    }

    /* Get a list of all cities */
    async getCities() {
        try {
            // Fetch cities from database
            const data = await this.conn.execute("SELECT * FROM `city`");
            return data;
        } catch (err) {
            // Handle error...
            console.error(err);
            return undefined;
        }
    }

    /* Get a particular city by ID, including country information */
    async getCity(cityId) {
        const sql = `
        SELECT city.*, country.Name AS Country, country.Region, country.Continent, country.Population as CountryPopulation
        FROM city
        INNER JOIN country ON country.Code = city.CountryCode
        WHERE city.ID = ${cityId}
    `;
        const [rows, fields] = await this.conn.execute(sql);
        /* Get the first result of the query (we're looking up the city by ID, which should be unique) */
        const data = rows[0];
        const city = new City(
            data.ID,
            data.Name,
            data.CountryCode,
            data.District,
            data.Population
        );
        const country = new Country(
            data.Code,
            data.Country,
            data.Continent,
            data.Region,
            data.CountryPopulation
        );
        city.country = country;
        return city;
    }

    // Update cities Population
    async updatePopulation(cityId, newPopulation) {
        try {
          const sql = "UPDATE city SET Population = ? WHERE ID = ?";
          const [result] = await this.conn.execute(sql, [newPopulation, cityId]);
          return result;
        } catch (error) {
          throw new Error("Error updating population in the database");
        }
      }

   // Delete city method in database service
    async deleteCity(cityId) {
        try {
        const sql = "DELETE FROM city WHERE ID = ?";
        const [result] = await this.conn.execute(sql, [cityId]);
        return result.affectedRows > 0; // Return true if at least one row was affected
        } catch (error) {
        console.error("Error deleting city from the database:", error);
        throw new Error("Error deleting city from the database");
        }
    }

    // Search City Method
    async searchCities(cityName) {
        try {
        const [rows] = await this.conn.execute("SELECT * FROM `city` WHERE Name LIKE ?", [`%${cityName}%`]);
        return rows;
        } catch (error) {
        throw new Error("Error searching for cities in the database");
        }
      }

    /* Get a list of countries */
    async getCountries() {
        const sql = `SELECT * FROM country`;
        const [rows, fields] = await this.conn.execute(sql);
        const countries = rows.map(c => new Country(c.Code, c.Name, c.Continent, c.Region, c.Population));
        return countries;
    }
}