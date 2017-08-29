import Ssh from 'helpers/ssh';
import Machine from './machine';

describe('Machine', () => {
  describe('local', () => {
    let machine = null;
    beforeEach(() => {
      machine = new Machine('local', '/');
    });

    it('type is local', () => {
      expect(machine.type).toBe('local');
    });

    it('is local', () => {
      expect(machine.isLocal()).toBeTruthy();
    });
  });

  describe('remote', () => {
    let machine = null;

    beforeEach(() => {
      const ssh = new Ssh({
        user: 'foo',
        hostname: '0.0.0.0',
        identifyFile: 'aaa/bbb/ccc'
      });
      machine = new Machine('remote', undefined, '/', ssh);
    });

    it('has userHost', () => {
      expect(machine.userHost).toBe('foo@0.0.0.0');
    });

    it('has identifyFile', () => {
      expect(machine.identifyFile).toBe('aaa/bbb/ccc');
    });
  });

  describe('common', () => {
    let machine = null;

    beforeEach(() => {
      const ssh = new Ssh({
        username: 'foo',
        host: '0.0.0.0',
        identifyFile: 'aaa/bbb/ccc'
      });
      machine = new Machine('remote', undefined, '/', ssh);
    });

    test('logs', () => {
      machine.log('foo');
      machine.log(['bar', 'baz']);

      expect(machine.logs.length).toBe(3);
    });
  });
});
