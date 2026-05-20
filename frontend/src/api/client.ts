import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:8000',  // change to your backend URL
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})

export default client