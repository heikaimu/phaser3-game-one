import Phaser from 'phaser';

import { debugDraw } from '../utils/debug';
import { createCharacterAnims } from '../anims/CharacterAnims';
import { createDemonAnims } from '../anims/DemonAnims';
import { createTreasureAnims } from '../anims/TreasureAnims'

import '../characters/Elf';
import Elf from '../characters/Elf';

import Demon from '../enemies/Demon';

import Chest from '../items/Chest';

import { sceneEvents } from '../events/EventsCenter';

export default class Game extends Phaser.Scene {
    private elf!: Elf;
    // private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private demons!: Phaser.Physics.Arcade.Group;
    private knives!: Phaser.Physics.Arcade.Group;
    private sword!:Phaser.Physics.Arcade.Image;

    private elfDemonCollider?: Phaser.Physics.Arcade.Collider;

    constructor() {
        super('game')
    }

    preload() {
        // this.cursors = this.input.keyboard.createCursorKeys();
    }

    create() {

        this.scene.run('game-ui');

        createCharacterAnims(this.anims);
        createDemonAnims(this.anims);
        createTreasureAnims(this.anims);

        // 场地
        const map = this.make.tilemap({ key: 'dungeon' });
        const tileset = map.addTilesetImage('dungeon', 'tiles');

        map.createStaticLayer('Ground', tileset);
        const wallsLayer = map.createStaticLayer('Walls', tileset);

        wallsLayer.setCollisionByProperty({ collides: true });

        // chest
        const chests = this.physics.add.staticGroup({
            classType: Chest
        });
        const chestsLayer = map.getObjectLayer('Chests');

        chestsLayer.objects.forEach(chestObj => {
            chests.get(chestObj.x, chestObj.y, 'treasure');
        })

        // debugDraw(wallsLayer, this);

        // knife
        this.knives = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            maxSize: 3
        })

        // elf
        this.elf = this.add.elf(200, 200, 'elf');
        this.elf.setKnives(this.knives);

        // sword
        // this.sword = this.physics.add.image(this.elf.x, this.elf.y, 'sword');

        // enemies
        this.demons = this.physics.add.group({
            classType: Demon,
            createCallback: go => {
                const DemGo = go as Demon;
                DemGo.body.onCollide = true;
            }
        })

        const enemieLayer = map.getObjectLayer('Enemies');
        enemieLayer.objects.forEach(enemieObj => {
            this.demons.get(enemieObj.x, enemieObj.y, 'demon');
        })

        // 添加elf与墙壁的碰撞
        this.physics.add.collider(this.elf, wallsLayer);
        this.physics.add.collider(this.demons, wallsLayer);
        this.physics.add.collider(this.knives, wallsLayer, this.handleKnifeWallsLayerCollision, undefined, this);
        this.physics.add.collider(this.knives, this.demons, this.handleKnifeDemonCollision, undefined, this);
        this.physics.add.collider(this.elf, chests, this.handlePlayerChestCollision, undefined, this);

        this.elfDemonCollider = this.physics.add.collider(this.demons, this.elf, this.handlePlayerDemonCollision, undefined, this);

        // 添加摄像机
        this.cameras.main.startFollow(this.elf, true);

    }

    private handleKnifeWallsLayerCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
        obj1.destroy();
    }

    private handleKnifeDemonCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
        obj1.destroy();
        obj2.destroy();
    }

    private handlePlayerDemonCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
        const demon = obj2 as Demon;

        const dx = this.elf.x - demon.x;
        const dy = this.elf.y - demon.y;

        const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);

        this.elf.handleDamage(dir);

        sceneEvents.emit('player-health-changed', this.elf.health);

        if (this.elf.health <= 0) {
            this.elfDemonCollider ?.destroy();
        }
    }

    private handlePlayerChestCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
        const chest = obj2 as Chest;
        this.elf.setChest(chest);
    }

    update(t: number, dt: number) {

        if (this.elf) {
            this.elf.update();
        }

    }
}
