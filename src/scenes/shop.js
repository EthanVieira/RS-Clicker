// TODO: gray out items that are too expensive
import { characterData } from "../cookie-io.js";
import { calcLevel, getItemClass } from "../utilities.js";
import { CONSTANTS, FONTS } from "../constants/constants.js";
import { itemManifest } from "../items/item-manifest.js";
import { getAutoclickerClass } from "../auto-clickers/auto-clicker.js";
import { autoclickerManifest } from "../auto-clickers/auto-clicker-manifest.js";
import { ScrollWindow } from "../ui/scroll-window.js";

export class ShopScene extends Phaser.Scene {
    // Scenes
    audio;
    scrollWindow;

    background;
    loadingText;
    exitButton;

    shopIcons = [];
    currentGold = 0;

    weaponsButton;
    weaponsText;
    toolsButton;
    toolsText;
    consumablesButton;
    consumablesText;
    clanButton;
    clanText;

    constructor() {
        super({
            key: CONSTANTS.SCENES.SHOP,
        });
    }

    preload() {
        // Shop Interface
        this.load.image("shop-interface", "src/assets/ui/ShopInterface.png");
        this.load.image("shop-button", "src/assets/ui/buttons/ShopButton.png");
        this.load.image("shop-exit-button", "src/assets/ui/buttons/ShopExitButton.png");

        // Cash Stack Images
        let stacks = ["5", "25", "100", "250", "1k", "10k"];
        for (let i = 0; i < stacks.length; i++) {
            this.load.image(
                stacks[i],
                "src/assets/coin-stacks/" + stacks[i] + "-Stack.png"
            );
        }
    }

    create() {
        // Run chat scene but hide the bottom buttons after create
        this.scene.run(CONSTANTS.SCENES.CHAT);
        let chatScene = this.scene.get(CONSTANTS.SCENES.CHAT);
        chatScene.events.once("create", () => {
            chatScene.hideButtons();
        });

        // Add background
        this.background = this.add
            .image(0, 0, "shop-interface")
            .setOrigin(0, 0)
            .setDepth(0);
        // Text displayed while loading items
        this.loadingText = this.add
            .text(200, 200, "Loading...", { fill: "white", fontSize: "28px" })
            .setDepth(3);
        this.loadingText.visible = false;

        // Add scrollable window for items
        this.scrollWindow = new ScrollWindow({
            name: "shop",
            x: 0,
            y: 100,
            width: 450,
            height: 214,
            numColumns: 3,
            padding: 35,
        });
        this.scene.add(this.scrollWindow.name, this.scrollWindow, true);

        // Display the shop (weapons displayed by default)
        this.loadShop(CONSTANTS.ITEM_TYPES.WEAPON);

        // Button to exit the shop and return to previous level
        this.exitButton = this.add
            .image(743, 22, "shop-exit-button")
            .setDepth(2)
            .setInteractive()
            .on("pointerup", () => {
                // Pass in the current level to know which level to return to upon exiting the shop.
                this.scene.start(characterData.getCurrentLevel());
                this.scene.remove(this.scrollWindow.name);
                console.log("Going back to", characterData.getCurrentLevel());
            });

        // Buttons to switch between weapons/tools/consumables/clan members (autoclickers)
        this.weaponsButton = this.add
            .image(525, 83, "shop-button")
            .setOrigin(0, 0)
            .setDepth(2)
            .setInteractive()
            .on("pointerup", () => {
                this.hideAllButtons();
                this.weaponsButton.setAlpha(1);
                this.loadShop(CONSTANTS.ITEM_TYPES.WEAPON);
            });
        this.weaponsText = this.add.text(542, 97, "Weapons", FONTS.SHOP).setDepth(2);
        this.toolsButton = this.add
            .image(525, 167, "shop-button")
            .setDepth(2)
            .setOrigin(0, 0)
            .setInteractive()
            .on("pointerup", () => {
                this.hideAllButtons();
                this.toolsButton.setAlpha(1);
                this.loadShop(CONSTANTS.ITEM_TYPES.TOOL);
            });
        this.toolsText = this.add.text(555, 182, "Tools", FONTS.SHOP).setDepth(2);
        this.consumablesButton = this.add
            .image(525, 248, "shop-button")
            .setDepth(2)
            .setOrigin(0, 0)
            .setInteractive()
            .on("pointerup", () => {
                this.hideAllButtons();
                this.consumablesButton.setAlpha(1);
                this.loadShop(CONSTANTS.ITEM_TYPES.CONSUMABLE);
            });
        this.consumablesText = this.add
            .text(527, 262, "Consumables", FONTS.SHOP)
            .setDepth(2);
        this.clanButton = this.add
            .image(641, 83, "shop-button")
            .setDepth(2)
            .setOrigin(0, 0)
            .setInteractive()
            .on("pointerup", () => {
                this.hideAllButtons();
                this.clanButton.setAlpha(1);
                this.loadShop("CLAN");
            });
        this.clanText = this.add
            .text(659, 86, "    Clan\nMembers", FONTS.SHOP)
            .setDepth(2);

        // Hide all buttons on startup except weapons
        this.hideAllButtons();
        this.weaponsButton.setAlpha(1);

        // Get audio scene and play bgm
        this.audio = this.scene.get(CONSTANTS.SCENES.AUDIO);
        this.audio.playBgm("the-trade-parade");
    }

