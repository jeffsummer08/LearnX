import axios from "axios"

const client = axios.create({ baseURL: "https://learn-x-server.onrender.com/", withCredentials: true })

export default client