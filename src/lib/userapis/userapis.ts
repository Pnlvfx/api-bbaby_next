import config from '../../config/config';
import { catchError } from '../../coraline/cor-route/crlerror';

const userapis = {
  getIP: async () => {
    try {
      const url = `https://extreme-ip-lookup.com/json?key=${config.IP_LOOKUP_API_KEY}`;
      const res = await fetch(url, {
        method: 'get',
      });
      const userIpInfo = await res.json();
      if (!res.ok) throw new Error(userIpInfo?.msg);
      return userIpInfo as UserIpInfoProps;
    } catch (err) {
      throw catchError(err);
    }
  },
  validateEmail: (email: string) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  },
};

export default userapis;
