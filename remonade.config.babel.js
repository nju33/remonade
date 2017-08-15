export default {
  ssh: {
    hostname: '54.64.238.197',
    user: 'ec2-user',
    identifyFile: process.env.HOME + '/.ssh/ec2_id'
  },
  base: {
    [__dirname]: '/home/ec2-user'
  },
  volumes: [
    {
      local: 'src/scripts',
      remote: 'remote/aaa',
      handleChangeCommand: '...'
    },
    {
      local: 'src/styles',
      remote: 'remote/styles',
      handleChangeCommand: '...'
    }
  ],
  commands: [
    'echo 1',
    'sleep 3',
    'tsc --watch'
  ]
};
