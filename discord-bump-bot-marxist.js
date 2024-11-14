const { Client, GatewayIntentBits, REST, Routes, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Configuration du camarade bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

// Variables pour la révolution du bump
let bumpData = {};
const BUMP_COOLDOWN = 7200000; // 2 heures de lutte des classes
const INVITE_COOLDOWN = 86400000; // 24 heures de propagande
const DATA_FILE = 'manifeste.json';

// Charger le manifeste au démarrage
try {
  if (fs.existsSync(DATA_FILE)) {
    bumpData = JSON.parse(fs.readFileSync(DATA_FILE));
  }
} catch (error) {
  console.error('La révolution a rencontré une difficulté:', error);
}

// Sauvegarder le manifeste
function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(bumpData));
  } catch (error) {
    console.error('Le manifeste n\'a pas pu être sauvegardé:', error);
  }
}

// Commandes pour le prolétariat
const commands = [
  {
    name: 'setbumpchannel',
    description: 'Établir le quartier général de la révolution du bump',
    options: [
      {
        name: 'channel',
        type: 7,
        description: 'Le canal de propagande pour la cause',
        required: true
      }
    ]
  },
  {
    name: 'bump',
    description: 'Déclencher la révolution du bump !'
  },
  {
    name: 'nextbump',
    description: 'Consulter le planning de la prochaine révolution'
  },
  {
    name: 'manifeste',
    description: 'Afficher le manifeste du bump'
  }
];

// Messages révolutionnaires aléatoires pour les rappels
const bumpMessages = [
  "☭ Camarades ! L'heure de la révolution du bump a sonné ! `/bump` pour unir le prolétariat !",
  "⚒️ Prolétaires de tous les serveurs, unissez-vous ! C'est l'heure du `/bump` !",
  "🚩 La lutte des bumps continue ! Utilisez `/bump` pour la gloire du serveur !",
  "⭐ Le monde nouveau  ne se créera pas tout seul, camarades ! `/bump` pour la cause !",
  "🛠️ Les moyens de production du bump sont entre vos mains ! `/bump` maintenant !",
];

const inviteMessages = [
  "📨 Camarades ! Il est temps de recruter de nouveaux membres pour notre cause !",
  "🌟 La révolution a besoin de nouveaux camarades ! Vérifiez les invitations !",
  "🚩 Propagez la parole de notre glorieux serveur ! Mettez à jour les invitations !",
  "⚔️ Notre union fait notre force ! Partagez les invitations du serveur !",
];

// Initialisation de la révolution
client.once('ready', async () => {
  console.log(`Le camarade ${client.user.tag} est prêt pour la révolution !`);
  
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  
  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('Les ordres de la révolution sont en place !');
    
    startChecks();
    
    // Activités révolutionnaires
    setInterval(() => {
      const activities = [
        { name: 'Le Capital de Marx', type: ActivityType.Reading },
        { name: 'L\'Internationale', type: ActivityType.Listening },
        { name: 'la révolution du bump', type: ActivityType.Watching },
        { name: `${client.guilds.cache.size} collectifs`, type: ActivityType.Watching }
      ];
      const activity = activities[Math.floor(Math.random() * activities.length)];
      client.user.setActivity(activity.name, { type: activity.type });
    }, 300000);
    
  } catch (error) {
    console.error('La révolution a échoué à s\'initialiser:', error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  
  const { commandName, guildId } = interaction;
  
  try {
    switch (commandName) {
      case 'setbumpchannel':
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
          return await interaction.reply('Seuls les leaders du prolétariat peuvent utiliser cette commande !');
        }
        
        const channel = interaction.options.getChannel('channel');
        if (!channel || channel.type !== 0) {
          return await interaction.reply('Camarade, ce canal n\'est pas valide pour notre cause !');
        }
        
        bumpData[guildId] = bumpData[guildId] || {};
        bumpData[guildId].reminderChannel = channel.id;
        saveData();
        
        await interaction.reply(`☭ Le quartier général de la révolution est maintenant établi dans ${channel} !`);
        break;
        
      case 'bump':
        bumpData[guildId] = bumpData[guildId] || {};
        bumpData[guildId].lastBump = Date.now();
        saveData();
        
        await interaction.reply('🚩 La révolution du bump est en marche ! Je rassemblerai les camarades dans 2 heures !');
        break;
        
      case 'nextbump':
        if (!bumpData[guildId] || !bumpData[guildId].lastBump) {
          return await interaction.reply('La révolution n\'a pas encore commencé, camarade !');
        }
        
        const timeLeft = (bumpData[guildId].lastBump + BUMP_COOLDOWN) - Date.now();
        if (timeLeft <= 0) {
          return await interaction.reply('☭ Le moment de la révolution est venu, camarade !');
        }
        
        const hours = Math.floor(timeLeft / 3600000);
        const minutes = Math.floor((timeLeft % 3600000) / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        
        await interaction.reply(
          `⏰ La prochaine révolution du bump commencera dans : ${hours}h ${minutes}m ${seconds}s, camarade !`
        );
        break;

      case 'manifeste':
        const manifeste = {
          embeds: [{
            title: "☭ Le Manifeste du Bump ☭",
            description: "Prolétaires de tous les serveurs, unissez-vous !",
            color: 0xFF0000,
            fields: [
              {
                name: "Article 1",
                value: "Les bumps du passé n'étaient que l'histoire de la lutte des serveurs."
              },
              {
                name: "Article 2",
                value: "Chaque camarade doit contribuer selon ses moyens au bump toutes les 2 heures."
              },
              {
                name: "Article 3",
                value: "L'union des serveurs fait la force de la révolution du bump !"
              }
            ],
            footer: {
              text: "Karl Marx aurait approuvé ce message"
            }
          }]
        };
        await interaction.reply(manifeste);
        break;
    }
  } catch (error) {
    console.error('Erreur dans la révolution:', error);
    await interaction.reply('La révolution a rencontré un obstacle temporaire, camarade !');
  }
});

// Système de vérification révolutionnaire
function startChecks() {
  setInterval(() => {
    const now = Date.now();
    
    for (const [guildId, data] of Object.entries(bumpData)) {
      if (!data.reminderChannel) continue;
      
      const guild = client.guilds.cache.get(guildId);
      if (!guild) continue;
      
      const channel = guild.channels.cache.get(data.reminderChannel);
      if (!channel) continue;
      
      // Vérification du bump
      if (data.lastBump && (now - data.lastBump >= BUMP_COOLDOWN)) {
        const randomBumpMessage = bumpMessages[Math.floor(Math.random() * bumpMessages.length)];
        channel.send(randomBumpMessage);
        data.lastBump = null;
      }
      
      // Vérification des invitations
      if (!data.lastInviteCheck || (now - data.lastInviteCheck >= INVITE_COOLDOWN)) {
        const randomInviteMessage = inviteMessages[Math.floor(Math.random() * inviteMessages.length)];
        channel.send(randomInviteMessage);
        data.lastInviteCheck = now;
      }
    }
    
    saveData();
  }, 60000);
}

// Gestion des obstacles à la révolution
client.on('error', console.error);
process.on('unhandledRejection', error => console.error('La révolution a rencontré une résistance:', error));

// Configuration du quartier général web pour Render
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('☭ Le quartier général de la révolution du bump est opérationnel ! ☭');
});

app.listen(PORT, () => {
  console.log(`Le QG web est établi sur le port ${PORT}`);
});

// Début de la révolution
client.login(process.env.DISCORD_TOKEN);
