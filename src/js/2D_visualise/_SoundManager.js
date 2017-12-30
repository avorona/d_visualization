export default class WebAudioAPISoundManager {
  constructor(url) {
    this._checkForSupport();
    this.context;
    this.url = url;
    this.bufferList = {};
    this.playingSounds = {};
  }

  _checkForSupport() {
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      window.audioContext = new window.AudioContext();
      this.context = window.audioContext;
    } catch (e) {
      console.log('No Web Audio API support');
    }
  }

  _addSound() {
    let self = this;
    let url = self.url;
    // Load buffer asynchronously
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
      // Asynchronously decode the
      // audio file data in request.response
      self.context.decodeAudioData(
        request.response,

        function(buffer) {
          if (!buffer) {
            console.log('error decoding file data: ' + url);
            return;
          }
          self.bufferList[url] = buffer;
        }
      );
    };

    request.onerror = function() {
      console.log('BufferLoader: XHR error');
    };

    request.send();
  }

  stopSoundWithUrl(url) {
    if (this.playingSounds.hasOwnProperty(url)) {
      for (let i in this.playingSounds[url]) {
        if (this.playingSounds[url].hasOwnProperty(i)) {
          this.playingSounds[url][i].stop();
        }
      }
    }
  }
}
