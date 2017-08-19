export default {
  ssh: {
    hostname: '54.64.238.197',
    user: 'ec2-user',
    identifyFile: process.env.HOME + '/.ssh/ec2_id'
  },
  base: {
    local: __dirname,
    remote: '/home/ec2-user/remotes/remonade'
  },
  volumes: [
    volume => volume
                .local`examples/src/`
                .remote`examples/src/`
                .beforeSync`tsc/examples/src/*.ts --outDir dist --watch`
                .afterSync`tsc examples/src/*.ts --outDir dist`,
    // volume => volume
    //             .remote`remote/dist/**/*`
    //             .local`src/dist/**/*`
    // {
    //   main: 'local',
    //   commands: [
    //     'yarn tsc'
    //   ],
    //   local: 'src/scripts',
    //   remote: 'remote/scripts'
    // },
    // {
    //   main: 'remote'
    //   remote: 'remote/scripts/**/*.js',
    //   local: 'dist/'
    // }
    // {
    //   main: 'local',
    //   commands: [
    //     'yarn gulp styles'
    //   ],
    //   local: 'src/styles',
    //   remote: 'remote/styles'
    // }
  ],
  commands: [
    'echo 1',
    'sleep 3',
    'tsc --watch'
  ]
};
