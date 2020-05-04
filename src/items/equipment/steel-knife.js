import Equipment from "../equipment.js";
import { EQUIPMENT } from "../../constants/constants.js";

export default class SteelKnife extends Equipment {
    // Attack types
    slot = EQUIPMENT.SLOTS.WEAPON;
    skill = EQUIPMENT.WEAPON_TYPES.RANGED;

    // Attack Bonuses
    rangedBonus = 8;

    // Strength Bonuses
    rangedStrengthBonus = 7;

    // Text data
    name = "Steel Knife";
    item = "Knife";
    type = "Steel";
    examineText = "A finely balanced throwing knife.";

    // Other
    cost = 110;
    requiredLevel = 5;

    constructor(scene) {
        super();

        this.scene = scene;
    }
}
