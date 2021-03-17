
module.exports = class {
  constructor (cb) {
    this.callback = cb;
    this.observers = [];
    this.isStarted = false;
  }

  addObserver (observer) {
    this.observers.push(observer);
  }

  removeObserver (observer) {
    const index = this.observers.findIndex(item => item === observer);

    this.observers.splice(index, 1);
    this.isCompleted();
  }

  isCompleted () {
    if (this.isStarted && !this.observers.length) {
      this.callback();
    }
  }

  start (msg) {
    this.isStarted = true;
    console.log(msg);
  }
};
