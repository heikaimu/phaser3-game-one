import Phaser from 'phaser';
import { createCharacterAnims } from '~/anims/CharacterAnims';
import { sceneEvents } from '../events/EventsCenter';

export default class GameUI extends Phaser.Scene {
    private hearts: Phaser.GameObjects.Group;

    constructor() {
        super({ key: 'game-ui' });
    }

    create() {
        // coin
        this.add.image(6, 26, 'treasure', 'coin_anim_f0.png');
        const coinsLabel = this.add.text(12, 20, '0', {
            fontSize: '14'
        })

        sceneEvents.on('player-coin-changed', (coins: number) => {
            coinsLabel.text = coins.toLocaleString();
        })

        // health
        this.hearts = this.add.group({
            classType: Phaser.GameObjects.Image
        });

        this.hearts.createMultiple({
            key: 'ui-heart-full',
            setXY: {
                x: 10,
                y: 10,
                stepX: 16
            },
            quantity: 3
        });

        sceneEvents.on('player-health-changed', this.hanldePlayerHealthChanged, this);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            sceneEvents.off('player-health-changed', this.hanldePlayerHealthChanged, this);
        })
    }

    private hanldePlayerHealthChanged(health: number) {
        this.hearts.children.each((go, index) => {
            const heart = go as Phaser.GameObjects.Image;
            if (index < health) {
                heart.setTexture('ui-heart-full');
            } else {
                heart.setTexture('ui-heart-empty');
            }
        })
    }
}