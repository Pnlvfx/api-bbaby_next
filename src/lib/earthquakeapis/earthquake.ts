import { catchError, catchErrorWithTelegram } from '../../coraline/cor-route/crlerror';
import coraline from '../../coraline/coraline';
import Community from '../../models/Community';
import Earthquake from '../../models/Earthquake';
import bbabyapis from '../bbabyapis/bbabyapis';
import earthquakeapis from './earthquakeapis';

export const useEarthquake = async () => {
  const earthquakes = await earthquakeapis.get();
  earthquakes.features.map(async (earthquake) => {
    try {
      const dbearthquake = new Earthquake(earthquake);
      await dbearthquake.save();
    } catch (err) {
      throw catchError(err);
    }
  });
  setInterval(earthquakeInfo, 60000 * 2);
};

const earthquakeInfo = async () => {
  try {
    console.log('new earthquake request');
    const earthquakeData = await earthquakeapis.get();
    earthquakeData.features.map(async (earthquake) => {
      const exist = await Earthquake.findOne({ id: earthquake.id });
      if (exist) return;
      if (earthquake.properties.mag >= 4) {
        if (earthquake.properties.place.includes('Italy')) {
          await earthquakePost(earthquake);
        } else {
          await earthquakePost(earthquake);
        }
      }
      const dbEathquake = new Earthquake(earthquake);
      await dbEathquake.save();
    });
  } catch (err) {
    catchErrorWithTelegram('bbabyapis.earthquakeInfo' + ' ' + err);
  }
};
const earthquakePost = async (earthquake: Earthquake) => {
  try {
    const user = await bbabyapis.newBot('earthquake');
    user.role = 1;
    await user.save();
    const { properties } = earthquake;
    const start = properties.mag >= 5.5 ? 'Breaking News: A massive earthquake' : 'News: An earthquake';
    const post = `${start} with a magnitude of ${properties.mag} strikes ${properties.place}. The tremors were felt on ${new Date(
      properties.time,
    ).toLocaleString()}. Stay safe, folks! 🌎💔`;
    let community = await Community.findOne({ name: 'Earthquake' });
    if (!community) {
      community = await bbabyapis.community.createCommunity(user, 'Earthquake');
    }
    //const tweet = `${post} #Earthquake #${properties.place.split(',')[1].trim()} #StaySafe`;
    const share = false; //process.env.NODE_ENV === 'production' ? true : false;
    await bbabyapis.post.newPost(user, post, community.name, {
      sharePostToTwitter: share,
      sharePostToTG: share,
    });
    await coraline.sendLog(post);
  } catch (err) {
    throw catchError(err);
  }
};
