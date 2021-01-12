import Phaser, { Scene } from 'phaser';
import { sceneEvents } from '~/events/EventsCenter';
import { StateMachine, State } from '../state-machine/StateMachine';
import Chest from '../items/Chest';

declare global {
    namespace Phaser.GameObjects {
        interface GameObjectFactory {
            elf(x: number, y: number, texture: string, frame?: string | number): Elf
        }
    }
}

enum HealthState {
    IDLE,
    DAMAGE,
    DEAD
}

export default class Elf extends Phaser.Physics.Arcade.Sprite {
    private stateMachine: StateMachine;

    healthState = HealthState.IDLE;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    knives?: Phaser.Physics.Arcade.Group;
    activeChest?: Chest;
    coins: number = 0;
    speed: number = 100;
    _health: number = 3;
    direction: string = 'right';

    get health() {
        return this._health;
    }

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
        super(scene, x, y, texture, frame)

        this.cursors = this.scene.input.keyboard.createCursorKeys();

        this.stateMachine = new StateMachine('idle', {
            idle: new IdleState(),
            move: new MoveState(),
            throwKnife: new ThrowKnifeState(),
            attack: new AttackState(),
            collectCoin: new CollectCoinState(),
            getDamage: new GetDamage()
        }, [this.scene, this]);

    }

    setChest(chest: Chest) {
        this.activeChest = chest;
    }

    setKnives(knives: Phaser.Physics.Arcade.Group) {
        this.knives = knives;
    }

    handleDamage(dir: Phaser.Math.Vector2) {
        this.stateMachine.transition('getDamage', dir);
    }

    update() {
        if (this.healthState === HealthState.DAMAGE
            || this.healthState === HealthState.DEAD) {
            return;
        }

        this.stateMachine.step();
    }
}

Phaser.GameObjects.GameObjectFactory.register('elf', function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, texture: string, frame?: string | number) {
    var sprite = new Elf(this.scene, x, y, texture, frame)

    this.displayList.add(sprite)
    this.updateList.add(sprite)

    this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)

    sprite.body.setSize(sprite.width * 0.9, sprite.height * 0.8);
    sprite.body.offset.y = 7;

    return sprite
})

// 休息
class IdleState extends State {
    enter(scene: Phaser.Scene, elf: Elf) {
        elf.setVelocity(0, 0);
        elf.anims.play('elf-idle-down');
    }

    execute(scene: Phaser.Scene, elf: Elf) {
        const { left, right, up, down, space, shift } = elf.cursors;


        if (space.isDown) {

            if (elf.activeChest) {
                this.stateMachine.transition('collectCoin');
            } else {
                this.stateMachine.transition('throwKnife');
            }

            return;
        }

        if (shift.isDown) {
            this.stateMachine.transition('attack');
            return;
        }

        if (left.isDown || right.isDown || up.isDown || down.isDown) {
            this.stateMachine.transition('move');
            return;
        }
    }
}

// 移动
class MoveState extends State {
    execute(scene: Phaser.Scene, elf: Elf) {
        const { left, right, up, down, space, shift } = elf.cursors;

        if (space.isDown) {

            if (elf.activeChest) {
                this.stateMachine.transition('collectCoin');
            } else {
                this.stateMachine.transition('throwKnife');
            }

            return;
        }

        if (shift.isDown) {
            this.stateMachine.transition('attack');
            return;
        }

        if (!(left.isDown || right.isDown || up.isDown || down.isDown)) {
            this.stateMachine.transition('idle');
            return;
        }

        elf.setVelocity(0);

        if (left.isDown) {
            elf.anims.play('elf-run-down', true);
            elf.setVelocityX(-elf.speed);

            elf.scaleX = -1;
            elf.body.offset.x = 16;

            elf.direction = 'left';
        } else if (right.isDown) {
            elf.anims.play('elf-run-down', true);
            elf.setVelocityX(elf.speed);

            elf.scaleX = 1;
            elf.body.offset.x = 0;

            elf.direction = 'right';
        }

        if (up.isDown) {
            elf.setVelocityY(-elf.speed);

            elf.direction = 'up';
        } else if (down.isDown) {
            elf.setVelocityY(elf.speed);

            elf.direction = 'down';
        }
    }
}

