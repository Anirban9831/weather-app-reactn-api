import axios from "axios";
import { apiKey } from "../constants";

const forecastEndpoint = (params) =>
  `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${params.cityName}&days=${params.days}&aqi=no&alerts=no`;

const locationsEndpoint = (params) =>
  `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${params.cityName}`;

const apicall = async (endpoint) => {
  const options = {
    method: "GET", // Corrected method
    url: endpoint,
  };
  try {
    const response = await axios.request(options);
    return response.data; // Return the response data
  } catch (err) {
    console.error("Error making API call", err);
    return null;
  }
};

export const fetchWeatherForecast = (params) => {
  if (!params || !params.cityName || !params.days) {
    console.error("Missing parameters for fetchWeatherForecast");
    return null;
  }
  const forecastUrl = forecastEndpoint(params);
  return apicall(forecastUrl);
};

export const fetchLocations = (params) => {
  if (!params || !params.cityName) {
    console.error("Missing parameters for fetchLocations");
    return null;
  }
  const locationUrl = locationsEndpoint(params);
  return apicall(locationUrl);
};
