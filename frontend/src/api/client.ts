import axios from 'axios'

const client = axios.create({
  baseURL: 'https://resume-matcher-rpbz.onrender.com',  // change to your backend URL
  
})

export default client