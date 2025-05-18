"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    name: "interactionCreate",
    listener(bot, interaction) {
        if (!interaction.inGuild() || !interaction.isChatInputCommand()) {
            return;
        }
        const commandName = interaction.commandName;
        const command = bot.commands.get(commandName);
        if (!command) {
            return;
        }
        bot.logger.info(`@${interaction.user.username} 執行了 /${commandName}`);
        command.execute(bot, interaction);
    }
};