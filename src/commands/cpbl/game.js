const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const cheerio = require('cheerio');

const teamIcon = (team_name) => {
    try {
        const icon = {
            "中信兄弟": "<:cpbl_B:914141522541297696>",
            "味全龍": "<:cpbl_D:1033396051224305734>",
            "富邦悍將": "<:cpbl_G:1033396049227829331>",
            "統一7-ELEVEn獅": "<:cpbl_L:1033396606491431012>",
            "樂天桃猿": "<:cpbl_R:1033396046849646654>",
            "台鋼雄鷹": "<:cpbl_T:1273206632150470678>",
            "三商": "<:cpbl_Tiger:1275824989441888266>",
            "兄弟": "<:cpbl_B_O:1275825371744571455>",
            "時報": "<:cpbl_E:1275825666914386065>",
            "俊國": "<:cpbl_Bears:1275825871898411100>",
            "興農": "<:cpbl_S:1275826268700672041>",
            "中信": "<:cpbl_W:1275826947745775728>",
            "第一": "<:cpbl_L:1275827544351965194>",
            "誠泰": "<:cpbl_C:1275827950838874122>",
            "Lamigo": "<:cpbl_Lamigo:1275828301214253138>",
            "米迪亞": "<:cpbl_T_REX:1275828691842371704>",
            "義大": "<:cpbl_Rhino:1275828995019247770>",
        };
        
        return icon[team_name] || " ";
    } catch (error) {
        return " ";
    }
}

const fetchCPBLPlayer = async(acnt) => {
    if(acnt === undefined) return;
    const response = await fetch(`https://www.cpbl.com.tw/team/person?Acnt=${acnt}`, { method: 'GET'});
    const data = await response.text();
    const $ = cheerio.load(data);

    const playerData = [];

    $('.PlayerBrief').each((i, elem) => {
        const image_regex = /\((.*?)\)/;
        const url = $(elem).find('.img span').attr('style').match(image_regex);

        playerData.push({
            imageURL: url[1],
        })
    })

    return playerData;
}

