export default {
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
          command: 'yarn dev:script',
          endFlagPattarn: 'bundle\.js'
        }
      ],
      ssh: {
        hostname: '54.64.238.197',
        user: 'remonade',
        identifyFile: process.env.HOME + '/.ssh/remonade_ec2'
      }
    },
    gulp: {
      base: '/home/remonade/remonade/',
      color: 'red',
      tasks: [
        {
          immidiate: true,
          workdir: 'examples',
          command: 'yarn dev:style',
          endFlagPattarn: 'Finished \'style\''
        }
      ],
      ssh: {
        hostname: '54.64.238.197',
        user: 'remonade',
        identifyFile: process.env.HOME + '/.ssh/remonade_ec2'
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
};
