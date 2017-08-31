import Remonade from '.';

describe('adaptoConfig', () => {
  let config = null;
  beforeEach(async () => {
    config = await Remonade.adaptConfig({
      base: __dirname,
      color: 'green',
      machines: {
        webpack: {
          base: '/home/remonade/remonade/',
          color: 'blue',
          tasks: [
            {
              immidiate: true,
              workdir: 'examples',
              command: 'yarn dev:script'
            }
          ],
          ssh: {
            hostname: '54.64.238.197',
            user: 'remonade',
            identifyFile: process.env.HOME + '/.ssh/remonade'
          }
        },
        gulp: {
          base: '/home/remonade/remonade/',
          color: 'red',
          tasks: [
            {
              immidiate: true,
              workdir: 'examples',
              command: 'yarn dev:style'
            },
            {
              immidiate: false,
              workdir: 'examples',
              command: 'echo 1'
            },
            {
              immidiate: false,
              workdir: 'examples',
              command: 'echo 2'
            }
          ],
          ssh: {
            hostname: '54.64.238.197',
            user: 'remonade',
            identifyFile: process.env.HOME + '/.ssh/remonade'
          }
        }
      },
      volumes: [
        v => v
          .local`examples/src/scripts/`
          .webpack`examples/src/scripts/`,
        v => v
          .webpack`examples/dist/scripts/`
          .local`examples/dist/scripts/`,
        v => v
          .local`examples/src/styles/`
          .gulp`examples/src/styles/`,
        v => v
          .gulp`examples/dist/styles/`
          .local`examples/dist/styles/`
      ]
    });
  });

  it('has one local machine', () => {
    const machines = config.machines.filter(machine => machine.isLocal());
    expect(machines.length).toBe(1);
  });

  it('has two remote machine', () => {
    const machines = config.machines.filter(machine => !machine.isLocal());
    expect(machines.length).toBe(2);
  });

  it('has four volumes', () => {
    expect(config.volumes.length).toBe(4);
  });

  test('correct volume prop', () => {
    const [first, second, third, fourth] = config.volumes;
    expect(first.from.label).toBe('local');
    expect(first.to.label).toBe('webpack')
    expect(second.from.label).toBe('webpack');
    expect(second.to.label).toBe('local')
    expect(third.from.label).toBe('local');
    expect(third.to.label).toBe('gulp')
    expect(fourth.from.label).toBe('gulp');
    expect(fourth.to.label).toBe('local');
  });

  test('constructor', () => {
    const remonade = new Remonade(config);
    expect(remonade.config).toBeTruthy();
  });
});
