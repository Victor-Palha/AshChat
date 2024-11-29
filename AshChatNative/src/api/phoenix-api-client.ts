import axios, { AxiosInstance } from 'axios'

export class PhoenixAPIClient {
    static server: AxiosInstance = axios.create({
        baseURL: 'http://localhost:4000/api',
    })

    static setTokenAuth(token: string){
        this.server.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
}
