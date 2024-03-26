const cityModel = require('../model/cityModel.js');

exports.getAllCities = async (req, res, next) => {
  try {
    const cities = await cityModel.getAllCities();
    res.render('cities', { title: 'Cities', cities });
  } catch (error) {
    // Handle error
    next(error);
  }
};

exports.getCityById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const city = await cityModel.getCityById(id);
    if (city) {
      res.render('city_details', { title: 'City Details', city });
    } else {
      res.status(404).send('City not found');
    }
  } catch (error) {
    // Handle error
    next(error);
  }
};

// Implement similar methods for adding, updating, and deleting cities
