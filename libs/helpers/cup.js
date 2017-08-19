export default class Cup {
  constructor(chankLength = 2) {
    this._chankLength = chankLength;
    this.data = [];
  }

  pour(data) {
    if (
      this.data.length > 0 &&
      data === this.data[this.data.length - 1]
    ) {
      return [];
    }

    if (typeof data === 'string') {
      data = [data];
    }
    this.data.push(...data);

    if (this.data.length > this._chankLength - 1) {
      const data = this.data;
      this.data = [];
      return data;
    }
    return [];
  }
}
