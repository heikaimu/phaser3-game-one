/*
 * @Description: Container
 * @Version: 2.0
 * @Autor: Yaowen Liu
 * @Date: 2021-01-12 13:34:24
 * @LastEditors: Yaowen Liu
 * @LastEditTime: 2021-01-12 13:36:50
 */
import Phaser from 'phaser';

export default class MyContainer extends Phaser.GameObjects.Container {
  constructor(scene:Phaser.Scene, x:number, y:number, children) {
    super(scene, x, y, children);

    scene.add.existing(this);
  }
}