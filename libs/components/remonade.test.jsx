import {h, renderToString} from 'ink';
import Remonade from './remonade';

test('Remonade', () => {
  const config = {
    machines: [
      {
        label: 'foo',
        logs: ['hoge']
      },
      {
        label: 'bar',
        logs: ['fuga']
      }
    ]
  };

  const result = renderToString(
    <Remonade {...config} />
  );
  expect(result.trim()).toMatch(/foo/);
  expect(result.trim()).toMatch(/hoge/);
  expect(result.trim()).toMatch(/bar/);
  expect(result.trim()).toMatch(/fuga/);
});
