import { CONSTANTS, EQUIPMENT } from "../constants/constants.js";
import { getItemClass } from "../utilities.js";
import { characterData } from "../cookie-io.js";

export class Equipment {
    scene;

    // Images
    equipment = {
        WEAPON: {},
    };
    slotBg = {
        WEAPON: {},
    };

    constructor(scene) {
        this.scene = scene;

        this.slotBg.WEAPON = scene.add
            .image(587, 304, "equipment-background")
            .setDepth(2)
            .setVisible(false);

        // Update and show equipment on startup
        this.refreshEquipment();
    }

    // Load equipment on startup
    async refreshEquipment() {
        const playerEquipment = characterData.getAllEquipment();

        for (let i in playerEquipment) {
            if (Object.keys(playerEquipment[i]).length) {
                let newEquipment = await getItemClass(playerEquipment[i], this.scene);
                newEquipment.createSprite(0, 0);
                newEquipment.equip();
            }
        }
    }

    // Add to specific index
    equipItem(item) {
        // Remove previously equipped item if there is one
        if (Object.keys(this.equipment[item.slot]).length) {
            console.log("Unequiping previous item", this.equipment[item.slot].name);
            this.equipment[item.slot].unequip();
        }

        // Add to saved data
        characterData.setEquipment(item.slot, item.constructor.name);

        // Put into the right position
        switch (item.slot) {
            case EQUIPMENT.SLOTS.WEAPON:
                item.move(587, 303);
                break;
            default:
                console.log("Bad equipment slot", item.slot);
                item.move(587, 303);
                break;
        }

        // Hide if equipment is not selected
        let showItem = this.scene.currentPanel == CONSTANTS.PANEL.EQUIPMENT;
        item.setVisible(showItem);
        this.slotBg[item.slot].visible = showItem;

        // Add object to the scene
        this.equipment[item.slot] = item;
    }

    unequipItem(slot) {
        this.slotBg[slot].visible = false;
        this.equipment[slot] = {};
        characterData.setEquipment(slot, {});
    }

    showEquipment(isVisible) {
        if (isVisible) {
            this.scene.currentPanel = CONSTANTS.PANEL.EQUIPMENT;
        }
        Object.entries(this.equipment).forEach(([item, itemObj]) => {
            if (Object.keys(itemObj).length) {
                itemObj.setVisible(isVisible);
                this.slotBg[item].setVisible(isVisible);
            } else {
                this.slotBg[item].setVisible(false);
            }
        });
    }

    destroy() {
        Object.entries(this.equipment).forEach(([item, itemObj]) => {
            if (Object.keys(itemObj).length) {
                itemObj.destroy(false);
            }
        });
    }
}
