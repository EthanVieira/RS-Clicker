import { CONSTANTS } from "../constants/constants.js";
import { LevelScene } from "./level.js";
import NormalBones from "../items/bones/normal-bones.js";

export class LumbridgeScene extends LevelScene {
    constructor() {
        super({
            levelType: CONSTANTS.LEVEL_TYPE.ENEMY,
            key: CONSTANTS.SCENES.LUMBRIDGE,
            killQuest: 10,
            background: {
                name: "lumbridge",
                path: "src/assets/backgrounds/LumbridgeBackground.jpg"
            },
            minimap: {
                name: "lumbridge-map",
                path: "src/assets/maps/LumbridgeMap.png"
            },
            clickObjects: [
                {
                    name: "cow",
                    path: "src/assets/sprites/Cow.png",
                    maxHealth: 8,
                    killGold: 5,
                    drops: [{item: NormalBones, rate: .5}]
                },
                {
                    name: "goblin",
                    path: "src/assets/sprites/Goblin.png",
                    maxHealth: 5,
                    killGold: 3,
                    drops: [{item: NormalBones, rate: .5}]
                }
            ],
            audio: { bgm: "harmony" }
        });
    }
}
