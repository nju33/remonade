export default class Command {
  constructor(stream) {
    this.stream = stream;
  }

  run(commands = []) {
    this.stream.end(commands.join('\n'));
  }
}
