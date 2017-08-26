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
          command: 'yarn dev:script'
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
          workdir: '.',
          command: 'yarn dev:style'
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
      .local`examples/src/scripts`
      .webpack`${v.path.local}`,
    v => v
      .webpack`examples/dist/scripts`
      .local`${v.path.webpack}`,
    v => v
      .local`examples/dist/styles`
      .gulp`${v.path.local}`,
    v => v
      .gulp`examples/dist/styles`
      .local`${v.path.gulp}`
  ]
};