const fetchCPBLGame = async(game_number, game_year, game_type) => {
    const response = await fetch(`https://www.cpbl.com.tw/box/getlive?year=${game_year}&kindCode=${game_type}&gameSno=${game_number}`, { method: 'POST' });
    const data = await response.json();
    const game = JSON.parse(data.CurtGameDetailJson); 
    const game_Scoreboard = JSON.parse(data.ScoreboardJson); // 計分表

    const gameScoreBoardArray = [];
    
    return {
        // 賽事資訊
        gameSNo: game?.GameSno,                     //賽事編號
        gameStatus: game?.GameStatus,               //賽事狀態
        gameType: game?.KindCode,
        gameDuringTime: game?.GameDuringTime,
        gameAudience_cnt: game?.AudienceCnt,
        gameAudienceIsFull: game?.IsFull,
        gameTimeS: game?.GameDateTimeS,
        gameTimeE: game?.GameDateTimeE,

        // 主客隊資料數據
        awayTeam: game?.VisitingTeamName,            //客隊隊名
        homeTeam: game?.HomeTeamName,                //主隊隊名
        awayScore: game?.VisitingTotalScore,         //客隊分數
        homeScore: game?.HomeTotalScore,             //主隊分數
        awayTeam_code: game?.VisitingTeamCode,       //
        homeTeam_code: game?.HomeTeamCode,
        awayTeam_W: game?.VisitingGameResultWCnt,
        awayTeam_L: game?.VisitingGameResultLCnt,
        awayTeam_T: game?.VisitingGameResultTCnt,
        homeTeam_W: game?.HomeGameResultWCnt,
        homeTeam_L: game?.HomeGameResultLCnt,
        homeTeam_T: game?.HomeGameResultTCnt,

        // 場地/時間/局數
        place: game?.FieldAbbe,
        place_time: game?.PreExeDate,
        inning: game?.CurtBatting?.InningSeq,
        inning_top_bot: game?.CurtBatting?.VisitingHomeType,
        schedule: game?.GameStatusChi,

        // 先發投手
        away_sp_name: game?.VisitingFirstMover,
        away_sp_Acnt: game?.VisitingFirstAcnt,
        home_sp_name: game?.HomeFirstMover,
        home_sp_Acnt: game?.HomeFirstAcnt,

        // SBOP數據
        strike_cnt: game?.CurtBatting?.StrikeCnt,
        ball_cnt: game?.CurtBatting?.BallCnt,
        out_cnt: game?.CurtBatting?.OutCnt,
        pitch_cnt: game?.CurtBatting?.PitchCnt,

        // 目前打者
        hitter_no: game?.CurtBatting?.HitterUniformNo,
        hitter_name: game?.CurtBatting?.HitterName,
        hitter_Acnt: game?.CurtBatting?.HitterAcnt,
        hitter_team: game?.CurtBatting?.VisitingHomeType == 1 ? game.VisitingTeamCode : game.HomeTeamCode,

        // 目前投手
        pitcher_no: game?.CurtBatting?.PitcherUniformNo,
        pitcher_name: game?.CurtBatting?.PitcherName,
        pitcher_Acnt: game?.CurtBatting?.PitcherAcnt,
        pitcher_team: game?.CurtBatting?.VisitingHomeType == 1 ? game.HomeTeamCode : game.VisitingTeamCode,

        // 勝利投手
        wins_pitcher_name: game?.WinningPitcherName,
        wins_pitcher_cnt: game?.WinningPitcherAcnt,
        wins_pitcher_team: game?.WinningType == 1 ? game.VisitingTeamCode : game.HomeTeamCode,

        // 敗戰投手
        loses_pitcher_name: game?.LosePitcherName,
        loses_pitcher_Acnt: game?.LosePitcherAcnt,
        loses_pitcher_team: game?.WinningType == 1 ? game.HomeTeamCode : game.VisitingTeamCode,

        // MVP
        mvp_name: game?.HitterName == '' ? game?.PitcherName : game?.HitterName,
        mvp_Acnt: game?.HitterAcnt == '' ? game?.PitcherAcnt : game?.HitterAcnt,
        mvp_cnt: game?.MvpCnt,

        // 打者MVP
        hit_cnt: game?.HitCnt,
        runBattedIn_cnt: game?.RunBattedInCnt,
        score_cnt: game?.ScoreCnt,
        hitting_cnt: game?.HittingCnt,
        homerun_cnt: game?.HomeRunCnt,

        // 投手MVP
        inningPitched_cnt: game?.InningPitchedCnt,
        inningPitchedDiv3_cnt: game?.InningPitchedDiv3Cnt,
        strikeOut_cnt: game?.StrikeOutCnt,
        run_cnt: game?.RunCnt,

        // 裁判
        headUmpire: game?.HeadUmpire,
        oneBaseReferee: game?.OneBaseReferee,
        twoBaseRederee: game?.TwoBaseReferee,
        threeBaseReferee: game?.TrheeBaseReferee,
        leftFieldReferee: game?.LeftFieldReferee == '' ? "無" : game?.LeftFieldReferee,
        rightFieldReferee: game?.RightFieldReferee == '' ? "無" : game?.RightFieldReferee,

        gameScoreBoardArray,
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cpbl_game')
        .setNameLocalizations({
            "zh-TW" : "中華職棒賽事",
        })
        .setDescription("查詢賽事詳細資訊")
        .addIntegerOption(option => (
            option
                .setName('game_year')
                .setNameLocalizations({
                    "zh-TW" : "比賽年份",
                })
                .setDescription("年份範圍：1990~至今")
                .setRequired(true)
                .setMinValue(1990)
                .setMaxValue(new Date().getFullYear())
        ))
        .addIntegerOption(option => (
            option
                .setName('game_number')
                .setNameLocalizations({
                    "zh-TW" : "比賽編號",
                })
                .setDescription("場次範圍：1~360")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(360)
        ))
        .addStringOption(option => (
            option
                .setName("type")
                .setNameLocalizations({
                    "zh-TW": "賽事類型",
                })
                .setDescription("一軍例行賽、一軍明星賽、一軍總冠軍賽、二軍例行賽、一軍季後挑戰賽、二軍總冠軍賽、一軍熱身賽、未來之星邀請賽")
                .setRequired(true)
                .addChoices(
                    { name: '一軍例行賽', value: 'A' },
                    { name: '一軍熱身賽', value: 'G' },
                    { name: '一軍明星賽', value: 'B' },
                    { name: '一軍季後挑戰賽', value: 'E' },
                    { name: '一軍總冠軍賽', value: 'C' },
                    { name: '二軍例行賽', value: 'D' },
                    { name: '二軍總冠軍賽', value: 'F' },
                    { name: '未來之星邀請賽', value: 'H' },
                )
        )),

    async execute (interaction) {
        const WaitMessage = await interaction.deferReply({
            fetchReply: true,
            ephemeral: true
        });

        let game_number = interaction.options.getInteger('game_number');
        let game_year = interaction.options.getInteger('game_year');
        let game_type = interaction.options.getString('game_number');

        const game = await fetchCPBLGame(game_number, game_year, game_type);
        let player = null;

        if (!game) {
            // 如果比賽尚未開始
            await interaction.editReply(`# 🚨：\`${game_year}\`年 比賽編號 \`${game_number}\` 尚未開始或無數據`);
            return;
        }

        const CpblGameDetailEmbed = new EmbedBuilder()
            .setAuthor({
                name: "中華職棒",
                url:"https://www.cpbl.com.tw",
                iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"
            })
            .setTitle(`${teamIcon(game.awayTeam)} ${game.awayTeam} vs. ${teamIcon(game.homeTeam)} ${game.homeTeam}`)
            .setDescription(
                `# <:cpbl_logo:1275836738304217181> ${game.inning.map(i => `\`${i}\``).join(' ')} | \`R\` \`H\` \`E\`\n` +
                `# ${teamIcon(game.awayTeam)} ${game.awayScores.map(s => `\`${s}\``).join(' ')} | \`${game.awayTotal}\` \`${game.awayHit}\` \`${game.awayErr}\`\n` +
                `# ${teamIcon(game.homeTeam)} ${game.homeScores.map(s => `\`${s}\``).join(' ')} | \`${game.homeTotal}\` \`${game.homeHit}\` \`${game.homeErr}\``
            )
            .setColor("Green")
            .setFooter({
                text: `🏟️ ${game_year} • 第 ${game_number} 場次 • ${game.place}棒球場`,
            })
            .addFields([
                { name: "主審", value: game.headUmpire, inline: true },
                { name: "一壘審", value: game.oneBaseReferee, inline: true },
                { name: "二壘審", value: game.twoBaseRederee, inline: true },
                { name: "三壘審", value: game.threeBaseReferee, inline: true },
                { name: "左線審", value: game.leftFieldReferee, inline: true },
                { name: "右線審", value: game.rightFieldReferee, inline: true },
            ]);

        const CplbEmbeds = [CpblGameDetailEmbed];

            if (game.mvp_name) {
                player = await fetchCPBLPlayer(game.mvp_Acnt);
                const MVPEmbed = new EmbedBuilder();
                if(game.MVP_batter_pitcher.substring(0,2) === "打數"){
                    MVPEmbed
                    .setAuthor({
                        name: "MVP 最有價值球員",
                        url:"https://www.cpbl.com.tw",
                        iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"
                    })
                    .setDescription(`# ${teamIcon(winner_team)} [${game.mvp_name}](https://www.cpbl.com.tw${game.MVP_link})`)
                    .setThumbnail(player?.image_url || "")
                    .setColor("Gold")
                    .addFields([
                        { name: "當年度獲選MVP次數", value: game.MVP_year_count, inline:false },
                        { name: "打數", value: game.MVP_hit_count_IP, inline:true },
                        { name: "打點", value: game.MVP_hit_point_K, inline:true },
                        { name: "得分", value: game.MVP_get_score_R, inline:true },
                        { name: "安打", value: game.MVP_hit, inline:true },
                        { name: "全壘打", value: game.MVP_homerun, inline:true },
                    ])
                } else {
                    MVPEmbed
                    .setAuthor({
                        name: "MVP 最有價值球員",
                        url:"https://www.cpbl.com.tw",
                        iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"
                    })
                    .setDescription(`# ${teamIcon(winner_team)} [${game.MVP}](https://www.cpbl.com.tw${game.MVP_link})`)
                    .setThumbnail(player?.image_url || "")
                    .setColor("Gold")
                    .addFields([
                        { name: "當年度獲選MVP次數", value: game.MVP_year_count, inline:false },
                        { name: "投球局數", value: game.MVP_hit_count_IP, inline:true },
                        { name: "奪三振數", value: game.MVP_hit_point_K, inline:true },
                        { name: "失分數", value: game.MVP_get_score_R, inline:true },
                    ])
                }
        
                CplbEmbeds.push(MVPEmbed);
            }

        const SuccessMessage = await interaction.editReply({
            embeds : CplbEmbeds
        });
    }
}