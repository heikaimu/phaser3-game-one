/*
 * @Description: 
 * @Version: 2.0
 * @Autor: Yaowen Liu
 * @Date: 2021-01-10 20:15:10
 * @LastEditors: Yaowen Liu
 * @LastEditTime: 2021-01-12 14:20:51
 */
import Phaser from 'phaser'

import Preloader from './scenes/Preloader'
import Game from './scenes/Game'
import GameUI from './scenes/GameUI';

const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 },
			debug: true
		},
	},
	scene: [Preloader, Game],
	scale: {
		zoom: 1
	}
}

export default new Phaser.Game(config)
