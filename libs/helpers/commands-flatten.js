import R from 'ramda';
import trimMap from 'helpers/trim-map';

export default R.pipe(
  R.flatten,
  trimMap
);
