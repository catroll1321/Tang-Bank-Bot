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

async function signup(id) {
    return await postJson(`${IP}/signup`, { card_holder: id });
}

exports.default = {
    data: new SlashCommandBuilder()
        .setName("register")
        .setDescription("註冊新帳戶"),
    
    async execute(_bot, interaction) {
        const userId = interaction.user.id;

        await interaction.deferReply({ ephemeral: true });

        const result = await signup(userId);
        if (result.error) {
            return await interaction.editReply(`❌ 註冊失敗：${result.error}`);
        }

        const signup_reward = {
            card_holder: userId,
            target_user: "Tang Bank!",
            transaction_type: {
                action: "credit",
                amount: 10000
            }
        };    

        const creditResult = await postJson(`${IP}/dc_trade`, signup_reward);
        if (creditResult.error) {
            return await interaction.editReply(`✅ 註冊成功！但加款失敗：${creditResult.error}，請聯絡管理員`);
        }

        const user = await interaction.client.users.fetch(userId);
        try {
            await user.send(
                `✅ 註冊成功！資料如下：\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``
            );
        } catch (e) {
            return await interaction.editReply("✅ 註冊成功，但無法私訊你，請確認已開啟私訊。");
        }

        await interaction.editReply("📬 註冊成功結果已透過私訊傳送！");
    }
};