# remonade

🍹 Choreography tool on remote machine

[![CircleCI](https://circleci.com/gh/nju33/remonade.svg?style=svg&circle-token=5654beeb24489ffea02fe20c5b9dddc645d3207b)](https://circleci.com/gh/nju33/remonade) [![codecov](https://codecov.io/gh/nju33/remonade/branch/master/graph/badge.svg?token=FCglV6gCFz)](https://codecov.io/gh/nju33/remonade)

## Install

```bash
npm i -D remonade
```

## How to use

### 1. Confirm that ssh can connect to the target server.

### 2. On that server create a user named `remonade`.

This is necessary to terminate all processes each time the connection closes.

> 
> Create the remonade user
> ```bash
> sudo adduser remonade
> ```
>

### 3. Create `remonade.config.js`

### 4. Clone current project onto the remote server

### 5. Run `remonade`


