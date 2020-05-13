import { CONSTANTS } from "../constants/constants.js";

// Clan members function as autoclickers
export class Clan {
    scene;
    scrollWindow;

    // Pointer to cookies, stores clan name and member names
    clanCookies;
    characterData;

    // Phaser objects
    playerNameText;
    clanNameText;
    clanMembers = [];

    constructor(scene, scrollWindow) {
        this.scene = scene;
        this.scrollWindow = scrollWindow;
        this.characterData = scene.characterData;
        this.clanCookies = this.characterData.clan;

        // Add self to clan members
        if (this.clanCookies.members.length == 0) {
            this.clanCookies.members.push(this.characterData.name);
        }

        // Update and show clan info on startup
        this.refreshClan();
    }

    // Load clan data on startup
    refreshClan() {
        // Load clan name and player name
        this.clanNameText = this.scene.add
            .text(610, 228, this.clanCookies.name, {
                font: "15.5px runescape",
                fill: "yellow",
            })
            .setDepth(3);
        this.playerNameText = this.scene.add
            .text(610, 242, this.characterData.name, {
                font: "15.5px runescape",
            })
            .setDepth(3);

        // Load clan members
        const startX = 560,
            startY = 280,
            yDiff = 18;
        this.clanCookies.members.forEach((member, index) => {
            let text = this.scrollWindow.add
                .text(startX, startY + index * yDiff, member, {
                    font: "16px runescape",
                })
                .setDepth(3);
            this.clanMembers.push(text);
        });
    }

    // Add clan member to list
    addClanMember(member) {
        const startX = 560,
            startY = 280,
            yDiff = 18;

        // Add text to the list
        let index = this.clanMembers.length;
        let textObj = this.scene.add
            .text(startX, startY + index * yDiff, member, {
                font: "16px runescape",
            })
            .setDepth(3);
        this.clanMembers.push(textObj);

        // Add to saved data
        this.clanCookies.members.push(member);

        // Hide if clan tab is not selected
        let show = this.scene.currentPanel == CONSTANTS.PANEL.CLAN;
        textObj.setVisible(show);

        this.scrollWindow.addObject(textObj);
    }

    show(isVisible) {
        this.scrollWindow.refresh({
            x: 535,
            y: 280,
            width: 175,
            height: 140,
            numColumns: 1,
            padding: 10,
            objects: this.clanMembers,
        });
        if (isVisible) {
            this.scene.currentPanel = CONSTANTS.PANEL.CLAN;
        }
        this.scrollWindow.setVisible(isVisible);
        this.clanMembers.forEach((member) => {
            member.visible = isVisible;
        });
        this.playerNameText.visible = isVisible;
        this.clanNameText.visible = isVisible;
    }

    destroy() {
        this.clanMembers.forEach((member) => {
            member.destroy();
        });
        this.playerNameText.destroy();
        this.clanNameText.destroy();
    }
}
