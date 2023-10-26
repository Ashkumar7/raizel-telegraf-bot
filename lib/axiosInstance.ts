import Axios, { AxiosRequestConfig, AxiosResponse, type AxiosInstance } from 'axios';
import DotEnv from 'dotenv';
import { HttpsProxyAgent } from 'https-proxy-agent';

/** Load Environment Variables */
DotEnv.config({ path: '.env.local' });

/** Function To Generate Random Alphanumeric String */
const randomString = (length: number) => {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let index = 0; index < length; index++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return `session-${result}-lifetime-120`;
};

/** Initialize Tunnel */
const agent = new HttpsProxyAgent(
  `http://${process.env.PROXY_USERNAME}-${randomString(11)}:${process.env.PROXY_PASSWORD}@${process.env.PROXY_HOST}:${
    process.env.PROXY_PORT
  }`
);

/** Create a function to create an Axios instance with dynamic types */
const createAxiosInstance = <T>() => {
  try {
    const axiosInstance: AxiosInstance = Axios.create({
      baseURL: 'https://api.real-debrid.com:443',
      proxy: false,
      httpsAgent: agent,
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
