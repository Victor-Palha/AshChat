import axios, { AxiosInstance } from 'axios'

export class AuthAPIClient {
    static server: AxiosInstance = axios.create({
        baseURL: 'http://localhost:8000/auth/api'
    })

    static setTokenAuth(token: string){
        this.server.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }

    static setHeader(key: string, value: string){
        this.server.defaults.headers.common[key] = value
    }
}
