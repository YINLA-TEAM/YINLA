const { InteractionType, MessageFlags } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    const replyError = async () => {
      if (interaction.isAutocomplete?.()) return;
      const payload = {
        content: `發生錯誤，請向管理員回報`,
        flags: MessageFlags.Ephemeral,
      };
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(payload);
        } else {
          await interaction.reply(payload);
        }
      } catch (err) {
        client.sendErrorLog(err, interaction);
      }
    };

    if (interaction.isChatInputCommand()) {
      const { commands } = client;
      const { commandName } = interaction;
      const command = commands.get(commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        await client.sendErrorLog(error, interaction);
        await replyError();
      }
    } else if (interaction.isButton()) {
      const { buttons } = client;
      const { customId } = interaction;
      const button = buttons.get(customId);
      if (!button) return;

      try {
        await button.execute(interaction, client);
      } catch (error) {
        await client.sendErrorLog(error, interaction);
        await replyError();
      }
    } else if (interaction.isStringSelectMenu()) {
      const { selectMenus } = client;
      const { customId } = interaction;
      const menu = selectMenus.get(customId);
      if (!menu) return;

      try {
        await menu.execute(interaction, client);
      } catch (error) {
        await client.sendErrorLog(error, interaction);
        await replyError();
      }
    } else if (interaction.type == InteractionType.ModalSubmit) {
      const { modals } = client;
      const { customId } = interaction;
      const modal = modals.get(customId);
      if (!modal) return;

      try {
        await modal.execute(interaction, client);
      } catch (error) {
        await client.sendErrorLog(error, interaction);
        await replyError();
      }
    } else if (interaction.isContextMenuCommand()) {
      const { commands } = client;
      const { commandName } = interaction;
      const contextCommand = commands.get(commandName);
      if (!contextCommand) return;

      try {
        await contextCommand.execute(interaction, client);
      } catch (error) {
        await client.sendErrorLog(error, interaction);
        await replyError();
      }
    } else if (
      interaction.type == InteractionType.ApplicationCommandAutocomplete
    ) {
      const { commands } = client;
      const { commandName } = interaction;
      const command = commands.get(commandName);
      if (!command) return;

      try {
        await command.autocomplete(interaction, client);
      } catch (error) {
        await client.sendErrorLog(error, interaction);
      }
    }
  },
};
