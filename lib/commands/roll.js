import { Collection } from "discord.js"
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

    await interaction.reply(
      `🎲 **Roll ${expression}** [ ${roll
        .map((d) => `\`${d}\``)
        .join(", ")} ] = \`${roll.reduce((r, v) => r + v, 0)}\``
    )
  },
}
