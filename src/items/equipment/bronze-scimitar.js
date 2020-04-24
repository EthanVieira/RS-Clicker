import Equipment from "../equipment.js";
import { EQUIPMENT } from "../../constants/constants.js";

export default class BronzeScimitar extends Equipment {
    // Attack types
    slot = EQUIPMENT.SLOTS.WEAPON;
    skill = EQUIPMENT.WEAPON_TYPES.MELEE;
    style = EQUIPMENT.ATTACK_STYLE.SLASH;

    // Attack bonuses
    stabBonus = 1;
    slashBonus = 7;
    crushBonus = -2;
    rangedBonus = 0;
    magicBonus = 0;

    // Defense bonuses
    stabDefenseBonus = 0;
    slashDefenseBonus = 1;
    crushDefenseBonus = 0;
    magicDefenseBonus = 0;
    rangedDefenseBonus = 0;

    // Other bonuses
    strengthBonus = 6;
    rangedStrengthBonus = 0;
    magicStrengthBonus = 0;
    prayerBonus = 0;

    // Text data
    name = "Bronze Scimitar";
    item = "Scimitar";
    type = "Bronze";
    examineText = "A vicious, curved sword.";

    // Other
    cost = 32;
    requiredLevel = 1;

    constructor(scene) {
        super();

        this.scene = scene;
    }
}
