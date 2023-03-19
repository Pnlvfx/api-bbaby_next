import { catchError, catchErrorWithTelegram } from '../../coraline/cor-route/crlerror';
import coraline from '../../coraline/coraline';
import Community from '../../models/Community';
import Earthquake from '../../models/Earthquake';
import User from '../../models/User';
import bbabyapis from '../bbabyapis/bbabyapis';
import bbabycommunity from '../bbabyapis/route/bbabycommunity/bbabycommunity';
import bbabypost from '../bbabyapis/route/bbabypost/bbabypost';
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
        await earthquakePost(earthquake.properties);
        const dbEathquake = new Earthquake(earthquake);
        await dbEathquake.save();
      } catch (err) {
        throw catchError(err);
      }
    });
  } catch (err) {
    catchErrorWithTelegram('bbabyapis.earthquakeInfo' + ' ' + err);
  }
};
const earthquakePost = async (properties: Earthquake['properties']) => {
  try {
    let user = await User.findOne({ username: 'earthquake' });
    if (!user) {
      user = await bbabyapis.newBot('earthquake');
      user.is_bot = false;
      user.role = 1;
      await user.save();
    }
    const start = properties.mag >= 5.5 ? 'Breaking News: A massive earthquake' : 'News: An earthquake';
    const post = `${start} with a magnitude of ${properties.mag} strikes ${properties.place}. The tremors were felt on ${new Date(
      properties.time,
    ).toLocaleString()}. Stay safe, folks! 🌎💔`;
    let community = await Community.findOne({ name: 'Earthquake' });
    if (!community) {
      community = await bbabycommunity.createCommunity(user, 'Earthquake', 'en');
    }
    const images = await pexelsapi.getImage('earthquake', {
      orientation: 'landscape',
    });
    const image = images[coraline.getRandomInt(images.length - 1)];
    await bbabypost.newPost(user, post, community.name, {
      isImage: true,
      height: image.height,
      width: image.width,
      selectedFile: image.src.original,
    });
    if (process.env.NODE_ENV === 'development') return;
    const client = await twitterapis.getMyClient('bugstransfer');
    let hashtags = '#Earthquake';
    if (properties.place.includes(',')) {
      hashtags += ` #${properties.place.split(',')[1]?.trim().replaceAll(' ', '')}`;
    } else {
      hashtags += ` #${properties.place.replaceAll(' ', '')}`;
    }
    hashtags += ' #StaySafe';
    await client.v1.tweet(`${post} ${hashtags}`);
  } catch (err) {
    catchErrorWithTelegram(err);
  }
};

export const useEarthquakeAI = async (minuteInterval: number) => {
  initial();
  setInterval(earthquakeAI, minuteInterval * 60 * 1000);
};
