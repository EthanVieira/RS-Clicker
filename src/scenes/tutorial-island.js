import { CONSTANTS } from "../constants/constants.js";
import { LevelScene } from "./level.js";
// import NormalBones from "../items/bones/normal-bones.js";
import { GiantRat } from "../targets/enemies/giant-rat.js";

export class TutorialIslandScene extends LevelScene {
    constructor() {
        super({
            levelType: CONSTANTS.LEVEL_TYPE.ENEMY,
            key: CONSTANTS.SCENES.TUTORIAL_ISLAND,
            killQuest: 10,
            background: {
                name: "tutorial-island",
                path: "src/assets/backgrounds/TutorialIslandBackground.png"
            },
            minimap: {
                name: "tutorial-island-map",
                path: "src/assets/maps/TutorialIslandMap.png"
            },
            targets: [GiantRat],
            audio: { bgm: "newbie-melody" }
        });
    }
}
