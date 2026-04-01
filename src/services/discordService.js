const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const config = require('../config');

class DiscordService {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });
        
        this.client.login(config.discord.token);
        this.isReady = false;
        
        this.client.once('ready', () => {
            console.log('✅ Bot Discord conectado!');
            this.isReady = true;
        });
        
        this.client.on('error', (error) => {
            console.error('❌ Erro no bot Discord:', error);
        });
    }

    async getBotStatus() {
        if (!this.isReady) {
            throw new Error('Bot Discord não está pronto');
        }

        const guild = await this.client.guilds.fetch(config.discord.guildId);
        await guild.members.fetch();
        
        const totalMembers = guild.memberCount;
        const onlineMembers = guild.members.cache.filter(member => 
            member.presence?.status === 'online' || 
            member.presence?.status === 'idle' || 
            member.presence?.status === 'dnd'
        ).size;

        return {
            total_usuarios: totalMembers,
            usuarios_online: onlineMembers,
            bot_online: true,
            servidor: guild.name
        };
    }

    async sendMessage(channelId, message, type = 'normal', embedData = null) {
        if (!this.isReady) {
            throw new Error('Bot Discord não está pronto');
        }

        const channel = await this.client.channels.fetch(channelId);
        
        if (!channel) {
            throw new Error('Canal não encontrado');
        }

        if (type === 'embed' && embedData) {
            const embed = new EmbedBuilder()
                .setTitle(embedData.title || '')
                .setDescription(embedData.description || '')
                .setColor(embedData.color || 0x0099FF)
                .setTimestamp();
            
            if (embedData.fields) {
                embed.addFields(embedData.fields);
            }
            
            if (embedData.thumbnail) {
                embed.setThumbnail(embedData.thumbnail);
            }
            
            if (embedData.image) {
                embed.setImage(embedData.image);
            }
            
            return await channel.send({ embeds: [embed] });
        } else {
            return await channel.send(message);
        }
    }

    async moderateUser(userId, action) {
        if (!this.isReady) {
            throw new Error('Bot Discord não está pronto');
        }

        const guild = await this.client.guilds.fetch(config.discord.guildId);
        const roleId = config.discord.mediatorRoleId;
        
        const member = await guild.members.fetch(userId);
        const role = await guild.roles.fetch(roleId);
        
        if (!member || !role) {
            throw new Error('Usuário ou cargo não encontrado');
        }

        if (action === 'ativar') {
            await member.roles.add(role);
            
            const originalNickname = member.nickname || member.user.username;
            const cleanName = originalNickname.replace(/^(ADM\|)|^(SUP\|)|^(DIR\|)/, '');
            const newNickname = `ADM|${cleanName}`;
            
            await member.setNickname(newNickname);
            
            return {
                success: true,
                message: `Cargo de mediador adicionado para ${member.user.tag} e apelido alterado para ${newNickname}`,
                action: 'ativado',
                user: {
                    id: member.id,
                    username: member.user.username,
                    nickname: newNickname,
                    role: 'mediador'
                }
            };
            
        } else if (action === 'suspender') {
            await member.roles.remove(role);
            
            const currentNickname = member.nickname || member.user.username;
            const cleanName = currentNickname.replace(/^(ADM\|)/, '');
            
            if (cleanName !== currentNickname) {
                await member.setNickname(cleanName);
            }
            
            return {
                success: true,
                message: `Cargo de mediador removido de ${member.user.tag} e apelido resetado`,
                action: 'suspenso',
                user: {
                    id: member.id,
                    username: member.user.username,
                    nickname: cleanName,
                    role: null
                }
            };
        } else {
            throw new Error('Ação inválida. Use "ativar" ou "suspender"');
        }
    }

    async assignRoleAndNickname(userId, roleType, action) {
        if (!this.isReady) {
            throw new Error('Bot Discord não está pronto');
        }

        const guild = await this.client.guilds.fetch(config.discord.guildId);
        const member = await guild.members.fetch(userId);
        
        if (!member) {
            throw new Error('Usuário não encontrado no servidor');
        }

        let roleId, prefix;
        
        if (roleType === 'suporte') {
            roleId = config.discord.supportRoleId;
            prefix = 'SUP';
        } else if (roleType === 'diretor') {
            roleId = config.discord.directorRoleId;
            prefix = 'DIR';
        } else {
            throw new Error('Tipo de cargo inválido. Use "suporte" ou "diretor"');
        }

        if (!roleId) {
            throw new Error(`ID do cargo ${roleType} não configurado`);
        }

        const role = await guild.roles.fetch(roleId);
        
        if (!role) {
            throw new Error(`Cargo ${roleType} não encontrado`);
        }

        if (action === 'assign') {
            // Remove cargo conflitante
            if (roleType === 'suporte') {
                const directorRole = await guild.roles.fetch(config.discord.directorRoleId);
                if (directorRole && member.roles.cache.has(directorRole.id)) {
                    await member.roles.remove(directorRole);
                }
            } else if (roleType === 'diretor') {
                const supportRole = await guild.roles.fetch(config.discord.supportRoleId);
                if (supportRole && member.roles.cache.has(supportRole.id)) {
                    await member.roles.remove(supportRole);
                }
            }

            await member.roles.add(role);
            
            const originalNickname = member.nickname || member.user.username;
            const cleanName = originalNickname.replace(/^(ADM\|)|^(SUP\|)|^(DIR\|)/, '');
            const newNickname = `${prefix}|${cleanName}`;
            
            await member.setNickname(newNickname);
            
            return {
                success: true,
                message: `Cargo ${roleType} atribuído e apelido alterado para ${newNickname}`,
                user: {
                    id: member.id,
                    username: member.user.username,
                    nickname: newNickname,
                    role: roleType,
                    roleId: role.id
                }
            };
            
        } else if (action === 'remove') {
            await member.roles.remove(role);
            
            const currentNickname = member.nickname || member.user.username;
            const cleanName = currentNickname.replace(new RegExp(`^(${prefix}\\|)`), '');
            
            if (cleanName !== currentNickname) {
                await member.setNickname(cleanName);
            }
            
            return {
                success: true,
                message: `Cargo ${roleType} removido e apelido resetado para ${cleanName}`,
                user: {
                    id: member.id,
                    username: member.user.username,
                    nickname: cleanName,
                    role: null
                }
            };
        } else {
            throw new Error('Ação inválida. Use "assign" ou "remove"');
        }
    }
}

module.exports = new DiscordService();