import { HealthBar } from "../../ui/health-bar.js";
import { Target } from "../target.js";
import { OBJECT_TYPES, EQUIPMENT } from "../../constants/constants.js";
import { calcLevel, getRequiredCombatSkill } from "../../utilities.js";
import { characterData } from "../../cookie-io.js";

export class Enemy extends Target {
    blueHitsplat;
    redHitsplat;
    hitsplatText;
    killGold;
    objectType = OBJECT_TYPES.ENEMY;

    // Target stats
    maxHealth = 0;
    attack = 1;
    strength = 1;
    defense = 1;
    magic = 1;
    ranged = 1;

    // Attack bonuses
    attackBonus = 0;
    strengthBonus = 0;
    magicBonus = 0;
    magicStrengthBonus = 0;
    rangedBonus = 0;
    rangedStrengthBonus = 0;

    // Defenses
    stabDefense = 0;
    slashDefense = 0;
    crushDefense = 0;
    magicDefense = 0;
    rangedDefense = 0;

    actions = [
        { text: "Attack", func: "clickTarget" },
        { text: "Examine", func: "examine" },
    ];

    constructor(data) {
        super(data);

        // Setup coordinates
        let hitSplatX = this.x;
        let hitSplatY = this.y + 50;
        let hitTextX = this.x;
        let hitTextY = this.y + 100;
        let barX = this.x;
        let barY = this.y - 40;

        // Get offsets if they exist
        if (data.barOffsetX != undefined) {
            barX += data.barOffsetX;
        }
        if (data.barOffsetY != undefined) {
            barY += data.barOffsetY;
        }
        if (data.splatOffsetX != undefined) {
            hitSplatX += data.splatOffsetX;
            hitTextX += data.splatOffsetX;
        }
        if (data.splatOffsetY != undefined) {
            hitSplatY += data.splatOffsetY;
            hitTextY += data.splatOffsetY;
        }

        // Add hitsplats
        this.blueHitsplat = data.scene.add
            .image(hitSplatX, hitSplatY, "blue-hitsplat")
            .setOrigin(0.5, 0)
            .setDepth(4)
            .setScale(0.3);
        this.blueHitsplat.visible = false;

        this.redHitsplat = data.scene.add
            .image(hitSplatX, hitSplatY, "red-hitsplat")
            .setOrigin(0.5, 0)
            .setDepth(4)
            .setScale(0.3);
        this.redHitsplat.visible = false;

        // Add damage text
        this.hitsplatText = data.scene.add
            .text(hitTextX, hitTextY, "1", {
                fill: "white",
            })
            .setOrigin(0.5, 0)
            .setDepth(5);
        this.hitsplatText.visible = false;

        // Add health bar
        this.progressBar = new HealthBar(data.scene, barX, barY, data.maxHealth);
        this.maxHealth = data.maxHealth;

        // Enemy specific vars
        this.killGold = data.killGold;
    }

    isClickable() {
        return true;
    }

    // Get weapon animation, otherwise fists
    getAnimation() {
        const weapon = this.scene.dashboard.equipment.equipment.WEAPON;
        if (weapon) {
            return weapon.getAnimation();
        } else {
            return {
                imageName: "fist",
                startX: 450,
                startY: 400,
                scale: 1,
                curve: 0,
                alpha: 1,
                flipx: false,
            };
        }
    }

