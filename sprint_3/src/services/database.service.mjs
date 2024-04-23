import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
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

    async authenticateadmin(username, password) {
        try {
          // Trim whitespace characters from username
          username = username.trim();
          password = password.trim();

          console.log("Attempting to authenticate user:", username);
      
          const [rows] = await this.conn.execute("SELECT * FROM admin WHERE username = ?", [username]);
          const user = rows[0];
      
          if (!user) {
            console.log("User not found for username:", username);
            return null; // User not found
          } else if (user.password != password) {
            console.log("Invalid password for username:", username, "Password:", user.password);
            return false; // Invalid password
          } else {
            console.log("User authenticated successfully:", username);
            return true; // Authentication successful
          }
      
          
        } catch (error) {
          console.error("Error during user authentication:", error);
          throw new Error("Internal Server Error");
        }
      }

      async verify_email(email){
        email = email.trim();
        const [rows] = await this.conn.execute("SELECT * FROM user WHERE email = ?", [email]);
        return rows.length > 0;

      }

      async registerUser(email, password){
        const hashedPassword = await bcrypt.hash(password, 10);
        try{
          const [result] = await this.conn.execute('INSERT INTO user (email, password, status) VALUES (?, ?, ?)', [email, hashedPassword, "active"]);
          console.log("Registeration successful");
          return true; 
        } catch (error){
          throw error;
        }
      }

      async getUsers() {
        try {
            // Fetch user(s) from database
            const data = await this.conn.execute("SELECT * FROM `user`");
            return data;
        } catch (err) {
            // Handle error...
            console.error(err);
            return undefined;
        }
    }

      async update_user_inactive(user_id){
        const user_status = 'inactive';
        const sql = "UPDATE user SET status = ? WHERE ID = ?";
        const [result] = await this.conn.execute(sql, [user_status, user_id]);
        return result.affectedRows > 0;
      }

      async update_user_active(user_id){
        const user_status = 'active';
        const sql = "UPDATE user SET status = ? WHERE ID = ?";
        const [result] = await this.conn.execute(sql, [user_status, user_id]);
        return result.affectedRows > 0;
      }

      async delete_user_u(user_id){
        const sql = "DELETE FROM user WHERE ID = ?";
        const [result] = await this.conn.execute(sql, [user_id]);
        return result.affectedRows > 0; // Return true if at least one row was affected
      }

      async getUserByEmail(email) {
        const [rows] = await this.conn.execute("SELECT * FROM users WHERE email = ?", [email]);
        return rows[0]; // Return the first matching user or undefined
      }

      async passwordMatch(plainPassword, hashedPassword) {
        try {
          // Compare the provided plain-text password with the hashed password
          const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
          return isMatch;
        } catch (error) {
          console.error('Error comparing passwords:', error);
          throw new Error('Password comparison error');
        }
      }
}