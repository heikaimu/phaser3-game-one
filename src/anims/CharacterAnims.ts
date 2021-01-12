import Phaser from 'phaser';

const createCharacterAnims = (anims: Phaser.Animations.AnimationManager) => {
    anims.create({
        key: 'elf-idle-down',
        frames: anims.generateFrameNames('elf', { start: 0, end: 3, prefix: 'elf_m_idle_anim_f', suffix: '.png' }),
        frameRate: 6,
        repeat: -1
    })

    anims.create({
        key: 'elf-run-down',
        frames: anims.generateFrameNames('elf', { start: 0, end: 3, prefix: 'elf_m_idle_anim_f', suffix: '.png' }),
        frameRate: 16,
        repeat: -1
    })

    anims.create({
        key: 'elf-hit-down',
        frames: [{ key: 'elf', frame: 'elf_m_hit_anim_f0.png' }]
    })
}

export {
    createCharacterAnims
}