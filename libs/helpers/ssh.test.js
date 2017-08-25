import path from 'path';
import Ssh from './ssh';

describe('Ssh', () => {
  const identifyPath = path.resolve(__dirname, '../_fixtures/identifyFile');
  let ssh = null;

  beforeEach(() => {
    ssh = new Ssh({
      username: 'foo',
      host: '0.0.0.0',
      identifyFile: identifyPath
    });
  });

  test('access prop', () => {
    expect(ssh.username).toBe('foo');
    expect(ssh.host).toBe('0.0.0.0');
    expect(ssh.identifyFile).toBe(identifyPath);
  });

  test('set this privateKey', async () => {
    await ssh.init();
    expect(ssh.privateKey).toBe('identifyfile');
  });
});
