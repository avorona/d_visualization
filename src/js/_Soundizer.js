import PubSub from 'pubsub-js';
import WebAudioAPISoundManager from './_SoundManager';

export default class WebAudioAPISound {
  constructor(url) {
    this.url = url + '.mp3';
    window.webAudioAPISoundManager =
      window.webAudioAPISoundManager || new WebAudioAPISoundManager(this.url);
    this.manager = window.webAudioAPISoundManager;
    this.manager._addSound(this.url);
  }

  play(options) {
    let url = this.url;

    let buffer = this.manager.bufferList[url];
    // console.log(buffer);
    this.settings = {
      loop: true,
      volume: 0.5
    };

    for (var i in options) {
      if (options.hasOwnProperty(i)) {
        this.settings[i] = options[i];
      }
    }

    //Only play if it's loaded yet
    if (typeof buffer !== 'undefined') {
      let source = this.makeSource(buffer);
      source.loop = this.settings.loop;
      source.start(0);

      if (!this.manager.playingSounds.hasOwnProperty(this.url)) {
        this.manager.playingSounds[this.url] = [];
      }
      this.manager.playingSounds[this.url].push(source);
    }
  }

  stop() {
    this.manager.stopSoundWithUrl(this.url);
  }

  makeSource(buffer) {
    // console.log(this);
    let source = this.manager.context.createBufferSource();
    let gainNode = this.manager.context.createGain();
    let analyser = this.analyser(buffer);
    gainNode.gain.value = this.settings.volume;
    this.GainNode = this.manager.context.GainNode;
    source.buffer = buffer;
    source.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(this.manager.context.destination);
    // console.log(gainNode.gain.value);
    return source;
  }

  changeVolume(element) {
    // console.log(element);
    // let val = element.value;
    let fraction = parseInt(element.value) / parseInt(element.max);
    // Let's use an x*x curve (x-squared) since simple linear (x) does not
    // sound as good.
    this.manager.context.GainNode = fraction * fraction;

    // console.log(this.manager.context.GainNode);
  }

  analyser(buffer) {
    let analyser = this.manager.context.createAnalyser();

    analyser.fftSize = 256;

    let bufferLength = analyser.frequencyBinCount;

    let frequencyData = new Uint8Array(bufferLength);

    analyser.getByteTimeDomainData(frequencyData);

    // analyser.getByteFrequencyData(frequencyData);

    // console.log(frequencyData);
    // analyser.getByteFrequencyData(frequencyData)
    const topic = 'sound';

    PubSub.publish(topic, { data_fr: frequencyData, operator: analyser });

    return analyser;
  }
}
