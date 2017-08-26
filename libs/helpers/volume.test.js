import Machine from 'helpers/machine';
import Ssh from 'helpers/ssh';
import Volume from './volume';

describe('Volume', () => {
  describe('local2remote', () => {
    let volume = null;
    beforeEach(() => {
      volume = new Volume([
        new Machine('local', undefined, '/'),
        new Machine('remote', undefined, '/', new Ssh({host: '0.0.0.0'}))
      ])
        .local`foo`
        .remote`bar`;
    });

    it('has machine name methods', () => {
      expect(volume.local).not.toBeUndefined();
      expect(volume.remote).not.toBeUndefined();
    });

    it('has from and to', () => {
      expect(volume.from.label).toBe('local');
      expect(volume.to.label).toBe('remote');
    });

    it('has paths', () => {
      expect(volume.path.local).toBe('/foo');
      expect(volume.path.remote).toBe('/bar');
    });

    it('has patterns', () => {
      expect(volume.pattern.local).toBe('/foo/**/*');
      expect(volume.pattern.remote).toBe('/bar/**/*');
    });
  });
});
