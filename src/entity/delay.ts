import delayCodesData from '../../data/delaycodes.json';

export class Delay {
  code: number = 0;
  name: string = '';
  description: string = '';
  minutes_duration: number = 0;
  secondary: boolean = false;

  random() {
    const randomElement =
      delayCodesData.delaycodes[
        Math.floor(Math.random() * delayCodesData.delaycodes.length)
      ];
    let delay: Delay = new Delay();
    delay.code = randomElement.code;
    delay.name = randomElement.name;
    delay.description = randomElement.description;
    delay.minutes_duration = Math.floor(Math.random() * 180);
    delay.secondary = false;
    return delay;
  }
}
