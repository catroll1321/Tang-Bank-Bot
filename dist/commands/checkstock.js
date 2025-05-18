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

async function check_stock(id) {
    return await postJson(`${IP}/check_stock`, { card_holder: id });
}

function formatStocks(stocks) {
    let message = "📈 你目前的持股如下：\n```\nSymbol | Hand | Leverage | Buy Price | Time\n";
    for (const entry of stocks) {
        const stock = entry.stock;
        const time = new Date(entry.timestamp * 1000).toISOString().replace("T", " ").slice(0, 19);
        message += `${stock.symbol.padEnd(6)} | ${stock.hand.padEnd(4)} | ${stock.leverage.padEnd(8)} | ${stock.price.padEnd(9)} | ${time}\n`;
    }
    message += "```";
    return message;
}

exports.default = {
    data: new SlashCommandBuilder()
        .setName("checkstock")
        .setDescription("查詢持有股票"),
    
    async execute(_bot, interaction) {
        const userId = interaction.user.id;
        const result = await check_stock(userId);

        try {
            const user = await interaction.client.users.fetch(userId);
            await user.send(
                result.error
                    ? `❌ 請求失敗：${result.error}`
                    : formatStocks(result)
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