import path from 'path';
import Ssh from './ssh';

describe('Ssh', () => {
  const identifyPath = path.resolve(__dirname, '../_fixtures/identifyFile');
  let ssh = null;

  beforeEach(() => {
    ssh = new Ssh({
      hostname: '0.0.0.0',
      identifyFile: identifyPath
    });
  });

  test('access prop', () => {
    expect(ssh.user).toBe('remonade');
    expect(ssh.hostname).toBe('0.0.0.0');
    expect(ssh.identifyFile).toBe(identifyPath);
  });

  test('set this privateKey', async () => {
    const _runConnection = jest
      .spyOn(ssh, '_runConnection')
      .mockImplementation(() => {
        ssh.conn.emit('ready');
      });
    await ssh.init();
    expect(ssh.privateKey.trim()).toBe('identifyfile');
    expect(_runConnection).toHaveBeenCalled();
  });
});
