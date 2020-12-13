import Tool from "../tool.js";
import { CONSTANTS } from "../../constants/constants.js";
import { getItemClass } from "../get-item-class.js";

export default class Knife extends Tool {
    // Text data
    name = "Knife";
    item = "Knife";
    examineText = "A dangerous looking knife.";

    // Other
    cost = 6;

    constructor(scene) {
        super();
        this.scene = scene;
    }

    async craft(item) {
        console.log("Combining", this.name, item.name);
        let className = "";
        let numRequiredItems = 0;
        let xpGiven = 0;
        switch (item.name) {
            case "Logs":
                className = "NormalShortbow";
                numRequiredItems = 50;
                xpGiven = 50;
                break;
            case "Oak Logs":
                className = "OakShortbow";
                numRequiredItems = 50;
                xpGiven = 100;
                break;
            default:
                console.log("Not a valid crafting combination.");
                break;
        }

        if (className != "" && item.numItems >= numRequiredItems) {
            if (this.dashboard == undefined) {
                this.dashboard = this.scene.scene.get(CONSTANTS.SCENES.DASHBOARD);
            }

            let newItem = await getItemClass(className, this.dashboard);
            if (this.dashboard.inventory.obj.addToInventory(newItem)) {
                item.setNumItems(item.numItems - numRequiredItems);
                this.scene.characterData.skills.fletching += xpGiven;
                this.scene.skills.obj.updateSkillsText();
            }
        }
    }
}
