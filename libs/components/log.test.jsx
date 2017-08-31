import {h, renderToString} from 'ink';
import Log from './log';

test('Log', () => {
  const result = renderToString(
    <Log
      rowLength={5}
      colLength={30}
      log={['log']}
    />
  );
  expect(result.trim()).toBe('log');
});
