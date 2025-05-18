"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");
const IP = "http://127.0.0.1:3000";

async function postJson(url, data) {
    try {
        const res = await axios.post(url, data);
        return res.data;
    } catch (e) {
        if (e.response && e.response.data) {
            return { error: e.response.data };
        } else {
            return { error: "請求失敗: " + e.message };
        }
    }
}

async function balance(id) {
    return await postJson(`${IP}/get_balance`, { card_holder: id });
}

exports.default = {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("查詢帳戶餘額"),
    
    async execute(_bot, interaction) {
        const userId = interaction.user.id;
        const result = await balance(userId);

        try {
            const user = await interaction.client.users.fetch(userId);
            await user.send(
                result.error
                    ? `❌ 請求失敗：${result.error}`
                    : `✅ 請求成功！\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``
            );
        } catch (e) {
            await interaction.reply({
                content: "⚠️ 無法私訊，請確認已開啟 Discord 私訊。",
                ephemeral: true
            });
            return;
        }

        await interaction.reply({
            content: "📬 註冊結果已透過私訊傳送！",
            ephemeral: true
        });
    }
};