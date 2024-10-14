const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const fetchCPBLScore = async() => {
    try {
        const response = await fetch("https://www.cpbl.com.tw/home/getdetaillist", { method: 'POST' });
        const data = await response.json();
        const game_detail = JSON.parse(data.GameDetailJson);
        
        const gameArray = [];
        
        game_detail.forEach((game) => {
            gameArray.push({
                gameSNo: game?.GameSno,                      //賽事編號
                gameStatus: game?.GameStatus,                //賽事狀態
                gameType: game?.KindCode,

                awayTeam: game?.VisitingTeamName,            //客隊隊名
                homeTeam: game?.HomeTeamName,                //主隊隊名
                awayScore: game?.VisitingTotalScore = null ? '0' : game?.VisitingTotalScore,         //客隊分數
                homeScore: game?.HomeTotalScore = null ? '0' : game?.HomeTotalScore,             //主隊分數
                awayTeam_code: game?.VisitingTeamCode,       //
                homeTeam_code: game?.HomeTeamCode,
                awayTeam_W: game?.VisitingGameResultWCnt,
                awayTeam_L: game?.VisitingGameResultLCnt,
                awayTeam_T: game?.VisitingGameResultTCnt,
                homeTeam_W: game?.HomeGameResultWCnt,
                homeTeam_L: game?.HomeGameResultLCnt,
                homeTeam_T: game?.HomeGameResultTCnt,

                place: game?.FieldAbbe,
                place_time: game?.PreExeDate,
                inning: game?.CurtBatting?.InningSeq,
                inning_top_bot: game?.CurtBatting?.VisitingHomeType,
                schedule: game?.GameStatusChi,

                away_sp_name: game?.VisitingFirstMover,
                away_sp_Acnt: game?.VisitingFirstAcnt,
                home_sp_name: game?.HomeFirstMover,
                home_sp_Acnt: game?.HomeFirstAcnt,

                strike_cnt: game?.CurtBatting?.StrikeCnt,
                ball_cnt: game?.CurtBatting?.BallCnt,
                out_cnt: game?.CurtBatting?.OutCnt,
                pitch_cnt: game?.CurtBatting?.PitchCnt,

                hitter_no: game?.CurtBatting?.HitterUniformNo,
                hitter_name: game?.CurtBatting?.HitterName,
                hitter_Acnt: game?.CurtBatting?.HitterAcnt,
                hitter_team: game?.CurtBatting?.VisitingHomeType == 1 ? game.VisitingTeamCode : game.HomeTeamCode,

                pitcher_no: game?.CurtBatting?.PitcherUniformNo,
                pitcher_name: game?.CurtBatting?.PitcherName,
                pitcher_Acnt: game?.CurtBatting?.PitcherAcnt,
                pitcher_team: game?.CurtBatting?.VisitingHomeType == 1 ? game.HomeTeamCode : game.VisitingTeamCode,

                wins_pitcher_name: game?.WinningPitcherName,
                wins_pitcher_Acnt: game?.WinningPitcherAcnt,
                wins_pitcher_team: game?.WinningType == 1 ? game.VisitingTeamCode : game.HomeTeamCode,

                loses_pitcher_name: game?.LosePitcherName,
                loses_pitcher_Acnt: game?.LosePitcherAcnt,
                loses_pitcher_team: game?.WinningType == 1 ? game.HomeTeamCode : game.VisitingTeamCode,
            })
        })
        return gameArray;
    } catch (error) {
        console.log(error)
        return false;
    } 
}

