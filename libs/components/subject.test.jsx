import {h, renderToString} from 'ink';
import Subject from './subject';

test('Subject', () => {
  const result = renderToString(
    <Subject>foo</Subject>
  );
  expect(result.trim()).toMatch(/foo/);
});
