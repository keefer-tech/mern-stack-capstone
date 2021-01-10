import axios from "axios";

const publicFetch = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
  timeout: 5000,
});

export { publicFetch };
