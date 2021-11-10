import { parse, pool } from "dicebag"

export default {
  name: "roll",
  description: "Roll some dice!",
  options: [
    {
      name: "expression",
      description: "A dice expression to roll",
      type: "STRING",
      required: true,
    },
  ],
  public: true,
  async execute(interaction) {
    const expression = interaction.options.getString("expression")
    const roll = pool(
      parse(
        expression.replace("F", "3-2") // Handle Fudge dice
      )
    )
    const sum = roll.reduce((r, v) => r + v, 0)
    const list = roll.map((d) => `**\` ${d} \`**`).join(" ")
    const prefix = `🎲 **Roll ${expression}**`

    await interaction.reply(
      `${prefix} ${list}${roll.length > 1 ? ` = **\` ${sum} \`**` : ""}`
    )
  },
}