    // Update the shop to display current gold
    update() {
        if (this.currentGold != characterData.getGold()) {
            this.audio.playSfx("purchase");
            this.displayGold();
        }
    }

    loadShop(type) {
        // Displays cash stack
        this.displayGold();

        // Loads items into shopItems and displays items on screen
        this.loadItems(type);
    }

    // Outputs the gold text in RS format: 1m = 1000k, 10m = green text, 1b = 1000m
    displayGold() {
        let gold = characterData.getGold();
        this.currentGold = gold;

        if (this.goldImage != undefined) {
            this.goldImage.destroy();
            this.goldText.destroy();
        }
        // Pick gold image based on # of coins
        let stack = "";
        switch (true) {
            case gold < 25:
                stack = "5";
                break;
            case gold < 100:
                stack = "25";
                break;
            case gold < 250:
                stack = "100";
                break;
            case gold < 1000:
                stack = "250";
                break;
            case gold < 10000:
                stack = "1k";
                break;
            default:
                stack = "10k";
                break;
        }
        this.goldImage = this.add.image(48, 76, stack).setInteractive();
        this.goldImage.scale = 1.3;

        // Pick text color and style based on # of coins
        let color = "white";
        let goldText = gold;
        if (gold > 99999 && gold < 10000000) {
            goldText = gold / 1000 + "k";
        } else if (gold > 10000000) {
            goldText = gold / 1000000 + "M";
            color = "#06c663";
        }
        this.goldText = this.add.text(35, 50, goldText, {
            fontFamily: "runescape",
            fill: color,
            stroke: "#000000",
            strokeThickness: 2,
        });
    }

    // Load items
    loadItems(itemType) {
        console.log("Loading " + itemType);
        this.loadingText.visible = true;

        // Reset the shop when loading a new type of item
        this.shopIcons.forEach((icon) => {
            icon.destroy();
        });
        this.shopIcons = [];

        this.displayItems(itemType);
    }

    // Display the loaded images in the shop
    async displayItems(itemType) {
        if (itemType == "CLAN") {
            for (let clickerName in autoclickerManifest) {
                let clicker = await getAutoclickerClass(clickerName, this.scrollWindow);
                clicker.createText(true);
                clicker.setVisible(false);
                this.shopIcons.push(clicker);
            }
        } else {
            // Load all items in that category
            for (let item in itemManifest) {
                if (itemManifest[item].type == itemType) {
                    let newItem = await getItemClass(item, this.scrollWindow);

                    // Create sprite
                    newItem.createShopSprite(20, 100);
                    newItem.setVisible(false);
                    this.shopIcons.push(newItem);
                }
            }
        }

        // Attach to the scroll window
        this.scrollWindow.clearObjects();
        this.scrollWindow.addObjects(this.shopIcons);
        this.scrollWindow.refresh();
        this.loadingText.visible = false;
    }

    hideAllButtons() {
        this.weaponsButton.setAlpha(0.1);
        this.toolsButton.setAlpha(0.1);
        this.consumablesButton.setAlpha(0.1);
        this.clanButton.setAlpha(0.1);
    }
}
