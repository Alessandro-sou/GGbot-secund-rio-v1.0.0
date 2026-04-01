const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

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
        
        this.client.login(process.env.DISCORD_BOT_TOKEN);
        this.isReady = false;
        
        this.client.once('ready', () => {
            console.log('Bot Discord conectado!');
            this.isReady = true;
        });
    }

    async getBotStatus() {
        if (!this.isReady) {
            throw new Error('Bot Discord não está pronto');
        }

        const guild = await this.client.guilds.fetch(process.env.DISCORD_GUILD_ID);
        
        // Buscar membros totais
        await guild.members.fetch();
        const totalMembers = guild.memberCount;
        
        // Buscar membros online
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

        const guild = await this.client.guilds.fetch(process.env.DISCORD_GUILD_ID);
        const roleId = process.env.DISCORD_MEDIATOR_ROLE_ID;
        
        try {
            const member = await guild.members.fetch(userId);
            const role = await guild.roles.fetch(roleId);
            
            if (!member || !role) {
                throw new Error('Usuário ou cargo não encontrado');
            }

            if (action === 'ativar') {
                // Adicionar cargo de mediador
                await member.roles.add(role);
                
                // Alterar apelido para ADM|nome_do_user
                const originalNickname = member.nickname || member.user.username;
                // Remove qualquer prefixo existente (ADM|, SUP|, DIR|)
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
                // Remover cargo de mediador
                await member.roles.remove(role);
                
                // Remover o prefixo ADM| do apelido
                const currentNickname = member.nickname || member.user.username;
                const cleanName = currentNickname.replace(/^(ADM\|)/, '');
                
                // Verificar se ainda tem outros prefixos (SUP| ou DIR|)
                const hasOtherPrefix = cleanName.match(/^(SUP\|)|^(DIR\|)/);
                
                let finalNickname;
                if (hasOtherPrefix) {
                    // Mantém o prefixo existente (SUP| ou DIR|)
                    finalNickname = cleanName;
                } else {
                    // Remove completamente qualquer prefixo
                    finalNickname = cleanName;
                }
                
                if (finalNickname !== currentNickname) {
                    await member.setNickname(finalNickname);
                }
                
                return {
                    success: true,
                    message: `Cargo de mediador removido de ${member.user.tag} e apelido resetado`,
                    action: 'suspenso',
                    user: {
                        id: member.id,
                        username: member.user.username,
                        nickname: finalNickname,
                        role: null
                    }
                };
            } else {
                throw new Error('Ação inválida. Use "ativar" ou "suspender"');
            }
        } catch (error) {
            throw new Error(`Erro ao moderar usuário: ${error.message}`);
        }
    }

    async assignRoleAndNickname(userId, roleType, action) {
        if (!this.isReady) {
            throw new Error('Bot Discord não está pronto');
        }

        const guild = await this.client.guilds.fetch(process.env.DISCORD_GUILD_ID);
        
        try {
            const member = await guild.members.fetch(userId);
            
            if (!member) {
                throw new Error('Usuário não encontrado no servidor');
            }

            if (action === 'assign') {
                // Definir o ID do cargo baseado no tipo
                let roleId;
                let prefix;
                
                switch (roleType) {
                    case 'suporte':
                        roleId = process.env.DISCORD_SUPPORT_ROLE_ID;
                        prefix = 'SUP';
                        break;
                    case 'diretor':
                        roleId = process.env.DISCORD_DIRECTOR_ROLE_ID;
                        prefix = 'DIR';
                        break;
                    default:
                        throw new Error('Tipo de cargo inválido. Use "suporte" ou "diretor"');
                }

                if (!roleId) {
                    throw new Error(`ID do cargo ${roleType} não configurado no .env`);
                }

                const role = await guild.roles.fetch(roleId);
                
                if (!role) {
                    throw new Error(`Cargo ${roleType} não encontrado no servidor`);
                }

                // Verificar se o usuário já tem o cargo
                const hasRole = member.roles.cache.has(roleId);
                
                // Remover cargos conflitantes (não pode ter suporte e diretor ao mesmo tempo)
                if (roleType === 'suporte') {
                    const directorRole = await guild.roles.fetch(process.env.DISCORD_DIRECTOR_ROLE_ID);
                    if (directorRole && member.roles.cache.has(directorRole.id)) {
                        await member.roles.remove(directorRole);
                    }
                } else if (roleType === 'diretor') {
                    const supportRole = await guild.roles.fetch(process.env.DISCORD_SUPPORT_ROLE_ID);
                    if (supportRole && member.roles.cache.has(supportRole.id)) {
                        await member.roles.remove(supportRole);
                    }
                }

                // Adicionar o novo cargo se não tiver
                if (!hasRole) {
                    await member.roles.add(role);
                }

                // Atualizar apelido
                const originalNickname = member.nickname || member.user.username;
                // Remove qualquer prefixo existente (ADM|, SUP|, DIR|)
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
                // Definir o ID do cargo baseado no tipo
                let roleId;
                let prefix;
                
                switch (roleType) {
                    case 'suporte':
                        roleId = process.env.DISCORD_SUPPORT_ROLE_ID;
                        prefix = 'SUP';
                        break;
                    case 'diretor':
                        roleId = process.env.DISCORD_DIRECTOR_ROLE_ID;
                        prefix = 'DIR';
                        break;
                    default:
                        throw new Error('Tipo de cargo inválido. Use "suporte" ou "diretor"');
                }

                if (!roleId) {
                    throw new Error(`ID do cargo ${roleType} não configurado no .env`);
                }

                const role = await guild.roles.fetch(roleId);
                
                if (!role) {
                    throw new Error(`Cargo ${roleType} não encontrado no servidor`);
                }

                // Remover o cargo
                if (member.roles.cache.has(roleId)) {
                    await member.roles.remove(role);
                }

                // Resetar apelido (remover o prefixo específico)
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
            
        } catch (error) {
            throw new Error(`Erro ao gerenciar cargo: ${error.message}`);
        }
    }
}

module.exports = new DiscordService();