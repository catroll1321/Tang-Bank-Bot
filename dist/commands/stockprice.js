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

async function get_stock_price(symbol) {
    return await postJson(`${IP}/get_price`, { symbol });
}

exports.default = {
    data: new SlashCommandBuilder()
        .setName("stockprice")
        .setDescription("查詢股票現價")
        .addStringOption(option =>
            option.setName('symbol')
              .setDescription('股票代號或名稱')
              .setRequired(true)),
    async execute(_bot, interaction) {
        const symbol = interaction.options.getString('symbol');
        const result = await get_stock_price(symbol);

        try {
            await interaction.reply({
                content: result.error
                    ? `❌ 請求失敗：${result.error}`
                    : `✅ 請求成功！\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``
            });
        } catch (e) {
            await interaction.reply({
                content: "⚠️ 無法處理請求!。",
                ephemeral: true
            });
            return;
        }
    }
};