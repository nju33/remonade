// import Ssh from 'helpers/ssh';
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

    test('ready event', () => {
      const cb = jest.fn();
      task.on('ready', cb);
      task.emit('ready');
      expect(cb).toBeCalled();
    });

    test('ready end', () => {
      const cb = jest.fn();
      task.on('end', cb);
      task.emit('end');
      expect(cb).toBeCalled();
    });

    test('ready data', () => {
      const cb = jest.fn();
      task.on('data', cb);
      task.emit('data', 'data');

      expect(cb).toBeCalled();
      expect(cb).toBeCalledWith('data');
    });
  });
});
