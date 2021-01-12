import Phaser from 'phaser';

const createDemonAnims = (anims: Phaser.Animations.AnimationManager) => {
    anims.create({
        key: 'demon-idle',
        frames: anims.generateFrameNames('demon', { start: 0, end: 3, prefix: 'big_demon_idle_anim_f', suffix: '.png' }),
        frameRate: 6,
        repeat: -1
    })

    anims.create({
        key: 'demon-run',
        frames: anims.generateFrameNames('demon', { start: 0, end: 3, prefix: 'big_demon_run_anim_f', suffix: '.png' }),
        frameRate: 10,
        repeat: -1
    })
}

export {
    createDemonAnims
}