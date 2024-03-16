controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    new_player_stance = sprites.readDataNumber(orange, "stance") + 1
    if (new_player_stance < 3) {
        sprites.setDataNumber(orange, "stance", new_player_stance)
        orange.setImage(orange_images[new_player_stance])
    }
})
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    timer.throttle("throw dagger", 2000, function () {
        dagger = sprites.create(image.create(16, 16), SpriteKind.Projectile)
        dagger.left = orange.x
        dagger.vx = -20
        animation.runImageAnimation(
        dagger,
        assets.animation`throwing dagger`,
        50,
        true
        )
    })
})
function dagger_hit (duelist: Sprite, dagger: Sprite) {
    if (sprites.readDataBoolean(duelist, "attacking")) {
        duelist.vx = duelist.vx * -1.25
    } else if (duelist.kind() == SpriteKind.Enemy) {
        sprites.destroy(duelist)
        sprites.destroy(dagger)
    } else {
        game.gameOver(false)
    }
}
scene.onOverlapTile(SpriteKind.Player, assets.tile`end`, function (orange, location) {
    game.over(true)
})
function enemy_behaviour (enemy: Sprite) {
    if (!(sprites.readDataBoolean(enemy, "stunned"))) {
        if (enemy.vx > max_enemy_speed) {
            enemy.vx += -0.5
        }
        if (!(sprites.readDataBoolean(enemy, "attacking"))) {
            if (randint(1, 60) == 1) {
                enemy_attack(enemy)
            }
            if (randint(1, 60) == 1) {
                randomise_enemy_stance(enemy)
            }
        }
    }
}
function player_movement () {
    if (controller.right.isPressed()) {
        orange.vx += speed
    } else if (controller.left.isPressed()) {
        orange.vx += speed * -1
    }
    orange.vx = orange.vx * deceleration
}
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (orange, red) {
    orange_stance = sprites.readDataNumber(orange, "stance")
    red_stance = sprites.readDataNumber(red, "stance")
    if (orange_stance == red_stance) {
        orange.vx += -25
        red.vx += 25
        scene.cameraShake(2, 100)
    } else if (sprites.readDataBoolean(orange, "attacking")) {
        red.destroy()
    } else {
        game.over(false)
    }
})
sprites.onOverlap(SpriteKind.Enemy, SpriteKind.Projectile, function (sprite, otherSprite) {
    dagger_hit(sprite, otherSprite)
})
function randomise_enemy_stance (enemy: Sprite) {
    current_stance = sprites.readDataNumber(enemy, "stance")
    if (!(current_stance == 1)) {
        current_stance = 1
    } else {
        current_stance += randint(-1, 1)
    }
    enemy.setImage(red_images[current_stance])
    sprites.setDataNumber(enemy, "stance", current_stance)
}
sprites.onOverlap(SpriteKind.Player, SpriteKind.Projectile, function (sprite, otherSprite) {
    dagger_hit(sprite, otherSprite)
})
controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    new_player_stance = sprites.readDataNumber(orange, "stance") - 1
    if (new_player_stance > -1) {
        sprites.setDataNumber(orange, "stance", new_player_stance)
        orange.setImage(orange_images[new_player_stance])
    }
})
function enemy_attack (enemy: Sprite) {
    sprites.setDataBoolean(enemy, "attacking", true)
    stance = sprites.readDataNumber(enemy, "stance")
    animation.runImageAnimation(
    enemy,
    red_animations[stance],
    40,
    false
    )
    timer.after(400, function () {
        stance = sprites.readDataNumber(enemy, "stance")
        enemy.setImage(red_images[stance])
        sprites.setDataBoolean(enemy, "attacking", false)
    })
}
scene.onHitWall(SpriteKind.Projectile, function (sprite, location) {
    sprites.destroy(sprite)
})
function player_attack () {
    sprites.setDataBoolean(orange, "attacking", true)
    stance = sprites.readDataNumber(orange, "stance")
    animation.runImageAnimation(
    orange,
    orange_animations[stance],
    40,
    false
    )
    timer.after(400, function () {
        stance = sprites.readDataNumber(orange, "stance")
        orange.setImage(orange_images[stance])
        sprites.setDataBoolean(orange, "attacking", false)
    })
}
function player_behaviour () {
    player_movement()
    if (sprites.readDataBoolean(orange, "attacking")) {
        return
    }
    if (controller.A.isPressed()) {
        player_attack()
    }
}
let enemy: Sprite = null
let stance = 0
let current_stance = 0
let red_stance = 0
let orange_stance = 0
let dagger: Sprite = null
let new_player_stance = 0
let orange: Sprite = null
let red_animations: Image[][] = []
let red_images: Image[] = []
let orange_animations: Image[][] = []
let orange_images: Image[] = []
let max_enemy_speed = 0
let deceleration = 0
let speed = 0
speed = 8
deceleration = 0.95
max_enemy_speed = -75
orange_images = [assets.image`orange low`, assets.image`orange mid`, assets.image`orange high`]
orange_animations = [assets.animation`orange attack low`, assets.animation`orange attack mid`, assets.animation`orange attack high`]
red_images = [assets.image`red low`, assets.image`red mid`, assets.image`red high`]
red_animations = [assets.animation`red attack low`, assets.animation`red attack mid`, assets.animation`red attack high`]
orange = sprites.create(assets.image`orange low`, SpriteKind.Player)
sprites.setDataNumber(orange, "stance", 0)
sprites.setDataBoolean(orange, "attacking", false)
tiles.setCurrentTilemap(tilemap`level`)
tiles.placeOnRandomTile(orange, assets.tile`orange spawn`)
scene.cameraFollowSprite(orange)
scene.setBackgroundColor(9)
game.onUpdate(function () {
    for (let value of sprites.allOfKind(SpriteKind.Enemy)) {
        enemy_behaviour(value)
    }
    player_behaviour()
})
game.onUpdateInterval(1500, function () {
    if (sprites.allOfKind(SpriteKind.Enemy).length < 3) {
        enemy = sprites.create(assets.image`red low`, SpriteKind.Enemy)
        sprites.setDataNumber(enemy, "stance", 0)
        enemy.setPosition(orange.x + 110, orange.y)
    }
})
