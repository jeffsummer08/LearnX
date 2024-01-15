import axios from "axios"

const client = axios.create({ baseURL: "https://learnxserver.vercel.app", withCredentials: true })

export default client