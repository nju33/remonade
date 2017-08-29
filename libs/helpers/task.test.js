// import Ssh from 'helpers/ssh';
import Volume from 'helpers/volume';
import Task from './task';

describe('Task', () => {
  describe('immidiate', () => {
    let task = null;
    // let ssh = null;
    beforeEach(() => {
      task = new Task(true, '/foo', 'echo 1');
      // ssh = new Ssh({
      //   hostname: '',
      //   host: '',
      //   identifyFile: ''
      // })
    });

    it('handles event', async () => {
      const handleEnd = jest.fn();
      const handleData = jest.fn();
      const handleError = jest.fn();
      task.on('end', handleEnd);
      task.on('data', handleData);
      task.on('error', handleError);

      task.emit('end');
      task.emit('data', 'data');
      task.emit('error', 'error');
      expect(handleEnd).toHaveBeenCalled();
      expect(handleData).toHaveBeenCalled();
      expect(handleData.mock.calls[0][0]).toBe('data');
      expect(handleError).toHaveBeenCalled();
      expect(handleError.mock.calls[0][0]).toBe('error');
    });

    test('associate volume', () => {
      const volume = new Volume([]);
      task.associate(volume);
      expect(task.volume).toBe(volume);
    });

    test('ready event', () => {
      const cb = jest.fn();
      task.on('ready', cb);
      task._handleReady('ready');
      expect(cb).toBeCalled();
    });

    test('end event', () => {
      const cb = jest.fn();
      task.on('end', cb);
      task._handleEnd('end');
      expect(cb).toBeCalled();
    });

    test('data event', () => {
      const cb = jest.fn();
      task.on('data', cb);
      task._handleData('data', 'data');

      expect(cb).toBeCalled();
      expect(cb).toBeCalledWith('data');
    });

    test('error event', () => {
      const cb = jest.fn();
      task.on('error', cb);
      task._handleError('error', 'error');

      expect(cb).toBeCalled();
      expect(cb).toBeCalledWith('error');
    });

    test('REMONADE_CHOKIDAR:READY event', () => {
      const cb = jest.fn();
      task.on('data', cb);
      task._handleChokidarReady();

      expect(cb).toBeCalled();
      expect(cb).toBeCalledWith('REMONADE_CHOKIDAR:READY');
    });

    test('REMONADE_CHOKIDAR:CHANGE event', () => {
      const cb = jest.fn();
      task.on('data', cb);
      task._handleChokidarChange();

      expect(cb).toBeCalled();
      expect(cb).toBeCalledWith('REMONADE_CHOKIDAR:CHANGE');
    });
  });
});
