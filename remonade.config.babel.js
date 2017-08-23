export default {
  // base: __dirname,
  remotes: [
    {
      label: 'typescript',
      base: '/home/remonade/remonade',
      ssh: {
        hostname: '54.64.238.197',
        user: 'remonade',
        identifyFile: process.env.HOME + '/.ssh/remonade_ec2'
      }
    },
    // {
    //   label: 'gulp',
    //   base: '/home/remonade/remonade',
    //   ssh: {
    //     hostname: '54.64.238.197',
    //     user: 'remonade',
    //     identifyFile: process.env.HOME + '/.ssh/remonade_ec2'
    //   }
    // }
  ],
  // ssh: {
  //   hostname: '54.64.238.197',
  //   user: 'remonade',
  //   identifyFile: process.env.HOME + '/.ssh/remonade_ec2'
  // },
  // base: {
  //   local: __dirname,
  //   remote: '/home/remonade/remonade'
  // },
  volumes: [
    volume => {
      console.log(volume);
      return volume
        .typescript`examples/dist/scripts`
        .local`examples/dist/scripts`;
    },
    // volume => volume
    //             .gulp`examples/dist/styles`
    //             .local`examples/dist/styles`,
    volume => volume
                .local`examples/src/scripts`
                .typescript`examples/src/scripts`
                .before`
                  (
                    cd examples &&
                    yarn lint
                  )
                `
                  .effect()
                  .onClose(() => console.log('end'))
                  .onError((err, {beeper, notify}) => beeper(2))
                  .end()
                .beforeOnce`
                  (
                    cd examples &&
                    yarn dev
                  )
                `
                  .effect()
                  .onError((err, {beeper, notify}) => beeper(2))
                // .afterSync`tsc examples/src/*.ts --outDir dist`,
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
