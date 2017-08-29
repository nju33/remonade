import Ssh from 'helpers/ssh';
import Task from 'helpers/task';
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

    test('throw when getting userHost', () => {
      expect(() => {
        // eslint-disable-next-line no-unused-expressions
        machine.userHost;
      }).toThrow();
    });

    test('throw when getting identifyFile', () => {
      expect(() => {
        // eslint-disable-next-line no-unused-expressions
        machine.identifyFile;
      }).toThrow();
    });

    test('getRsyncPath', () => {
      expect(machine.getRsyncPath('/')).toBe('/');
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
    /* eslint-disable */
    let task1 = null;
    let task2 = null;
    let task3 = null;
    /* eslint-enable */

    beforeEach(() => {
      const ssh = new Ssh({
        user: 'foo',
        hostname: '0.0.0.0',
        identifyFile: 'aaa/bbb/ccc'
      });
      machine = new Machine('remote', undefined, '/', ssh);
      machine.tasks.push((task1 = new Task(true, '', '')));
      machine.tasks.push((task2 = new Task(true, '', '')));
      machine.tasks.push((task3 = new Task(false, '', '')));
    });

    test('logs', () => {
      machine.log('foo');
      machine.log(['bar', 'baz']);

      expect(machine.logs.length).toBe(3);
    });

    test('getRsyncPath', () => {
      expect(machine.getRsyncPath('/home')).toBe('foo@0.0.0.0:/home');
    });

    test('immidiatelyTasks', () => {
      expect(machine.immidiatelyTasks.length).toBe(2);
    });

    test('nonImmidiatelyTasks', () => {
      expect(machine.nonImmidiatelyTasks.length).toBe(1);
    });

    // test('process', () => {
    //   machine.runImmidiatelyTasks();
    // });
  });
});
