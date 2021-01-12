/*
 * @Description: 资源加载
 * @Version: 2.0
 * @Autor: Yaowen Liu
 * @Date: 2021-01-10 20:27:12
 * @LastEditors: Yaowen Liu
 * @LastEditTime: 2021-01-12 14:04:58
 */
import Phaser from 'phaser'

export default class Preloader extends Phaser.Scene {

    constructor() {
        super('preloader')
    }

    preload() {
        this.load.image('tiles', 'tiles/dungeon_tiles.png');
        this.load.tilemapTiledJSON('dungeon', 'tiles/dungeon-01.json');

        this.load.atlas('elf', 'character/elf.png', 'character/elf.json');
        this.load.atlas('demon', 'enemies/demon.png', 'enemies/demon.json');
        this.load.atlas('treasure', 'items/treasure.png', 'items/treasure.json');

        this.load.image('ui-heart-empty', 'ui/ui_heart_empty.png');
        this.load.image('ui-heart-full', 'ui/ui_heart_full.png');
        
        this.load.image('knife', 'weapons/weapon_knife.png');
        this.load.image('sword', 'weapons/weapon_anime_sword.png');
    }

    create() {
        this.scene.start('game');
    }

}