const teamIcon = (team_name) => {
    try {
        const icon = {
            "中信兄弟": "<:cpbl_B:914141522541297696>",
            "味全龍": "<:cpbl_D:1033396051224305734>",
            "富邦悍將": "<:cpbl_G:1033396049227829331>",
            "統一7-ELEVEn獅": "<:cpbl_L:1033396606491431012>",
            "樂天桃猿": "<:cpbl_R:1033396046849646654>",
            "台鋼雄鷹": "<:cpbl_T:1273206632150470678>",
            "中信兄弟二軍": "<:cpbl_B:914141522541297696>",
            "味全龍二軍": "<:cpbl_D:1033396051224305734>",
            "富邦悍將二軍": "<:cpbl_G:1033396049227829331>",
            "統一7-ELEVEn獅二軍": "<:cpbl_L:1033396606491431012>",
            "樂天桃猿二軍": "<:cpbl_R:1033396046849646654>",
            "台鋼雄鷹二軍": "<:cpbl_T:1273206632150470678>",
            "ACN011": "<:cpbl_B:914141522541297696>",
            "AAA011": "<:cpbl_D:1033396051224305734>",
            "AEO011": "<:cpbl_G:1033396049227829331>",
            "ADD011": "<:cpbl_L:1033396606491431012>",
            "AJL011": "<:cpbl_R:1033396046849646654>",
            "AKP011": "<:cpbl_T:1273206632150470678>",
            "ACN022": "<:cpbl_B:914141522541297696>",
            "AAA022": "<:cpbl_D:1033396051224305734>",
            "AEO022": "<:cpbl_G:1033396049227829331>",
            "ADD022": "<:cpbl_L:1033396606491431012>",
            "AJL022": "<:cpbl_R:1033396046849646654>",
            "AKP022": "<:cpbl_T:1273206632150470678>",
        };
        
        return icon[team_name] || " ";
    } catch (error) {
        return " ";
    }
}

