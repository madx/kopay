export default {
  name: "reminders",
  description: "Manage reminders",
  options: [
    {
      name: "list",
      description: "List current reminders",
      type: "SUB_COMMAND",
    },
    {
      name: "add",
      description: "List current reminders",
      type: "SUB_COMMAND",
    },
  ],
  async execute(interaction, bot) {
    const command = interaction.options.getSubcommand()

    switch (command) {
      case "list":
        const reminders = await bot.supabase.from("reminders").select()
        await interaction.reply(`Reminders: ${JSON.stringify(reminders)}`)

        break
      case "add":
        break
      default:
        await interaction.reply(`⛔️ Unknown subcommand ${command}`)
    }
  },
}
