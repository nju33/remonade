import EventEmitter from 'events';
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

    describe('run tasks', () => {
      test('data event in case of default', () => {
        const task = new EventEmitter();
        task.process = jest.fn().mockReturnThis();
        Object.defineProperty(machine, 'immidiatelyTasks', {
          get: jest.fn(() => [task])
        });

        const log = jest.spyOn(machine, 'log');
        machine.runImmidiatelyTasks();
        task.emit('data', 'default');
        expect(log).toHaveBeenCalledWith('default');
      });

      test('data event in case of ready and change', () => {
        const task = new EventEmitter();
        task.process = jest.fn().mockReturnThis();
        Object.defineProperty(machine, 'immidiatelyTasks', {
          get: jest.fn(() => [task])
        });

        const _runTasks = jest.spyOn(machine, '_runTasks');
        machine.runImmidiatelyTasks();
        task.emit('data', 'REMONADE_CHOKIDAR:READY');
        task.emit('data', 'REMONADE_CHOKIDAR:CHANGE');

        expect(_runTasks).toHaveBeenCalledTimes(2);
      });
    });
  });
});
