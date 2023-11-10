import Axios, { AxiosRequestConfig, AxiosResponse, type AxiosInstance } from 'axios';
import DotEnv from 'dotenv';
import { HttpsProxyAgent } from 'hpagent';

/** Load Environment Variables */
DotEnv.config({ path: '.env.local' });

/** Initialize Tunnel */
const agent = new HttpsProxyAgent({
  proxy: `http://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`,
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 256,
  maxFreeSockets: 256,
});

/** Create a function to create an Axios instance with dynamic types */
const createAxiosInstance = <T>() => {
  try {
    const axiosInstance: AxiosInstance = Axios.create({
      baseURL: 'https://api.real-debrid.com:443',
      httpsAgent: agent,
      proxy: false,
      headers: {
        Authorization: `Bearer ${process.env.REAL_DEBRID_API_TOKEN}`,
      },
    });

    return {
      // Define a function to make a request with the provided types
      async request(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return axiosInstance(config);
      },
    };
  } catch (error) {
    console.log(error);
  }
};

export default createAxiosInstance;
