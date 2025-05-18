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

async function check_trade(id) {
    return await postJson(`${IP}/check_trade`, { card_holder: id });
}

function formatTradeHistory(tradeHistory) {
    const entries = Object.entries(tradeHistory).sort(([a], [b]) => Number(a) - Number(b));
    let message = "📜 你的交易紀錄如下：\n```\nNo. | Type   | Amount      | Target & Discord ID | Time\n";

    for (const [key, value] of entries) {
        const { target_user, timestamp, transaction_type } = value;
        const time = new Date(timestamp * 1000).toISOString().replace("T", " ").slice(0, 19);
        const type = transaction_type.action;
        const amount = Number(transaction_type.amount).toFixed(2);

        message += `${key.padEnd(4)}| ${type.padEnd(7)}| $${amount.padEnd(11)}| ${target_user.padEnd(20)}| ${time}\n`;
    }

    message += "```";
    return message;
}

exports.default = {
    data: new SlashCommandBuilder()
        .setName("trade-history")
        .setDescription("查詢7日內交易紀錄"),
    
    async execute(_bot, interaction) {
        const userId = interaction.user.id;
        const result = await check_trade(userId);

        try {
            const user = await interaction.client.users.fetch(userId);
            await user.send(
                result.error
                    ? `❌ 請求失敗：${result.error}`
                    : formatTradeHistory(result)
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