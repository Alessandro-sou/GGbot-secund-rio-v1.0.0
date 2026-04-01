require('dotenv').config();

module.exports = {
    supabase: {
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_KEY
    },
    discord: {
        token: process.env.DISCORD_BOT_TOKEN,
        guildId: process.env.DISCORD_GUILD_ID,
        mediatorRoleId: process.env.DISCORD_MEDIATOR_ROLE_ID,
        supportRoleId: process.env.DISCORD_SUPPORT_ROLE_ID,
        directorRoleId: process.env.DISCORD_DIRECTOR_ROLE_ID
    },
    port: process.env.PORT || 3000
};