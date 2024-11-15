import axios, { AxiosInstance } from 'axios'

class ApiClient {
    static server: AxiosInstance = axios.create({
        baseURL: 'http://localhost:3005/api'
    })

    static setTokenAuth(token: string){
        this.server.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
}

export default ApiClient
