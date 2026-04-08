const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const { teamIcon, gameType } = require("../../types/cpblType.js");

const fetchCPBLScore = async () => {
  try {
    const response = await fetch("https://www.cpbl.com.tw/home/getdetaillist", {
      method: "POST",
    });
    const data = await response.json();
    let game_detail;
    const gameArray = [];

    if (data.GameDetailJson !== null) {
      game_detail = JSON.parse(data.GameDetailJson);
    } else if (data.GameADetailJson !== null) {
      game_detail = JSON.parse(data.GameADetailJson);
    } else if (data.GameDDetailJson !== null) {
      game_detail = JSON.parse(data.GameDDetailJson);
    } else {
      return new Error("Game Not Found");
    }

    if (game_detail === null) {
      return new Error("Game Not Found");
    } else {
      game_detail.forEach((game) => {
        gameArray.push({
          gameSNo: game?.GameSno,
          gameStatus: game?.GameStatus,
          gameType: game?.KindCode,

          awayTeam: game?.VisitingTeamName,
          homeTeam: game?.HomeTeamName,
          awayScore:
            game?.VisitingTotalScore == null ? "0" : game?.VisitingTotalScore,
          homeScore: game?.HomeTotalScore == null ? "0" : game?.HomeTotalScore,
          awayTeam_code: game?.VisitingTeamCode,
          homeTeam_code: game?.HomeTeamCode,
          awayTeam_W: game?.VisitingGameResultWCnt,
          awayTeam_L: game?.VisitingGameResultLCnt,
          awayTeam_T: game?.VisitingGameResultTCnt,
          homeTeam_W: game?.HomeGameResultWCnt,
          homeTeam_L: game?.HomeGameResultLCnt,
          homeTeam_T: game?.HomeGameResultTCnt,

          place: game?.FieldAbbe,
          place_time: game?.PreExeDate,
          weather: game?.WeatherCode, // [晴, 陰, 多雲, 雨]
          weather_description: game?.WeatherDesc,
          inning: game?.CurtBatting?.InningSeq,
          inning_top_bot: game?.CurtBatting?.VisitingHomeType,
          schedule: game?.GameStatusChi,
          isTemporary: game?.IsTemporary,

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
          hitter_team:
            game?.CurtBatting?.VisitingHomeType == 1
              ? game.VisitingTeamCode
              : game.HomeTeamCode,

          pitcher_no: game?.CurtBatting?.PitcherUniformNo,
          pitcher_name: game?.CurtBatting?.PitcherName,
          pitcher_Acnt: game?.CurtBatting?.PitcherAcnt,
          pitcher_team:
            game?.CurtBatting?.VisitingHomeType == 1
              ? game.HomeTeamCode
              : game.VisitingTeamCode,

          wins_pitcher_name: game?.WinningPitcherName,
          wins_pitcher_Acnt: game?.WinningPitcherAcnt,
          wins_pitcher_team:
            game?.WinningType == 1 ? game.VisitingTeamCode : game.HomeTeamCode,

          loses_pitcher_name: game?.LosePitcherName,
          loses_pitcher_Acnt: game?.LosePitcherAcnt,
          loses_pitcher_team:
            game?.WinningType == 1 ? game.HomeTeamCode : game.VisitingTeamCode,

          closer_pitcher_name: game?.CloserPitcherName,
          closer_pitcher_Acnt: game?.CloserPitcherAcnt,
          closer_pitcher_team:
            game?.WinningType == 1 ? game.VisitingTeamCode : game.HomeTeamCode,
        });
      });
    }
    return gameArray;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const weatherToEmoji = (weather) => {
  switch (weather) {
    case 1:
      return "☀️";
    case 2:
      return "☁️";
    case 3:
      return "🌥️";
    case 4:
      return "🌧️";
    default:
      return "";
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cpbl_score")
    .setNameLocalizations({
      "zh-TW": "中華職棒即時比分",
    })
    .setDescription("中華職棒即時比分"),

  async execute(interaction) {
    await interaction.deferReply({
      withResponse: true,
      flags: MessageFlags.Ephemeral,
    });

    const game_embed_list = [];
    const game = await fetchCPBLScore();

    if (!game) {
      await interaction.editReply(`# 🚨：API擷取發生錯誤請回報`);
      return;
    } else if (game instanceof Error) {
      await interaction.editReply(`# ❌：目前無賽事資料`);
      return;
    }
    // 判定有無賽事
    if (game.length === 0) {
      const nullGameEmbed = new EmbedBuilder()
        .setTitle("無比賽數據")
        .setColor("Red");
      game_embed_list.push(nullGameEmbed);
    } else {
      for (let i = 0; i < game.length; i++) {
        switch (game[i].gameStatus) {
          case 1:
            // 如有需要才進行 或 比賽尚未開始
            const ifNeededGame_Embed = new EmbedBuilder()
              .setAuthor({
                name: "中華職棒",
                url: "https://www.cpbl.com.tw",
                iconURL:
                  "https://www.cpbl.com.tw/theme/common/images/project/logo_new.png",
              })
              .setTitle(
                `[${game[i].gameType == "C" || "E" || "F"
                  ? `GAME ${game[i].gameSNo}`
                  : game[i].gameSNo.toString().padStart(3, "0")
                }] ${teamIcon(game[i].awayTeam)} vs. ${teamIcon(
                  game[i].homeTeam
                )}  ${weatherToEmoji(game[i].weather)}`
              )
              .setDescription(
                `
                ${game[i].isTemporary === "Y"
                  ? `# 如有需要才進行`
                  : "# 比賽尚未開始"
                }
                > 預定於 **<t:${new Date(game[i].place_time) / 1000
                }>**__(<t:${new Date(game[i].place_time) / 1000
                }:R>)__ 開始
                            `
              )
              .setFooter({
                text: `🏟️ ${game[i].place}棒球場 • ${gameType(
                  game[i].gameType
                )}`,
              });

            if (game[i].isTemporary !== "Y") {
              ifNeededGame_Embed.addFields([
                {
                  name: "客隊先發投手",
                  value:
                    game[i].away_sp_Acnt == ""
                      ? "未公布"
                      : `${teamIcon(game[i].awayTeam_code)} [${game[i].away_sp_name
                      }](https://www.cpbl.com.tw/team/person?acnt=${game[i].away_sp_Acnt
                      })`,
                  inline: true,
                },
                {
                  name: "主隊先發投手",
                  value:
                    game[i].home_sp_Acnt == ""
                      ? "未公布"
                      : `${teamIcon(game[i].homeTeam_code)} [${game[i].home_sp_name
                      }](https://www.cpbl.com.tw/team/person?acnt=${game[i].home_sp_Acnt
                      })`,
                  inline: true,
                },
                { name: "** **", value: "** **", inline: true },
                {
                  name: "客隊勝敗和",
                  value: `${game[i].awayTeam_W}-${game[i].awayTeam_L}-${game[i].awayTeam_T}`,
                  inline: true,
                },
                {
                  name: "主隊勝敗和",
                  value: `${game[i].homeTeam_W}-${game[i].homeTeam_L}-${game[i].homeTeam_T}`,
                  inline: true,
                },
              ]);
            }

            if (
              game[i].weather_description !== null &&
              game[i].weather_description !== ""
            ) {
              ifNeededGame_Embed.addFields(
                { name: "** **", value: "** **", inline: true },
                {
                  name: "氣溫",
                  value: `${game[i].weather_description
                    .split("。")[2]
                    .replace(/[^\d]/g, " ")
                    .split(" ")[2]
                    }°C ~ ${game[i].weather_description
                      .split("。")[2]
                      .replace(/[^\d]/g, " ")
                      .split(" ")[3]
                    } °C (${game[i].weather_description.split("。")[3]})`,
                  inline: true,
                },
                {
                  name: "降雨機率",
                  value: `${game[i].weather_description
                    .split("。")[1]
                    .replace(/[^\d]/g, "")} %`,
                  inline: true,
                }
              );
            }
            game_embed_list.push(ifNeededGame_Embed);
            break;
          case 2:
            // 比賽中
            const playBall_Embed = new EmbedBuilder()
              .setAuthor({
                name: "中華職棒",
                url: "https://www.cpbl.com.tw",
                iconURL:
                  "https://www.cpbl.com.tw/theme/common/images/project/logo_new.png",
              })
              .setTitle(
                `[${game[i].gameType == "C" || "E" || "F"
                  ? `GAME ${game[i].gameSNo}`
                  : game[i].gameSNo.toString().padStart(3, "0")
                }] ${game[i].awayTeam} vs. ${game[i].homeTeam}`
              )
              .setDescription(
                `# ${teamIcon(game[i].awayTeam)} \`${game[i].awayScore}\` ${game[i].inning
                }${game[i].inning_top_bot == 1 ? "上" : "下"} \`${game[i].homeScore
                }\` ${teamIcon(game[i].homeTeam)}`
              )
              .setColor("Green")
              .addFields([
                {
                  name: "投手",
                  value: `${teamIcon(game[i].pitcher_team)} [${game[i].pitcher_no + " " + game[i].pitcher_name
                    }](https://www.cpbl.com.tw/team/person?acnt=${game[i].pitcher_Acnt
                    })`,
                  inline: true,
                },
                { name: "** **", value: "** **", inline: true },
                {
                  name: "打者",
                  value: `${teamIcon(game[i].hitter_team)} [${game[i].hitter_no + " " + game[i].hitter_name
                    }](https://www.cpbl.com.tw/team/person?acnt=${game[i].hitter_Acnt
                    })`,
                  inline: true,
                },
                {
                  name: "好球-壞球",
                  value: `${game[i].strike_cnt}-${game[i].ball_cnt}`,
                  inline: true,
                },
                { name: "出局數", value: `${game[i].out_cnt}`, inline: true },
                {
                  name: "投手球數",
                  value: `${game[i].pitch_cnt} 球`,
                  inline: true,
                },
              ])
              .setFooter({
                text: `🏟️ ${game[i].place}棒球場 • ${gameType(
                  game[i].gameType
                )}`,
              });
            game_embed_list.push(playBall_Embed);
            break;
          case 3:
            // 比賽結束
            const endGame_Embed = new EmbedBuilder()
              .setAuthor({
                name: "中華職棒",
                url: "https://www.cpbl.com.tw",
                iconURL:
                  "https://www.cpbl.com.tw/theme/common/images/project/logo_new.png",
              })
              .setTitle(
                `[${game[i].gameType == "C" || "E" || "F"
                  ? `GAME ${game[i].gameSNo}`
                  : game[i].gameSNo.toString().padStart(3, "0")
                }] 比賽結束`
              )
              .setDescription(
                `# ${teamIcon(game[i].awayTeam)} \`${game[i].awayScore
                }\` vs. \`${game[i].homeScore}\` ${teamIcon(game[i].homeTeam)}`
              )
              .setColor("Red")
              .addFields([
                {
                  name: "勝投",
                  value:
                    game[i].wins_pitcher_name == ""
                      ? "無"
                      : `${teamIcon(game[i].wins_pitcher_team)} [${game[i].wins_pitcher_name
                      }](https://www.cpbl.com.tw/team/person?acnt=${game[i].wins_pitcher_Acnt
                      })`,
                  inline: true,
                },
                {
                  name: "敗投",
                  value:
                    game[i].loses_pitcher_name == ""
                      ? "無"
                      : `${teamIcon(game[i].loses_pitcher_team)} [${game[i].loses_pitcher_name
                      }](https://www.cpbl.com.tw/team/person?acnt=${game[i].loses_pitcher_Acnt
                      })`,
                  inline: true,
                },
                { name: "** **", value: "** **", inline: true },
              ])
              .setFooter({
                text: `🏟️ ${game[i].place}棒球場 • ${gameType(
                  game[i].gameType
                )}`,
              });

            if (game[i].closer_pitcher_name != "") {
              endGame_Embed.addFields({
                name: "救援",
                value: `${teamIcon(game[i].closer_pitcher_team)} [${game[i].closer_pitcher_name
                  }](https://www.cpbl.com.tw/team/person?acnt=${game[i].closer_pitcher_Acnt
                  })`,
                inline: true,
              });
            }
            endGame_Embed.addFields([
              {
                name: "客隊勝敗和",
                value: `${game[i].awayTeam_W}-${game[i].awayTeam_L}-${game[i].awayTeam_T}`,
                inline: true,
              },
              {
                name: "主隊勝敗和",
                value: `${game[i].homeTeam_W}-${game[i].homeTeam_L}-${game[i].homeTeam_T}`,
                inline: true,
              },
            ]);
            game_embed_list.push(endGame_Embed);
            break;
          case 4:
            // 先發打序
            const startingOrder_Embed = new EmbedBuilder()
              .setAuthor({
                name: "中華職棒",
                url: "https://www.cpbl.com.tw",
                iconURL:
                  "https://www.cpbl.com.tw/theme/common/images/project/logo_new.png",
              })
              .setTitle(
                `[${game[i].gameType == "C" || "E" || "F"
                  ? `GAME ${game[i].gameSNo}`
                  : game[i].gameSNo.toString().padStart(3, "0")
                }] 先發打序`
              )
              .setDescription(
                `# ${teamIcon(game[i].awayTeam)} vs. ${teamIcon(
                  game[i].homeTeam
                )}`
              )
              .setColor("Aqua")
              .addFields([
                {
                  name: "客隊先發投手",
                  value:
                    game[i].away_sp_Acnt == ""
                      ? "未公布"
                      : `${teamIcon(game[i].awayTeam_code)} [${game[i].away_sp_name
                      }](https://www.cpbl.com.tw/team/person?acnt=${game[i].away_sp_Acnt
                      })`,
                  inline: true,
                },
                {
                  name: "主隊先發投手",
                  value:
                    game[i].home_sp_Acnt == ""
                      ? "未公布"
                      : `${teamIcon(game[i].homeTeam_code)} [${game[i].home_sp_name
                      }](https://www.cpbl.com.tw/team/person?acnt=${game[i].home_sp_Acnt
                      })`,
                  inline: true,
                },
                { name: "** **", value: "** **", inline: true },
                {
                  name: "客隊勝敗和",
                  value: `${game[i].awayTeam_W}-${game[i].awayTeam_L}-${game[i].awayTeam_T}`,
                  inline: true,
                },
                {
                  name: "主隊勝敗和",
                  value: `${game[i].homeTeam_W}-${game[i].homeTeam_L}-${game[i].homeTeam_T}`,
                  inline: true,
                },
              ])
              .setFooter({
                text: `🏟️ ${game[i].place}棒球場 • ${gameType(
                  game[i].gameType
                )}`,
              });
            game_embed_list.push(startingOrder_Embed);
            break;
          case 5:
            // 取消比賽
            const cancelGame_Embed = new EmbedBuilder()
              .setAuthor({
                name: "中華職棒",
                url: "https://www.cpbl.com.tw",
                iconURL:
                  "https://www.cpbl.com.tw/theme/common/images/project/logo_new.png",
              })
              .setTitle(
                `[${game[i].gameType == "C" || "E" || "F"
                  ? `GAME ${game[i].gameSNo}`
                  : game[i].gameSNo.toString().padStart(3, "0")
                }] ${game[i].awayTeam} vs. ${game[i].homeTeam}`
              )
              .setDescription(`# 賽事已取消`)
              .setColor("DarkRed")
              .setFooter({
                text: `🏟️ ${game[i].place}棒球場 • ${gameType(
                  game[i].gameType
                )}`,
              });
            game_embed_list.push(cancelGame_Embed);
            break;
          case 6:
            // 延賽
            const postPoned_Embed = new EmbedBuilder()
              .setAuthor({
                name: "中華職棒",
                url: "https://www.cpbl.com.tw",
                iconURL:
                  "https://www.cpbl.com.tw/theme/common/images/project/logo_new.png",
              })
              .setTitle(
                `[${game[i].gameType == "C" || "E" || "F"
                  ? `GAME ${game[i].gameSNo}`
                  : game[i].gameSNo.toString().padStart(3, "0")
                }] ${game[i].awayTeam} vs. ${game[i].homeTeam}`
              )
              .setDescription(`# 賽事已延賽`)
              .setColor("Red")
              .setFooter({
                text: `🏟️ ${game[i].place}棒球場 • ${gameType(
                  game[i].gameType
                )}`,
              });
            game_embed_list.push(postPoned_Embed);
            break;
          case 7:
            // 保留比賽
            const savaGame_Embed = new EmbedBuilder()
              .setAuthor({
                name: "中華職棒",
                url: "https://www.cpbl.com.tw",
                iconURL:
                  "https://www.cpbl.com.tw/theme/common/images/project/logo_new.png",
              })
              .setTitle(
                `[${game[i].gameType == "C" || "E" || "F"
                  ? `GAME ${game[i].gameSNo}`
                  : game[i].gameSNo.toString().padStart(3, "0")
                }] ${game[i].awayTeam} vs. ${game[i].homeTeam}`
              )
              .setDescription(
                `# ${teamIcon(game[i].awayTeam)} \`${game[i].awayScore}\` ${game[i].inning
                }${game[i].inning_top_bot == 1 ? "上" : "下"} \`${game[i].homeScore
                }\` ${teamIcon(game[i].homeTeam)}\n## 保留比賽`
              )
              .setColor("Yellow")
              .addFields([
                {
                  name: "投手",
                  value: `${teamIcon(game[i].pitcher_team)} [${game[i].pitcher_no + " " + game[i].pitcher_name
                    }](https://www.cpbl.com.tw/team/person?acnt=${game[i].pitcher_Acnt
                    })`,
                  inline: true,
                },
                { name: "** **", value: "** **", inline: true },
                {
                  name: "打者",
                  value: `${teamIcon(game[i].hitter_team)} [${game[i].hitter_no + " " + game[i].hitter_name
                    }](https://www.cpbl.com.tw/team/person?acnt=${game[i].hitter_Acnt
                    })`,
                  inline: true,
                },
                {
                  name: "好球-壞球",
                  value: `${game[i].strike_cnt}-${game[i].ball_cnt}`,
                  inline: true,
                },
                { name: "出局數", value: `${game[i].out_cnt}`, inline: true },
                {
                  name: "投手球數",
                  value: `${game[i].pitch_cnt} 球`,
                  inline: true,
                },
              ])
              .setFooter({
                text: `🏟️ ${game[i].place}棒球場 • ${gameType(
                  game[i].gameType
                )}`,
              });
            game_embed_list.push(savaGame_Embed);
            break;
          case 8:
            // 比賽暫停
            const stopGame_Embed = new EmbedBuilder()
              .setAuthor({
                name: "中華職棒",
                url: "https://www.cpbl.com.tw",
                iconURL:
                  "https://www.cpbl.com.tw/theme/common/images/project/logo_new.png",
              })
              .setTitle(
                `[${game[i].gameType == "C" || "E" || "F"
                  ? `GAME ${game[i].gameSNo}`
                  : game[i].gameSNo.toString().padStart(3, "0")
                }] ${game[i].awayTeam} vs. ${game[i].homeTeam}`
              )
              .setDescription(
                `# ${teamIcon(game[i].awayTeam)} \`${game[i].awayScore}\` ${game[i].inning
                }${game[i].inning_top_bot == 1 ? "上" : "下"} \`${game[i].homeScore
                }\` ${teamIcon(game[i].homeTeam)}\n## 比賽暫停`
              )
              .setColor("Orange")
              .addFields([
                {
                  name: "投手",
                  value: `${teamIcon(game[i].pitcher_team)} [${game[i].pitcher_no + " " + game[i].pitcher_name
                    }](https://www.cpbl.com.tw/team/person?acnt=${game[i].pitcher_Acnt
                    })`,
                  inline: true,
                },
                { name: "** **", value: "** **", inline: true },
                {
                  name: "打者",
                  value: `${teamIcon(game[i].hitter_team)} [${game[i].hitter_no + " " + game[i].hitter_name
                    }](https://www.cpbl.com.tw/team/person?acnt=${game[i].hitter_Acnt
                    })`,
                  inline: true,
                },
                {
                  name: "好球-壞球",
                  value: `${game[i].strike_cnt}-${game[i].ball_cnt}`,
                  inline: true,
                },
                { name: "出局數", value: `${game[i].out_cnt}`, inline: true },
                {
                  name: "投手球數",
                  value: `${game[i].pitch_cnt} 球`,
                  inline: true,
                },
              ])
              .setFooter({
                text: `🏟️ ${game[i].place}棒球場 • ${gameType(
                  game[i].gameType
                )}`,
              });
            game_embed_list.push(stopGame_Embed);
            break;
        }
      }
    }
    await interaction.editReply({
      embeds: game_embed_list,
    });
  },
};