const gameType = (type) => {
    switch (type) {
        case "A":
            return "一軍例行賽";
        case "B":
            return "一軍明星賽";
        case "C":
            return "一軍總冠軍賽";
        case "D":
            return "二軍例行賽";
        case "E":
            return "一軍季後挑戰賽";
        case "F":
            return "二軍總冠軍賽";
        case "G":
            return "一軍熱身賽";
        case "H":
            return "未來之星邀請賽";
        default:
            return "";
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cpbl_score')
        .setNameLocalizations({
            "zh-TW" : "中華職棒即時比分",
        })
        .setDescription('中華職棒即時比分'),
    
    async execute (interaction) {

        const WaitMessage = await interaction.deferReply({
            fetchReply: true,
            ephemeral: true
        });

        const game_embed_list = [];
        const game = await fetchCPBLScore();

        if (!game) {
            await interaction.editReply(`# 🚨：API擷取發生錯誤請回報`);
            return;
        }
        
        // 判定有無賽事
        if(game.length === 0){
            const nullGameEmbed = new EmbedBuilder()
                .setTitle('無比賽數據')
                .setColor('Red')
            game_embed_list.push(nullGameEmbed);
        } else {
            for(let i = 0; i < game.length; i++){
                switch (game[i].gameStatus) {
                    case 1:
                        // 如有必要才進行 或 比賽尚未開始
                        const ifNeededGame_Embed = new EmbedBuilder()
                            .setAuthor({ name: "中華職棒", url:"https://www.cpbl.com.tw", iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"})
                            .setTitle(`[${game[i].gameType == 'C' || 'E' || 'F' ? `GAME ${game[i].gameSNo}` : game[i].gameSNo.toString().padStart(3,'0')}] ${game[i].awayTeam} vs. ${game[i].homeTeam}`)
                            .setDescription(`# 比賽尚未開始`)
                            .addFields([
                                { name: "客隊先發投手", value: game[i].away_sp_Acnt == '' ? "未公布" : `${teamIcon(game[i].awayTeam_code)} [${game[i].away_sp_name}](https://www.cpbl.com.tw/team/person?acnt=${game[i].away_sp_Acnt})`, inline: true },
                                { name: "主隊先發投手", value: game[i].home_sp_Acnt == '' ? "未公布" : `${teamIcon(game[i].homeTeam_code)} [${game[i].home_sp_name}](https://www.cpbl.com.tw/team/person?acnt=${game[i].home_sp_Acnt})`, inline: true },
                                { name: "** **", value: "** **", inline: true },
                                { name: "客隊勝敗和", value: `${game[i].awayTeam_W}-${game[i].awayTeam_L}-${game[i].awayTeam_T}`, inline: true },
                                { name: "主隊勝敗和", value: `${game[i].homeTeam_W}-${game[i].homeTeam_L}-${game[i].homeTeam_T}`, inline: true },
                            ])
                            .setFooter({ text: `🏟️ ${game[i].place}棒球場 ◉ ${gameType(game[i].gameType)}` })
                        game_embed_list.push(ifNeededGame_Embed);
                        break;
                    case 2:
                        // 比賽中
                        const playBall_Embed = new EmbedBuilder()
                            .setAuthor({ name: "中華職棒", url:"https://www.cpbl.com.tw", iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"})
                            .setTitle(`[${game[i].gameType == 'C' || 'E' || 'F' ? `GAME ${game[i].gameSNo}` : game[i].gameSNo.toString().padStart(3,'0')}] ${game[i].awayTeam} vs. ${game[i].homeTeam}`)
                            .setDescription(`# ${teamIcon(game[i].awayTeam)} \`${game[i].awayScore}\` ${game[i].inning + game[i].inning_top_bot == 1 ? "上" : "下"} \`${game[i].homeScore}\` ${teamIcon(game[i].homeTeam)}`)
                            .setColor('Green')
                            .addFields([
                                { name: "投手", value: `${teamIcon(game[i].pitcher_team)} [${game[i].pitcher_no + " " + game[i].pitcher_name}](https://www.cpbl.com.tw/team/person?acnt=${game[i].pitcher_Acnt})`, inline: true },
                                { name: "** **", value: "** **", inline: true },
                                { name: "打者", value: `${teamIcon(game[i].hitter_team)} [${game[i].hitter_no + " " + game[i].hitter_name}](https://www.cpbl.com.tw/team/person?acnt=${game[i].hitter_Acnt})`, inline: true },
                                { name: "好球-壞球", value: `${game[i].strike_cnt}-${game[i].ball_cnt}`, inline: true },
                                { name: "出局數", value: `${game[i].out_cnt}`, inline: true },
                                { name: "投手球數", value: `${game[i].pitch_cnt} 球`, inline: true },
                            ])
                            .setFooter({ text: `🏟️ ${game[i].place}棒球場 ◉ ${gameType(game[i].gameType)}` })
                        game_embed_list.push(playBall_Embed);
                        break;
                    case 3:
                        // 比賽結束
                        const endGame_Embed = new EmbedBuilder()
                            .setAuthor({ name: "中華職棒", url:"https://www.cpbl.com.tw", iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"})
                            .setTitle(`[${game[i].gameType == 'C' || 'E' || 'F' ? `GAME ${game[i].gameSNo}` : game[i].gameSNo.toString().padStart(3,'0')}] 比賽結束`)
                            .setDescription(`# ${teamIcon(game[i].awayTeam)} \`${game[i].awayScore}\` vs. \`${game[i].homeScore}\` ${teamIcon(game[i].homeTeam)}`)
                            .setColor('Red')
                            .addFields([
                                { name: "勝投", value: game[i].wins_pitcher_name == '' ? "無" : `${teamIcon(game[i].wins_pitcher_team)} [${game[i].wins_pitcher_name}](https://www.cpbl.com.tw/team/person?acnt=${game[i].wins_pitcher_Acnt})`, inline: true },
                                { name: "敗投", value: game[i].loses_pitcher_name == '' ? "無" : `${teamIcon(game[i].loses_pitcher_team)} [${game[i].loses_pitcher_name}](https://www.cpbl.com.tw/team/person?acnt=${game[i].loses_pitcher_Acnt})`, inline: true },
                                { name: "** **", value: "** **", inline: true },
                                { name: "客隊勝敗和", value: `${game[i].awayTeam_W}-${game[i].awayTeam_L}-${game[i].awayTeam_T}`, inline: true },
                                { name: "主隊勝敗和", value: `${game[i].homeTeam_W}-${game[i].homeTeam_L}-${game[i].homeTeam_T}`, inline: true },
                            ])
                            .setFooter({ text: `🏟️ ${game[i].place}棒球場 ◉ ${gameType(game[i].gameType)}` })
                        game_embed_list.push(endGame_Embed);
                        break;
                    case 4:
                        // 先發打序
                        const startingOrder_Embed = new EmbedBuilder()
                            .setAuthor({ name: "中華職棒", url:"https://www.cpbl.com.tw", iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"})
                            .setTitle(`[${game[i].gameType == 'C' || 'E' || 'F' ? `GAME ${game[i].gameSNo}` : game[i].gameSNo.toString().padStart(3,'0')}] 先發打序`)
                            .setDescription(`# ${teamIcon(game[i].awayTeam)} vs. ${teamIcon(game[i].homeTeam)}`)
                            .setColor('Aqua')
                            .addFields([
                                { name: "客隊先發投手", value: game[i].away_sp_Acnt == '' ? "未公布" : `${teamIcon(game[i].awayTeam_code)} [${game[i].away_sp_name}](https://www.cpbl.com.tw/team/person?acnt=${game[i].away_sp_Acnt})`, inline: true },
                                { name: "主隊先發投手", value: game[i].home_sp_Acnt == '' ? "未公布" : `${teamIcon(game[i].homeTeam_code)} [${game[i].home_sp_name}](https://www.cpbl.com.tw/team/person?acnt=${game[i].home_sp_Acnt})`, inline: true },
                                { name: "** **", value: "** **", inline: true },
                                { name: "客隊勝敗和", value: `${game[i].awayTeam_W}-${game[i].awayTeam_L}-${game[i].awayTeam_T}`, inline: true },
                                { name: "主隊勝敗和", value: `${game[i].homeTeam_W}-${game[i].homeTeam_L}-${game[i].homeTeam_T}`, inline: true },
                            ])
                            .setFooter({ text: `🏟️ ${game[i].place}棒球場 ◉ ${gameType(game[i].gameType)}` })
                        game_embed_list.push(startingOrder_Embed);
                        break;
                    case 5:
                        // 取消比賽
                        const cancelGame_Embed = new EmbedBuilder()
                            .setAuthor({ name: "中華職棒", url:"https://www.cpbl.com.tw", iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"})
                            .setTitle(`[${game[i].gameType == 'C' || 'E' || 'F' ? `GAME ${game[i].gameSNo}` : game[i].gameSNo.toString().padStart(3,'0')}] ${game[i].awayTeam} vs. ${game[i].homeTeam}`)
                            .setDescription(`# 賽事已取消`)
                            .setColor('DarkRed')
                            .setFooter({ text: `🏟️ ${game[i].place}棒球場 ◉ ${gameType(game[i].gameType)}` })
                        game_embed_list.push(cancelGame_Embed);
                        break;
                    case 6:
                        // 延賽
                        const postPoned_Embed = new EmbedBuilder()
                            .setAuthor({ name: "中華職棒", url:"https://www.cpbl.com.tw", iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"})
                            .setTitle(`[${game[i].gameType == 'C' || 'E' || 'F' ? `GAME ${game[i].gameSNo}` : game[i].gameSNo.toString().padStart(3,'0')}] ${game[i].awayTeam} vs. ${game[i].homeTeam}`)
                            .setDescription(`# 賽事已延賽`)
                            .setColor('Red')
                            .setFooter({ text: `🏟️ ${game[i].place}棒球場 ◉ ${gameType(game[i].gameType)}` })
                        game_embed_list.push(postPoned_Embed);
                        break;
                    case 7:
                        // 保留比賽
                        const savaGame_Embed = new EmbedBuilder()
                            .setAuthor({ name: "中華職棒", url:"https://www.cpbl.com.tw", iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"})
                            .setTitle(`[${game[i].gameType == 'C' || 'E' || 'F' ? `GAME ${game[i].gameSNo}` : game[i].gameSNo.toString().padStart(3,'0')}] ${game[i].awayTeam} vs. ${game[i].homeTeam}`)
                            .setDescription(`# ${teamIcon(game[i].awayTeam)} \`${game[i].awayScore}\` ${game[i].inning + game[i].inning_top_bot == 1 ? "上" : "下"} \`${game[i].homeScore}\` ${teamIcon(game[i].homeTeam)}\n## 保留比賽`)
                            .setColor('Yellow')
                            .addFields([
                                { name: "投手", value: `${teamIcon(game[i].pitcher_team)} [${game[i].pitcher_no + " " + game[i].pitcher_name}](https://www.cpbl.com.tw/team/person?acnt=${game[i].pitcher_Acnt})`, inline: true },
                                { name: "** **", value: "** **", inline: true },
                                { name: "打者", value: `${teamIcon(game[i].hitter_team)} [${game[i].hitter_no + " " + game[i].hitter_name}](https://www.cpbl.com.tw/team/person?acnt=${game[i].hitter_Acnt})`, inline: true },
                                { name: "好球-壞球", value: `${game[i].strike_cnt}-${game[i].ball_cnt}`, inline: true },
                                { name: "出局數", value: `${game[i].out_cnt}`, inline: true },
                                { name: "投手球數", value: `${game[i].pitch_cnt} 球`, inline: true },
                            ])
                            .setFooter({ text: `🏟️ ${game[i].place}棒球場 ◉ ${gameType(game[i].gameType)}` })
                        game_embed_list.push(savaGame_Embed);
                        break;
                    case 8:
                        // 比賽暫停
                        const stopGame_Embed = new EmbedBuilder()
                            .setAuthor({ name: "中華職棒", url:"https://www.cpbl.com.tw", iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"})
                            .setTitle(`[${game[i].gameType == 'C' || 'E' || 'F' ? `GAME ${game[i].gameSNo}` : game[i].gameSNo.toString().padStart(3,'0')}] ${game[i].awayTeam} vs. ${game[i].homeTeam}`)
                            .setDescription(`# ${teamIcon(game[i].awayTeam)} \`${game[i].awayScore}\` ${game[i].inning + game[i].inning_top_bot == 1 ? "上" : "下"} \`${game[i].homeScore}\` ${teamIcon(game[i].homeTeam)}\n## 比賽暫停`)
                            .setColor('Orange')
                            .addFields([
                                { name: "投手", value: `${teamIcon(game[i].pitcher_team)} [${game[i].pitcher_no + " " + game[i].pitcher_name}](https://www.cpbl.com.tw/team/person?acnt=${game[i].pitcher_Acnt})`, inline: true },
                                { name: "** **", value: "** **", inline: true },
                                { name: "打者", value: `${teamIcon(game[i].hitter_team)} [${game[i].hitter_no + " " + game[i].hitter_name}](https://www.cpbl.com.tw/team/person?acnt=${game[i].hitter_Acnt})`, inline: true },
                                { name: "好球-壞球", value: `${game[i].strike_cnt}-${game[i].ball_cnt}`, inline: true },
                                { name: "出局數", value: `${game[i].out_cnt}`, inline: true },
                                { name: "投手球數", value: `${game[i].pitch_cnt} 球`, inline: true },
                            ])
                            .setFooter({ text: `🏟️ ${game[i].place}棒球場 ◉ ${gameType(game[i].gameType)}` })
                        game_embed_list.push(stopGame_Embed);
                        break;
                }
            }
        }
        const SuccessMessage = await interaction.editReply({
            embeds: game_embed_list
        });
    }
}