// 受伤
class GetDamage extends State {
    enter(scene: Phaser.Scene, elf: Elf, dir) {
        elf._health--;

        if (elf._health <= 0) {
            elf.setVelocity(0, 0);
            elf.anims.play('elf-hit-down');

            elf.healthState = HealthState.DEAD;

            return;
        } else {
            elf.setVelocity(dir.x, dir.y);

            elf.setTint(0xff0000);

            elf.healthState = HealthState.DAMAGE;
        }

        scene.time.addEvent({
            delay: 300,
            callback: () => {
                elf.setVelocity(0);
                elf.setTint(0xffffff);

                elf.healthState = HealthState.IDLE;

                this.stateMachine.transition('idle');
            }
        })
    }
}

// 飞刀
class ThrowKnifeState extends State {
    enter(scene: Phaser.Scene, elf: Elf) {
        elf.setVelocity(0);
        elf.anims.play('elf-hit-down');

        if (!elf.knives) {
            this.stateMachine.transition('idle');
            return;
        }

        const knife = elf.knives.get(elf.x, elf.y, 'knife') as Phaser.Physics.Arcade.Image;

        if (knife) {

            const vec = new Phaser.Math.Vector2(0, 0);
            switch (elf.direction) {
                case 'left':
                    vec.x = -1;
                    vec.y = 0;
                    break;
                case 'right':
                    vec.x = 1;
                    vec.y = 0;
                    break;
                case 'up':
                    vec.x = 0;
                    vec.y = -1;
                    break;
                case 'down':
                    vec.x = 0;
                    vec.y = 1;
                    break;

                default:
                    break;
            }

            const angle = vec.angle();

            knife.setActive(true);
            knife.setVisible(true);

            knife.setRotation(angle);

            knife.x += vec.x * 16;
            knife.y += vec.y * 16;
            knife.setVelocity(vec.x * 200, vec.y * 200);
        }

        // elf.once('animationcomplete', () => {
        //     this.stateMachine.transition('idle');
        // })
        scene.time.addEvent({
            delay: 300,
            callback: () => {
                this.stateMachine.transition('idle');
            }
        })
    }
}

// 近战攻击
class AttackState extends State {
    enter(scene: Phaser.Scene, elf: Elf) {
        elf.setVelocity(0);

        const vec = new Phaser.Math.Vector2(0, 0);
        switch (elf.direction) {
            case 'left':
                vec.x = -1;
                vec.y = 0;
                break;
            case 'right':
                vec.x = 1;
                vec.y = 0;
                break;
            case 'up':
                vec.x = 0;
                vec.y = -1;
                break;
            case 'down':
                vec.x = 0;
                vec.y = 1;
                break;

            default:
                break;
        }

        const angle = vec.angle();

        const weapon = scene.physics.add.image(vec.x * 20, vec.y * 20, 'knife');
        weapon.setRotation(angle);

        scene.physics.world.enable(weapon);
        const container = scene.add.container(elf.x, elf.y, weapon);

        scene.time.addEvent({
            delay: 300,
            callback: () => {
                container.destroy();
                this.stateMachine.transition('idle');
            }
        })
    }
}

// 收集金币
class CollectCoinState extends State {
    enter(scene: Phaser.Scene, elf: Elf) {
        elf.setVelocity(0);

        if (!elf.activeChest) {
            return;
        }

        const coins = elf.activeChest.open();
        elf.coins += coins;
        sceneEvents.emit('player-coin-changed', elf.coins);

        scene.time.addEvent({
            delay: 300,
            callback: () => {
                elf.activeChest = undefined;
                this.stateMachine.transition('idle');
            }
        })
    }
}