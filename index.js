import {h, render} from 'ink';
import RemonadeComponent from './components/remonade';

export default class Remonade {
	static render(opts = {}) {
		render(<RemonadeComponent {...opts}/>);
	}
};
