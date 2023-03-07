import { catchError, catchErrorWithTelegram } from '../../coraline/cor-route/crlerror';
import coraline from '../../coraline/coraline';
import Community from '../../models/Community';
import Earthquake from '../../models/Earthquake';
import User from '../../models/User';
import bbabyapis from '../bbabyapis/bbabyapis';
import pexelsapi from '../pexelsapi/pexelsapi';
import twitterapis from '../twitterapis/twitterapis';
import earthquakeapis from './earthquakeapis';

const initial = async () => {
  try {
    await Earthquake.deleteMany({});
    const earthquakes = await earthquakeapis.get();
    earthquakes.features.map(async (earthquake) => {
      try {
        const dbearthquake = new Earthquake(earthquake);
        await dbearthquake.save();
      } catch (err) {
        throw catchError(err);
      }
    });
  } catch (err) {
    throw catchError(err);
  }
};
const earthquakeAI = async () => {
  try {
    const earthquakeData = await earthquakeapis.get();
    earthquakeData.features.map(async (earthquake) => {
      try {
        const exist = await Earthquake.findOne({ id: earthquake.id });
        if (exist) return;
        if (earthquake.properties.mag < 4.8) return;
        await earthquakePost(earthquake);
        const dbEathquake = new Earthquake(earthquake);
        await dbEathquake.save();
      } catch (err) {
        return;
      }
    });
  } catch (err) {
    catchErrorWithTelegram('bbabyapis.earthquakeInfo' + ' ' + err);
  }
};
const earthquakePost = async (earthquake: Earthquake) => {
  try {
    let user = await User.findOne({ username: 'earthquake' });
    if (!user) {
      user = await bbabyapis.newBot('earthquake');
      user.is_bot = false;
      user.role = 1;
      await user.save();
    }
    const { properties } = earthquake;
    const start = properties.mag >= 5.5 ? 'Breaking News: A massive earthquake' : 'News: An earthquake';
    const post = `${start} with a magnitude of ${properties.mag} strikes ${properties.place}. The tremors were felt on ${new Date(
      properties.time,
    ).toLocaleString()}. Stay safe, folks! 🌎💔`;
    let community = await Community.findOne({ name: 'Earthquake' });
    if (!community) {
      community = await bbabyapis.community.createCommunity(user, 'Earthquake', 'en');
    }
    const images = await pexelsapi.getImage('earthquake', {
      orientation: 'landscape',
    });
    const image = images[coraline.getRandomInt(images.length - 1)];
    await bbabyapis.post.newPost(user, post, community.name, {
      isImage: true,
      height: image.height,
      width: image.width,
      selectedFile: image.url,
    });
    const client = await twitterapis.getMyClient('bugstransfer');
    const tweet = `${post} #Earthquake #${properties.place.split(',')[1].trim()} #StaySafe`;
    await client.v1.tweet(tweet);
  } catch (err) {
    catchErrorWithTelegram(err);
  }
};

export const useEarthquakeAI = async (minuteInterval: number) => {
  initial();
  setInterval(earthquakeAI, minuteInterval * 60 * 1000);
};