    // Player: (attack/items/bonuses) and enemy:  (defense/bonuses) affects accuracy
    // Player: (strength/items/bonuses) affect max hit
    // Equal chance to deal (1 - max hit) damage if it hits
    getClickValue() {
        const weapon = this.scene.dashboard.equipment.equipment.WEAPON;

        // Get damage based on level
        // Normally for melee you would use strength for damage and attack for accuracy
        // But for now we'll use attack for both
        let damageLevel = this.getDamageLevel();

        // Get weapon stats and enemy bonuses
        let equipmenStrength = 0;
        let equipmentAttack = 0;
        let enemyBonus = 0;
        switch (weapon?.skill) {
            case EQUIPMENT.WEAPON_TYPES.MAGIC:
                equipmentAttack = weapon.magicBonus;
                equipmenStrength = weapon.magicStrengthBonus;
                enemyBonus = this.magicDefense;
                break;
            case EQUIPMENT.WEAPON_TYPES.RANGED:
                equipmentAttack = weapon.rangedBonus;
                equipmenStrength = weapon.rangedStrengthBonus;
                enemyBonus = this.rangedDefense;
                break;
            case EQUIPMENT.WEAPON_TYPES.MELEE: {
                equipmenStrength = weapon.strengthBonus;

                switch (weapon.style) {
                    case EQUIPMENT.ATTACK_STYLE.STAB:
                        equipmentAttack = weapon.stabBonus;
                        enemyBonus = this.stabDefense;
                        break;
                    case EQUIPMENT.ATTACK_STYLE.SLASH:
                        equipmentAttack = weapon.slashBonus;
                        enemyBonus = this.slashDefense;
                        break;
                    case EQUIPMENT.ATTACK_STYLE.CRUSH:
                        equipmentAttack = weapon.crushBonus;
                        enemyBonus = this.crushDefense;
                        break;
                }
                break;
            }
            // Unarmed uses crush type attack
            default:
                enemyBonus = this.crushDefense;
                break;
        }

        // Strength level bonuses
        let potBonus = 0;
        let styleBonus = 3; // Aggressive: 3, Controlled: 1, Accurate/Defensive: 0
        let prayerCoeff = 1; // Prayer gives multiplier (ex: 1.05)

        // Get damage level after bonuses
        let effectiveDamageLevel =
            Math.floor((damageLevel + potBonus) * prayerCoeff) + styleBonus;

        // Get max hit
        let maxHit = Math.floor(
            1.3 +
                effectiveDamageLevel / 10 +
                equipmenStrength / 80 +
                (effectiveDamageLevel * equipmenStrength) / 640
        );

        // Check accuracy
        let affinity = 55;
        let accuracy =
            this.calcLevelCoeff(damageLevel) + 2.5 * this.calcLevelCoeff(equipmentAttack);
        let defense =
            this.calcLevelCoeff(this.defense) + 2.5 * this.calcLevelCoeff(enemyBonus);
        let hitChance = affinity * (accuracy / defense);

        let rand = Math.random() * 100;
        let hitValue = 0;
        if (hitChance > rand || hitChance < 0) {
            // Handle case for negative armor
            hitValue = Math.floor(maxHit * (rand / 100) + 1);
        }

        const logHit = false;
        if (logHit) {
            console.log("----------------hit info-------------");
            console.log("player level", damageLevel);
            console.log("item str", equipmenStrength);
            console.log("item attack", equipmentAttack);
            console.log("enemy defense", this.defense);
            console.log("enemy bonus", enemyBonus);
            console.log("accuracy", accuracy);
            console.log("defense", defense);
            console.log("effective damage level", effectiveDamageLevel);
            console.log("hit chance", hitChance);
            console.log("max hit", maxHit);
            console.log("rolled", rand);
            console.log("Damage", hitValue);
        }

        return hitValue;
    }

    // .0008a^3 + 4a + 40
    calcLevelCoeff(level) {
        return 0.0008 * Math.pow(level, 3) + 4 * level + 40;
    }

    onClick(hitValue) {
        // Get bonus gold for using mouseclick to encourage user interaction
        this.scene.dashboard.inventory.addGold(hitValue);

        // Update stats
        this.stats.updateClickDamageStat(hitValue);

        // Update xp
        this.increaseXp(hitValue);

        // Display hit
        this.hitsplatText.text = hitValue;
        hitValue == 0
            ? (this.blueHitsplat.visible = true)
            : (this.redHitsplat.visible = true);
        this.hitsplatText.visible = true;

        // Hide hitsplat
        let _this = this;
        setTimeout(function () {
            _this.redHitsplat.visible = false;
            _this.blueHitsplat.visible = false;
            _this.hitsplatText.visible = false;
        }, 200);
    }

    onCompletion() {
        // Give extra gold if unit is killed
        this.scene.dashboard.inventory.addGold(this.killGold);
        console.log(this.name + " killed, getting " + this.killGold + " extra gold");

        // Update quest and stats
        this.scene.enemyKilled(this.varName);
    }

    getDamageLevel() {
        const skill = this.scene.dashboard.equipment.equipment.WEAPON?.skill;
        return calcLevel(characterData.getSkillXp(getRequiredCombatSkill(skill)));
    }

    increaseXp(hitValue) {
        const skill = this.scene.dashboard.equipment.equipment.WEAPON?.skill;

        // Increase attack/ranged/magic XP
        const xpModifier = 1; // OSRS has an xp mod of 4 but that's assuming your attack speed is much lower
        let xpIncrease = xpModifier * hitValue;
        characterData.addSkillXp(getRequiredCombatSkill(skill), xpIncrease);
    }
}
