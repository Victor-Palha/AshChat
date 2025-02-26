import axios, { AxiosInstance } from 'axios'

export class PhoenixAPIClient {
    static server: AxiosInstance = axios.create({
        baseURL: 'http://localhost:8000/chat/api',
    })

    static setTokenAuth(token: string){
        this.server.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }

    static setHeader(key: string, value: string){
        this.server.defaults.headers.common[key] = value
    }
}
